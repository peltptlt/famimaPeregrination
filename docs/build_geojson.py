import pandas as pd
import json
import math

def safe_str(v):
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    return str(v)

# Excel読み込み
df = pd.read_excel("ファミリーマート行脚.xlsx", sheet_name="ファミマ行脚")

# ★ 文字列の日付を Timestamp に変換
df["date"] = pd.to_datetime(df["date"], errors="coerce")

features = []

for _, row in df.iterrows():

    # --- 座標の取得 ---
    lon = row.get("lon", row.get("lng"))
    lat = row.get("lat")

    if pd.isna(lat) or pd.isna(lon):
        continue

    lon = float(lon)
    lat = float(lat)

    # --- 日付（分まで） ---
    # 例: 2017-03-11 10:01
    date_str = row["date"].strftime("%Y-%m-%d %H:%M")

    # --- GeoJSON Feature ---
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
            "date": date_str   # ← year は廃止
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
