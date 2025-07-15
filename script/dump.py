import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Generate timestamps for every 10 minutes over 2 months
start_time = datetime(2024, 3, 1)
end_time = datetime(2024, 5, 1)
time_range = pd.date_range(start=start_time, end=end_time, freq='10T')

# Define columns as per your schema
columns = [
    "id", "station_id", "timestamp", "datetime", "battery", "cam_img", "lat", "lon",
    "windspeed", "wind_direction_deg", "temperature_deg", "rh_percent", "bp_hpa",
    "global", "rain_mm", "visibility_nm", "wave_heading", "wave_height", "Tzc", "Tz",
    "Tm02", "wave_direction", "wave_direction_fw", "mean_wave_direction", "hmax",
    "fourier_coefficient_a1", "fourier_coefficient_b1", "fourier_coefficient_a2", "fourier_coefficient_b2",
    "havg", "dominant_time_period_fw", "turbidity", "water_temperature", "ph", "conductivity",
    "dissolved_oxygen", "salinity", "chlorophyll_a", "wind_gust", "phycoerythrin", "fluorescein_dye",
    "pah", "oil_in_water", "bt"
] + [
    f"current_speed_bin_{i}" for i in range(1, 11)
] + [
    f"current_direction_bin_{i}" for i in range(1, 11)
]

# Initialize DataFrame
df = pd.DataFrame()
df["id"] = np.arange(1, len(time_range) + 1)
df["station_id"] = ["station_001"] * len(time_range)
df["timestamp"] = time_range
df["datetime"] = time_range
df["battery"] = np.random.randint(0, 13, size=len(time_range))
df["cam_img"] = [""] * len(time_range)
df["lat"] = np.round(np.random.uniform(-90, 90, size=len(time_range)), 6)
df["lon"] = np.round(np.random.uniform(-180, 180, size=len(time_range)), 6)

# Generate rest of the numeric data
def generate_column(size, int_only=False, min_val=0, max_val=100):
    return (
        np.random.randint(min_val, max_val + 1, size=size)
        if int_only else
        np.round(np.random.uniform(min_val, max_val, size=size), 2)
    )

for col in columns:
    if col not in df.columns:
        df[col] = generate_column(len(time_range))

# Save to CSV
df.to_csv("generated_buoy_data_schema_based.csv", index=False)
print("CSV file generated successfully!")
