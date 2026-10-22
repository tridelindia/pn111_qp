import psycopg2
import random
from datetime import datetime, timedelta

# PostgreSQL connection details
DB_CONFIG = {
    'host': '192.168.0.111',
    'port': 5432,
    'database': 'db_qatar_tems',
    'user': 'postgres',
    'password': 'qp@tridel@2025'
}

# Connect to PostgreSQL
conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

# Start and end date (4 months of data at 10-minute intervals)
start_date = datetime(2025, 4, 1)
end_date = start_date + timedelta(days=120)  # approx 4 months

def rand(f, t, decimals=2):
    return round(random.uniform(f, t), decimals)

def insert_data():
    dt = start_date
    id_counter = 1

    while dt < end_date:
        timestamp = dt.isoformat()
        lat = rand(12.345678, 12.349999, 6)
        lon = rand(98.123456, 98.129999, 6)
        battery = rand(11.0, 13.0)
        windspeed = rand(0, 15)
        wind_dir = rand(0, 360)
        wind_gust = windspeed + rand(0, 5)
        temp = rand(24, 35)
        rh = rand(50, 100)
        bp = rand(990, 1025)
        global_radiation = rand(0, 1000)
        rain = rand(0, 20)
        visibility = rand(5, 20)
        wave_heading = rand(0, 360)
        wave_height = rand(0.2, 3)
        Tzc = rand(3, 10)
        Tz = rand(3, 10)
        Tm02 = rand(3, 10)
        wave_dir = rand(0, 360)
        wave_fw = rand(0, 360)
        mean_wave_dir = rand(0, 360)
        hmax = wave_height + rand(0.5, 2.5)
        havg = wave_height
        dtp_fw = rand(4, 12)
        a1 = rand(-1, 1)
        b1 = rand(-1, 1)
        a2 = rand(-1, 1)
        b2 = rand(-1, 1)
        turbidity = rand(0, 100)
        water_temp = temp - rand(1, 5)
        ph = rand(7.5, 8.5)
        conductivity = rand(30, 50)
        do = rand(5, 10)
        salinity = rand(30, 38)
        chl = rand(0, 10)
        phyco = rand(0, 5)
        fluorescein = rand(0, 2)
        pah = rand(0, 1)
        oil = rand(0, 1)
        bt = rand(0, 1)

        current_bins = [(rand(0.01, 2.5), rand(0, 360)) for _ in range(10)]

        # Build SQL INSERT
        sql = """
        INSERT INTO tb_buoy_st002_measurements (
            id, station_id, timestamp, datetime, battery, lat, lon,
            wind_speed, wind_direction_deg, wind_gust, temperature_deg,
            rh_percent, bp_hpa, global_radiation, rain_mm, visibility,
            wave_heading, wave_height, tzc, tz, tm02,
            wave_direction, wave_direction_fw, mean_wave_direction, hmax,
            fourier_coefficient_a1, fourier_coefficient_b1,
            fourier_coefficient_a2, fourier_coefficient_b2, havg, dominant_time_period_fw,
            turbidity, water_temperature, ph, conductivity,
            dissolved_oxygen, salinity, chlorophyll_a,
            phycoerythrin, fluorescein_dye, pah, oil_in_water, bt,
            current_speed_bin_1, current_direction_bin_1,
            current_speed_bin_2, current_direction_bin_2,
            current_speed_bin_3, current_direction_bin_3,
            current_speed_bin_4, current_direction_bin_4,
            current_speed_bin_5, current_direction_bin_5,
            current_speed_bin_6, current_direction_bin_6,
            current_speed_bin_7, current_direction_bin_7,
            current_speed_bin_8, current_direction_bin_8,
            current_speed_bin_9, current_direction_bin_9,
            current_speed_bin_10, current_direction_bin_10
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s, %s,
                  %s, %s
        )
        """

        values = (
            id_counter, 'Station01', timestamp, dt, battery, lat, lon,
            windspeed, wind_dir, wind_gust, temp,
            rh, bp, global_radiation, rain, visibility,
            wave_heading, wave_height, Tzc, Tz, Tm02,
            wave_dir, wave_fw, mean_wave_dir, hmax,
            a1, b1, a2, b2, havg, dtp_fw,
            turbidity, water_temp, ph, conductivity,
            do, salinity, chl,
            phyco, fluorescein, pah, oil, bt,
            *[val for pair in current_bins for val in pair]
        )

        cursor.execute(sql, values)

        if id_counter % 500 == 0:
            print(f"Inserted {id_counter} rows...")
            conn.commit()

        id_counter += 1
        dt += timedelta(minutes=10)

    conn.commit()
    print("✅ Data insertion complete.")

# Run
insert_data()

# Close connection
cursor.close()
conn.close()
