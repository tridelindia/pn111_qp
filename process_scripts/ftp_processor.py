#!/usr/bin/env python3
"""
================================================================================
 Qatar Marine Monitoring - FTP Buoy Data Ingestion Service
================================================================================
Continuously listens to the PC system clock and runs ONLY at every hour's:
  Minute :02, :12, :22, :32, :42, :52

Station Folder to Database Table Mapping:
  - Folder 'M10' -> Table 'tb_buoy_m10_measurements'
  - Folder 'M22' -> Table 'tb_buoy_m22_measurements'
  - Folder 'M29' -> Table 'tb_buoy_m29_measurements'
  - Folder 'M40' -> Table 'tb_buoy_m40_measurements'
  - Folder 'MX'  -> Table 'tb_buoy_mx_measurements'

Tracking files (stored in process_scripts/):
  - processed.txt : valid files whose records were inserted into DB
  - invalid.txt   : corrupted/empty/non-TOA5 files
  - issue.txt     : valid CSV format but DB insert failed (connection/constraint)
================================================================================
"""

import os
import sys
import csv
import glob
import time
import ftplib
import signal
import logging
from datetime import datetime, timezone, timedelta
import psycopg2
from psycopg2 import sql

# ==============================================================================
# HARDCODED CONFIGURATION
# ==============================================================================

# 1. Database Connection Credentials
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': int(os.environ.get('DB_PORT', 5433)),
    'database': os.environ.get('DB_NAME', 'db_terra_qatar'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', 'Tridel@qp@2025')
}

# 2. FTP Connection Credentials
FTP_CONFIG = {
    'host': os.environ.get('FTP_HOST', 'ftp.trideltechnologiesindia.com'),
    'port': int(os.environ.get('FTP_PORT', 21)),
    'user': os.environ.get('FTP_USER', 'tridelftpind'),
    'password': os.environ.get('FTP_PASSWORD', 'Tridel@Ind'),
    'remote_dir': os.environ.get('FTP_DIR', ''),
    'use_tls': os.environ.get('FTP_TLS', 'false').lower() in ('true', '1')
}

# 3. Exact Clock Schedule (Minutes of Every Hour)
# Runs ONLY when the PC system clock hits these minutes:
SCHEDULED_MINUTES = [2, 12, 22, 32, 42, 52]

# Run immediately on startup ONLY if '--now' is passed in command line arguments,
# otherwise strictly wait for the next scheduled minute according to the PC clock.
RUN_ON_STARTUP = '--now' in sys.argv

# 4. Station Folder to Database Table Mapping
STATION_MAPPINGS = {
    'M10': {
        'folder': 'M10',
        'table': 'tb_buoy_m10_measurements',
        'default_lat': 25.40786111,
        'default_lon': 51.54919444,
    },
    'M22': {
        'folder': 'M22',
        'table': 'tb_buoy_m22_measurements',
        'default_lat': 25.38772222,
        'default_lon': 51.54263889,
    },
    'M29': {
        'folder': 'M29',
        'table': 'tb_buoy_m29_measurements',
        'default_lat': 25.44044444,
        'default_lon': 51.54527778,
    },
    'M40': {
        'folder': 'M40',
        'table': 'tb_buoy_m40_measurements',
        'default_lat': 25.42191667,
        'default_lon': 51.52358333,
    },
    'MX': {
        'folder': 'MX',
        'table': 'tb_buoy_mx_measurements',
        'default_lat': 25.44875000,
        'default_lon': 51.56758333,
    },
}

# 5. CSV Column to DB Column Mapping Dictionary
COLUMN_MAP = {
    # System / Power / Positioning
    'Batt_Volt_Min': ['battery'],
    'Volt': ['battery'],
    'Lat': ['lat'],
    'Longt': ['lon'],

    # Meteorology (Weather Sensor / Climatronics / Vaisala)
    'CC_Win_Spd': ['wind_speed', 'windspeed'],
    'CC_Win_Dir': ['wind_direction_deg'],
    'CC_Win_Spd_Max': ['wind_gust'],
    'Air_Temp_Avg': ['temperature_deg'],
    'Rl_Hum_Avg': ['rh_percent'],
    'Pressure_Avg': ['bp_hpa'],
    'Sol_Rad_Avg': ['global_radiation', 'global'],
    'Rain_mm_Tot': ['rain_mm'],
    'Avg_visi': ['visibility', 'visibility_nm'],
    'Ins_visi': ['visibility', 'visibility_nm'],

    # Water Quality (YSI / EXO / Idronaut)
    'WTemp_C': ['water_temperature'],
    'SpCond_uScm': ['conductivity'],
    'Sal_PSU': ['salinity'],
    'pH': ['ph'],
    'DO_mgL': ['dissolved_oxygen'],
    'Turb_NTU': ['turbidity'],
    'Chl_ugL': ['chlorophyll_a'],

    # MicroFLU (Hydrocarbons / Oil in Water / PAH)
    'Oil_mgL': ['oil_in_water'],
    'HC_proc': ['pah'],
    'HC_Avg': ['pah'],
    'HC': ['pah'],

    # Oceanographic Wave Parameters
    'Heading': ['wave_heading'],
    'Hs': ['wave_height'],
    'Hmax': ['hmax'],
    'Havg': ['havg'],
    'Tzc': ['tzc'],
    'Tmean': ['tz'],
    'AveragePeriodAPD': ['tm02'],
    'DominantPeriodFW': ['dominant_time_period_fw'],
    'WaveDirectionFW': ['wave_direction_fw', 'wave_direction'],
    'MeanWaveDir': ['mean_wave_direction'],

    # ADCP Current Profiler Bins (1 to 5)
    'Cell_1_Speed': ['current_speed_bin_1'],
    'Cell_1_Dir': ['current_direction_bin_1'],
    'Cell_2_Speed': ['current_speed_bin_2'],
    'Cell_2_Dir': ['current_direction_bin_2'],
    'Cell_3_Speed': ['current_speed_bin_3'],
    'Cell_3_Dir': ['current_direction_bin_3'],
    'Cell_4_Speed': ['current_speed_bin_4'],
    'Cell_4_Dir': ['current_direction_bin_4'],
    'Cell_5_Speed': ['current_speed_bin_5'],
    'Cell_5_Dir': ['current_direction_bin_5'],
}

# Base Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_FILE = os.path.join(SCRIPT_DIR, "processed.txt")
INVALID_FILE = os.path.join(SCRIPT_DIR, "invalid.txt")
ISSUE_FILE = os.path.join(SCRIPT_DIR, "issue.txt")


# ==============================================================================
# LOGGING SETUP
# ==============================================================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("BuoyFTPService")

service_running = True


def handle_shutdown(signum, frame):
    global service_running
    print("\n[Shutdown] Received exit signal. Stopping service gracefully...")
    service_running = False


signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)


# ==============================================================================
# TRACKING MANAGER
# ==============================================================================
class TrackingManager:
    """Tracks files across processed.txt, invalid.txt, and issue.txt."""

    def __init__(self, processed_path, invalid_path, issue_path):
        self.processed_path = processed_path
        self.invalid_path = invalid_path
        self.issue_path = issue_path

        for p in (self.processed_path, self.invalid_path, self.issue_path):
            if not os.path.exists(p):
                with open(p, 'w', encoding='utf-8') as f:
                    pass

        self.processed_set = self._load_file(self.processed_path)
        self.invalid_set = self._load_file(self.invalid_path)
        self.issue_set = self._load_file(self.issue_path)

    def _load_file(self, path):
        s = set()
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                for line in f:
                    entry = line.strip().split('|')[0].strip()
                    if entry:
                        s.add(entry)
                        s.add(os.path.basename(entry))
        return s

    def is_known(self, rel_path):
        base = os.path.basename(rel_path)
        return (
            rel_path in self.processed_set or base in self.processed_set or
            rel_path in self.invalid_set or base in self.invalid_set
        )

    def mark_processed(self, rel_path):
        base = os.path.basename(rel_path)
        self.processed_set.add(rel_path)
        self.processed_set.add(base)
        with open(self.processed_path, 'a', encoding='utf-8') as f:
            f.write(f"{rel_key_clean(rel_path)}\n")
        self._remove_from_issue(rel_path)

    def mark_invalid(self, rel_path, reason="Invalid format"):
        base = os.path.basename(rel_path)
        self.invalid_set.add(rel_path)
        self.invalid_set.add(base)
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.invalid_path, 'a', encoding='utf-8') as f:
            f.write(f"{rel_key_clean(rel_path)} | {ts} | {reason}\n")

    def mark_issue(self, rel_path, reason="DB Insert Failed"):
        base = os.path.basename(rel_path)
        self.issue_set.add(rel_path)
        self.issue_set.add(base)
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.issue_path, 'a', encoding='utf-8') as f:
            f.write(f"{rel_key_clean(rel_path)} | {ts} | {reason}\n")

    def _remove_from_issue(self, rel_path):
        base = os.path.basename(rel_path)
        if rel_path in self.issue_set or base in self.issue_set:
            self.issue_set.discard(rel_path)
            self.issue_set.discard(base)
            if os.path.exists(self.issue_path):
                with open(self.issue_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                with open(self.issue_path, 'w', encoding='utf-8') as f:
                    for line in lines:
                        entry = line.strip().split('|')[0].strip()
                        if entry != rel_path and entry != base:
                            f.write(line)


def rel_key_clean(p):
    return p.replace('\\', '/')


# ==============================================================================
# FTP FETCHER
# ==============================================================================
class FTPFetcher:
    """Connects to FTP and downloads new CSV files for each station."""

    def __init__(self, config):
        self.host = config.get('host', '').strip()
        self.port = config.get('port', 21)
        self.user = config.get('user', '').strip()
        self.password = config.get('password', '').strip()
        self.remote_dir = config.get('remote_dir', '').strip().rstrip('/')
        self.use_tls = config.get('use_tls', False)

    def is_configured(self):
        return bool(self.host)

    def fetch_station(self, station_name, local_dir, tracker):
        if not self.is_configured():
            return 0

        remote_folder = f"{self.remote_dir}/{station_name}" if self.remote_dir else f"/{station_name}"
        ftp = None
        new_downloads = 0

        try:
            ftp = ftplib.FTP_TLS() if self.use_tls else ftplib.FTP()
            ftp.connect(self.host, self.port, timeout=20)
            if self.user:
                ftp.login(self.user, self.password)
            else:
                ftp.login()

            if self.use_tls:
                ftp.prot_p()

            ftp.set_pasv(True)

            try:
                ftp.cwd(remote_folder)
            except ftplib.error_perm:
                logger.warning(f"[{station_name}] Remote folder '{remote_folder}' not found on FTP server.")
                return 0

            file_list = [f for f in ftp.nlst() if f.lower().endswith('.csv')]
            os.makedirs(local_dir, exist_ok=True)

            for fname in file_list:
                rel_key = f"{station_name}/{fname}"
                if tracker.is_known(rel_key):
                    continue

                local_path = os.path.join(local_dir, fname)
                try:
                    with open(local_path, 'wb') as lf:
                        ftp.retrbinary(f"RETR {fname}", lf.write)
                    new_downloads += 1
                    logger.info(f"[{station_name}] Downloaded from FTP: {fname}")
                except Exception as dl_err:
                    logger.error(f"[{station_name}] Error downloading {fname}: {dl_err}")

        except Exception as e:
            logger.error(f"[{station_name}] FTP connection error ({self.host}:{self.port}) - {e}")
        finally:
            if ftp:
                try:
                    ftp.quit()
                except Exception:
                    try:
                        ftp.close()
                    except Exception:
                        pass

        return new_downloads


# ==============================================================================
# CSV PARSER
# ==============================================================================
class BuoyCSVParser:
    """Validates and parses Campbell Scientific TOA5 CSV files."""

    @staticmethod
    def clean_number(val):
        if val is None:
            return None
        s = str(val).strip().strip('"').strip("'")
        if not s or s.upper() in ('NAN', 'INF', '-INF', 'NULL', 'NONE'):
            return None
        try:
            return float(s)
        except ValueError:
            return s

    @classmethod
    def parse(cls, file_path, station_id, default_lat, default_lon):
        if not os.path.exists(file_path):
            return 'INVALID', 'File not found'

        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return 'INVALID', 'Empty file (0 bytes)'

        if file_size < 30:
            return 'INVALID', f'File size too small ({file_size} bytes)'

        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.reader(f)
            try:
                line1_meta = next(reader)
                line2_headers = next(reader)
                line3_units = next(reader)
                line4_proc = next(reader)
            except StopIteration:
                return 'INVALID', 'Truncated header lines'

            if not line2_headers or 'TIMESTAMP' not in line2_headers:
                return 'INVALID', 'Missing TIMESTAMP column in header'

            ts_idx = line2_headers.index('TIMESTAMP')
            data_rows = list(reader)

            if not data_rows:
                return 'INVALID', 'No data rows found below headers'

            records = []
            for row in data_rows:
                if not row or len(row) <= ts_idx:
                    continue

                ts_str = row[ts_idx].strip().strip('"')
                dt = None
                for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M:%S.%f', '%Y/%m/%d %H:%M:%S'):
                    try:
                        dt = datetime.strptime(ts_str, fmt)
                        break
                    except ValueError:
                        pass

                if dt is None:
                    continue

                record = {
                    'station_id': station_id,
                    'datetime': dt,
                    'timestamp': dt.replace(tzinfo=timezone.utc),
                    'lat': default_lat,
                    'lon': default_lon,
                }

                for col_name, raw_val in zip(line2_headers, row):
                    cleaned = cls.clean_number(raw_val)
                    if cleaned is not None and col_name in COLUMN_MAP:
                        for db_field in COLUMN_MAP[col_name]:
                            record[db_field] = cleaned

                # If temperature_deg not set from air temp, fallback to PTemp_C if available
                if ('temperature_deg' not in record or record['temperature_deg'] is None) and 'PTemp_C' in line2_headers:
                    pt_idx = line2_headers.index('PTemp_C')
                    if pt_idx < len(row):
                        pt_val = cls.clean_number(row[pt_idx])
                        if pt_val is not None:
                            record['temperature_deg'] = pt_val

                records.append(record)

            if not records:
                return 'INVALID', 'No valid timestamp data rows found'

            return 'OK', records


# ==============================================================================
# DATABASE MANAGER
# ==============================================================================
class DatabaseManager:
    """Manages PostgreSQL connection and table inserts."""

    def __init__(self, config):
        self.config = config
        self.conn = None
        self.cols_cache = {}

    def get_conn(self):
        if self.conn is None or self.conn.closed != 0:
            self.conn = psycopg2.connect(**self.config)
            self.conn.autocommit = False
        return self.conn

    def get_columns(self, table_name):
        if table_name not in self.cols_cache:
            conn = self.get_conn()
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_name = %s AND column_name != 'id'
                """, (table_name,))
                self.cols_cache[table_name] = set(r[0] for r in cur.fetchall())
        return self.cols_cache[table_name]

    def record_exists(self, table_name, station_id, dt):
        conn = self.get_conn()
        with conn.cursor() as cur:
            cur.execute(
                sql.SQL("SELECT 1 FROM {tbl} WHERE station_id = %s AND datetime = %s LIMIT 1")
                .format(tbl=sql.Identifier(table_name)),
                (station_id, dt)
            )
            return cur.fetchone() is not None

    def insert_records(self, table_name, records):
        if not records:
            return 0

        conn = self.get_conn()
        valid_cols = self.get_columns(table_name)
        inserted = 0

        try:
            with conn.cursor() as cur:
                for rec in records:
                    st_id = rec.get('station_id')
                    dt = rec.get('datetime')

                    # Skip duplicate timestamp for this station
                    if self.record_exists(table_name, st_id, dt):
                        continue

                    row = {k: v for k, v in rec.items() if k in valid_cols and v is not None}
                    if not row:
                        continue

                    cols = list(row.keys())
                    vals = [row[c] for c in cols]

                    insert_query = sql.SQL("""
                        INSERT INTO {tbl} ({fields})
                        VALUES ({placeholders})
                    """).format(
                        tbl=sql.Identifier(table_name),
                        fields=sql.SQL(', ').join(map(sql.Identifier, cols)),
                        placeholders=sql.SQL(', ').join(sql.Placeholder() * len(cols))
                    )
                    cur.execute(insert_query, vals)
                    inserted += 1

            conn.commit()
            return inserted
        except Exception as e:
            conn.rollback()
            raise e

    def close(self):
        if self.conn and self.conn.closed == 0:
            try:
                self.conn.close()
            except Exception:
                pass


# ==============================================================================
# INGESTION CYCLE
# ==============================================================================
def run_cycle(tracker, db_manager, ftp_fetcher):
    """Checks all 5 station folders, downloads new files from FTP, and inserts into DB."""
    start_time = datetime.now()
    print("\n" + "=" * 80)
    print(f" [PC Time: {start_time.strftime('%H:%M:%S')}] STARTING INGESTION CYCLE")
    print("=" * 80)

    summary = {}
    total_new_records = 0

    for station_name, config in STATION_MAPPINGS.items():
        folder_name = config['folder']
        table_name = config['table']
        default_lat = config['default_lat']
        default_lon = config['default_lon']

        station_dir = os.path.join(SCRIPT_DIR, folder_name)
        os.makedirs(station_dir, exist_ok=True)

        print(f"\n--- [Station: {station_name}] Checking Folder '{folder_name}' (Target Table: '{table_name}') ---")

        # 1. Fetch new files from FTP
        if ftp_fetcher.is_configured():
            new_dl = ftp_fetcher.fetch_station(folder_name, station_dir, tracker)
            if new_dl > 0:
                logger.info(f"[{station_name}] Downloaded {new_dl} new files from FTP.")

        # 2. Check local files in this station directory
        all_files = sorted(glob.glob(os.path.join(station_dir, "*.csv")))
        total_files = len(all_files)
        new_files = [f for f in all_files if not tracker.is_known(f"{folder_name}/{os.path.basename(f)}")]

        already_tracked = total_files - len(new_files)
        logger.info(
            f"[{station_name}] Total files: {total_files} | Already tracked: {already_tracked} | New files to process: {len(new_files)}"
        )

        # 3. If no new files, skip this folder cleanly
        if not new_files:
            logger.info(f"[{station_name}] --> No new files to process. Skipping folder.")
            summary[station_name] = {'status': 'Skipped (no new files)', 'records': 0}
            continue

        # 4. Process new files
        succ_files = 0
        succ_records = 0
        inv_files = 0
        issue_files = 0

        for idx, file_path in enumerate(new_files, 1):
            fname = os.path.basename(file_path)
            rel_key = f"{folder_name}/{fname}"

            print(f"  [{station_name}] [{idx}/{len(new_files)}] Parsing '{fname}'...")

            status, result = BuoyCSVParser.parse(file_path, station_name, default_lat, default_lon)

            if status == 'INVALID':
                reason = result
                print(f"      \\-- [INVALID] {reason}. Added to invalid.txt")
                tracker.mark_invalid(rel_key, reason)
                inv_files += 1
                continue

            records = result
            try:
                inserted = db_manager.insert_records(table_name, records)
                print(f"      \\-- [SUCCESS] Inserted {inserted} new records into {table_name}. Added to processed.txt")
                tracker.mark_processed(rel_key)
                succ_files += 1
                succ_records += inserted
                total_new_records += inserted
            except Exception as db_err:
                print(f"      \\-- [ISSUE] DB insert failed: {db_err}. Added to issue.txt")
                tracker.mark_issue(rel_key, f"DB Error: {str(db_err)}")
                issue_files += 1

        summary[station_name] = {
            'status': f"Processed {succ_files}/{len(new_files)} new files",
            'records': succ_records,
            'invalid': inv_files,
            'issues': issue_files
        }

    duration = (datetime.now() - start_time).total_seconds()
    print("\n" + "-" * 80)
    print(f" CYCLE FINISHED in {duration:.2f}s | Total new records inserted across all tables: {total_new_records}")
    print("-" * 80)
    for st_name, res in summary.items():
        print(f"   Station {st_name:<4}: {res['status']} ({res.get('records', 0)} new records)")
    print("=" * 80)


# ==============================================================================
# PC TIME SCHEDULER
# ==============================================================================
def get_next_scheduled_target(scheduled_minutes, now):
    """
    Looks at the current PC time and calculates the next upcoming target datetime
    matching one of scheduled_minutes (:02, :12, :22, :32, :42, :52).
    """
    sorted_mins = sorted(set(scheduled_minutes))
    curr_min = now.minute

    # Check for a target minute later in the current hour
    for m in sorted_mins:
        if m > curr_min:
            return now.replace(minute=m, second=0, microsecond=0)

    # Otherwise, it wraps to the first scheduled minute of the next hour
    next_hour = (now + timedelta(hours=1)).replace(minute=sorted_mins[0], second=0, microsecond=0)
    return next_hour


def main():
    print("=" * 80)
    print(" QATAR BUOY DATA INGESTION SERVICE (PC TIME SYNCHRONIZED)")
    print("=" * 80)
    print(f" Current PC Time    : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f" Target Database    : {DB_CONFIG['database']} @ {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f" Database User      : {DB_CONFIG['user']}")
    ftp_info = f"{FTP_CONFIG['host']}:{FTP_CONFIG['port']} (user: {FTP_CONFIG['user']})" if FTP_CONFIG.get('host') else "Disabled"
    print(f" FTP Server         : {ftp_info}")
    mins_str = ", ".join(f":{m:02d}" for m in sorted(SCHEDULED_MINUTES))
    print(f" Fixed Schedule     : Every hour strictly at minutes [{mins_str}]")
    print(" Station Folders & Target Tables:")
    for st_name, cfg in STATION_MAPPINGS.items():
        print(f"   * Folder: {cfg['folder']:<4}  -->  Table: {cfg['table']}")
    print(f" Tracking Files     : processed.txt, invalid.txt, issue.txt in {SCRIPT_DIR}")
    print("=" * 80)

    tracker = TrackingManager(PROCESSED_FILE, INVALID_FILE, ISSUE_FILE)
    db_manager = DatabaseManager(DB_CONFIG)
    ftp_fetcher = FTPFetcher(FTP_CONFIG)

    # If --now was passed, run immediately once on startup
    if RUN_ON_STARTUP and service_running:
        logger.info("[Manual Override --now] Running immediate check on startup...")
        try:
            run_cycle(tracker, db_manager, ftp_fetcher)
        except Exception as e:
            logger.error(f"Error in startup cycle: {e}")

    logger.info("[Scheduler] Service active. Listening to PC system clock. Press Ctrl+C to stop.")

    try:
        while service_running:
            now = datetime.now()

            # Check if current PC minute is one of the scheduled minutes and we haven't run it yet this second
            # Calculate the next target time on the PC clock
            next_target = get_next_scheduled_target(SCHEDULED_MINUTES, now)
            seconds_remaining = (next_target - now).total_seconds()
            mins_rem = int(seconds_remaining // 60)
            secs_rem = int(seconds_remaining % 60)

            logger.info(
                f"[PC Clock: {now.strftime('%H:%M:%S')}] Next scheduled run strictly at {next_target.strftime('%H:%M:%S')} "
                f"(in {mins_rem}m {secs_rem:02d}s). Waiting for PC clock..."
            )

            # Wait until the PC clock hits the exact target time
            while service_running:
                current_now = datetime.now()
                remaining = (next_target - current_now).total_seconds()
                if remaining <= 0:
                    break
                # Check PC time every second
                time.sleep(min(remaining, 1.0))

            if not service_running:
                break

            # PC clock reached the exact scheduled minute!
            alarm_time = datetime.now()
            logger.info(
                f"[PC Clock: {alarm_time.strftime('%H:%M:%S')}] Clock reached scheduled minute :{alarm_time.minute:02d}! "
                f"Starting ingestion across all stations..."
            )
            try:
                run_cycle(tracker, db_manager, ftp_fetcher)
            except Exception as cycle_err:
                logger.error(f"[Scheduler] Error during scheduled cycle: {cycle_err}")

            # Small sleep to ensure we don't re-trigger within the same second
            time.sleep(2)

    except KeyboardInterrupt:
        pass
    finally:
        db_manager.close()
        logger.info("[Shutdown] Service stopped. Goodbye!")


if __name__ == '__main__':
    main()
