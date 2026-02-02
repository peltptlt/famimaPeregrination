import pandas as pd
import json
import math

# ブランク対策
def safe_str(v):
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    return str(v)

# Excel読み込み
df = pd.read_excel("ファミリーマート行脚.xlsx", sheet_name="ファミマ行脚")

features = []

for _, row in df.iterrows():

    # --- 座標の取得（lon / lng 両対応） ---
    lon = row.get("lon", None)
    if lon is None or pd.isna(lon):
        lon = row.get("lng", None)

    lat = row.get("lat", None)

    # 座標が無い行はスキップ
    if pd.isna(lat) or pd.isna(lon):
        continue

    lon = float(lon)
    lat = float(lat)

    # --- 日付処理 ---
    date_str = ""
    year_str = ""

    if not pd.isna(row["date"]):
        if isinstance(row["date"], pd.Timestamp):
            date_str = row["date"].strftime("%Y-%m-%d")
            year_str = str(row["date"].year)
        else:
            date_raw = str(int(row["date"]))
            date_str = f"{date_raw[:4]}-{date_raw[4:6]}-{date_raw[6:8]}"
            year_str = date_raw[:4]

    elif not pd.isna(row["year"]):
        year_str = str(int(row["year"]))
        date_str = ""

    # --- GeoJSON Feature 作成 ---
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]
        },
        "properties": {
            "no": int(row["no"]),
            "name": safe_str(row.get("name")),
            "rename": safe_str(row.get("rename")),
            "address": safe_str(row.get("address")),
            "year": year_str,
            "date": date_str
        }
    }

    features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open("famimaPeregrination/docs/famimaPeregrination.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print(f"変換完了: {len(features)} 件")
