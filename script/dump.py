import os
import sys
import time
import signal
import random
from datetime import datetime, timezone
import psycopg2
from psycopg2 import sql

# Database connection configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': int(os.environ.get('DB_PORT', 5433)),
    'database': os.environ.get('DB_NAME', 'db_terra_qatar'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', 'Tridel@qp@2025')
}

# Insertion interval in seconds
INTERVAL_SECONDS = int(os.environ.get('INTERVAL_SECONDS', 10))

# Fallback stations if tb_stations_config is empty
DEFAULT_STATIONS = [
    ('M22', '25.38772222', '51.54263889'),
    ('M10', '25.40786111', '51.54919444'),
    ('M29', '25.44044444', '51.54527778'),
    ('M40', '25.42191667', '51.52358333'),
    ('MX', '25.44875000', '51.56758333')
]

running = True

def handle_exit(signum, frame):
    global running
    print("\n[Shutdown] Received stop signal. Exiting gracefully...")
    running = False

signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)

def get_connection():
    """Connect to PostgreSQL with configured parameters."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        return conn
    except Exception as e:
        # If port 5433 failed and was the default, try 5432 as fallback
        if DB_CONFIG['port'] == 5433 and 'Connection refused' in str(e):
            try:
                fallback_config = dict(DB_CONFIG)
                fallback_config['port'] = 5432
                conn = psycopg2.connect(**fallback_config)
                conn.autocommit = False
                print("[Info] Connected using fallback port 5432.")
                return conn
            except Exception:
                pass
        raise e

def load_stations(conn):
    """Retrieve station metadata from tb_stations_config."""
    cur = conn.cursor()
    try:
        cur.execute("SELECT station_id, lat_dd, lon_dd FROM tb_stations_config ORDER BY id ASC")
        rows = cur.fetchall()
        if rows:
            print(f"[Init] Loaded {len(rows)} stations from tb_stations_config: {[r[0] for r in rows]}")
            return rows
    except Exception as err:
        conn.rollback()
        print(f"[Warning] Could not load tb_stations_config: {err}. Using default 5 stations.")
    finally:
        cur.close()
    return DEFAULT_STATIONS

def get_table_columns(conn, table_name):
    """Retrieve all writable column names for a given table."""
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = %s AND column_name != 'id'
            """,
            (table_name,)
        )
        return set(r[0] for r in cur.fetchall())
    finally:
        cur.close()

def generate_sensor_payload(station_id, base_lat, base_lon):
    """Generate realistic oceanic and meteorological measurement values."""
    now = datetime.now()
    now_tz = datetime.now(timezone.utc).astimezone()

    lat = float(base_lat) if base_lat else 25.38
    lon = float(base_lon) if base_lon else 51.54

    wind_speed = round(random.uniform(1.0, 15.0), 2)
    temp = round(random.uniform(24.0, 35.0), 2)
    wave_height = round(random.uniform(0.3, 2.5), 2)
    global_rad = round(random.uniform(0.0, 950.0), 2)
    vis = round(random.uniform(5.0, 20.0), 2)

    payload = {
        'station_id': station_id,
        'timestamp': now_tz,
        'datetime': now,
        'battery': round(random.uniform(11.8, 12.9), 2),
        'cam_img': 'assets/test.png',
        'lat': round(lat + random.uniform(-0.0001, 0.0001), 6),
        'lon': round(lon + random.uniform(-0.0001, 0.0001), 6),

        # Meteorological
        'wind_speed': wind_speed,
        'windspeed': wind_speed,
        'wind_direction_deg': round(random.uniform(0.0, 359.0), 2),
        'wind_gust': round(wind_speed + random.uniform(0.5, 4.0), 2),
        'temperature_deg': temp,
        'rh_percent': round(random.uniform(50.0, 95.0), 2),
        'bp_hpa': round(random.uniform(995.0, 1025.0), 2),
        'global_radiation': global_rad,
        'global': global_rad,
        'rain_mm': round(random.uniform(0.0, 2.0), 2),
        'visibility': vis,
        'visibility_nm': vis,

        # Waves
        'wave_heading': round(random.uniform(0.0, 359.0), 2),
        'wave_height': wave_height,
        'tzc': round(random.uniform(3.0, 8.0), 2),
        'tz': round(random.uniform(3.0, 8.0), 2),
        'tm02': round(random.uniform(3.0, 8.0), 2),
        'wave_direction': round(random.uniform(0.0, 359.0), 2),
        'wave_direction_fw': round(random.uniform(0.0, 359.0), 2),
        'mean_wave_direction': round(random.uniform(0.0, 359.0), 2),
        'hmax': round(wave_height + random.uniform(0.4, 2.0), 2),
        'havg': wave_height,
        'dominant_time_period_fw': round(random.uniform(4.0, 12.0), 2),
        'fourier_coefficient_a1': round(random.uniform(-1.0, 1.0), 2),
        'fourier_coefficient_b1': round(random.uniform(-1.0, 1.0), 2),
        'fourier_coefficient_a2': round(random.uniform(-1.0, 1.0), 2),
        'fourier_coefficient_b2': round(random.uniform(-1.0, 1.0), 2),

        # Water Quality
        'turbidity': round(random.uniform(5.0, 45.0), 2),
        'water_temperature': round(temp - random.uniform(1.0, 4.0), 2),
        'ph': round(random.uniform(7.8, 8.4), 2),
        'conductivity': round(random.uniform(35.0, 48.0), 2),
        'dissolved_oxygen': round(random.uniform(6.0, 9.0), 2),
        'salinity': round(random.uniform(32.0, 37.0), 2),
        'chlorophyll_a': round(random.uniform(0.5, 7.5), 2),

        # MicroFLU
        'phycoerythrin': round(random.uniform(0.1, 3.5), 2),
        'fluorescein_dye': round(random.uniform(0.0, 1.5), 2),
        'pah': round(random.uniform(0.0, 0.8), 2),
        'oil_in_water': round(random.uniform(0.0, 0.5), 2),
        'bt': round(random.uniform(0.0, 0.5), 2)
    }

    # ADCP Bins (1 to 10)
    for b in range(1, 11):
        payload[f'current_speed_bin_{b}'] = round(random.uniform(0.05, 2.0), 2)
        payload[f'current_direction_bin_{b}'] = round(random.uniform(0.0, 359.0), 2)

    return payload

def main():
    print("=" * 60)
    print(" Qatar Real-Time Station Data Inserter")
    print(f" Target Database: {DB_CONFIG['database']} @ {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f" Interval: Every {INTERVAL_SECONDS} seconds")
    print("=" * 60)

    conn = None
    table_columns_cache = {}

    while running:
        try:
            if conn is None or conn.closed != 0:
                print(f"[Connecting] Connecting to PostgreSQL at {DB_CONFIG['host']}:{DB_CONFIG['port']}...")
                conn = get_connection()
                print("[Connected] Successfully connected to PostgreSQL.")
                stations = load_stations(conn)
                table_columns_cache.clear()

            cur = conn.cursor()
            inserted_summary = []
            cycle_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            for station_id, lat_str, lon_str in stations:
                table_name = f"tb_buoy_{station_id.lower()}_measurements"

                if table_name not in table_columns_cache:
                    cols = get_table_columns(conn, table_name)
                    if not cols:
                        print(f"[Warning] Table {table_name} does not exist or has no columns. Skipping.")
                        continue
                    table_columns_cache[table_name] = cols

                valid_cols = table_columns_cache[table_name]
                payload = generate_sensor_payload(station_id, lat_str, lon_str)

                # Match payload fields to existing columns in the table
                record = {k: v for k, v in payload.items() if k in valid_cols}
                col_names = list(record.keys())
                col_values = list(record.values())

                insert_query = sql.SQL("INSERT INTO {table} ({fields}) VALUES ({values}) RETURNING id").format(
                    table=sql.Identifier(table_name),
                    fields=sql.SQL(', ').join(map(sql.Identifier, col_names)),
                    values=sql.SQL(', ').join(sql.Placeholder() * len(col_names))
                )

                cur.execute(insert_query, col_values)
                new_id = cur.fetchone()[0]
                inserted_summary.append(f"{station_id} (id={new_id})")

            conn.commit()
            cur.close()

            print(f"[{cycle_time}] ✅ Inserted data for {len(inserted_summary)} stations: {', '.join(inserted_summary)}")

        except psycopg2.OperationalError as op_err:
            print(f"[Error] Database operational error: {op_err}")
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass
                conn = None
            print("[Wait] Retrying connection in 5 seconds...")
            time.sleep(5)
            continue
        except Exception as e:
            if conn:
                conn.rollback()
            print(f"[Error] Unexpected error during insertion: {e}")

        # Sleep with 1-second ticks so Ctrl+C interrupt responds immediately
        for _ in range(INTERVAL_SECONDS):
            if not running:
                break
            time.sleep(1)

    if conn and conn.closed == 0:
        conn.close()
        print("[Disconnected] Database connection closed.")
    print("[Done] Inserter stopped.")

if __name__ == '__main__':
    main()
