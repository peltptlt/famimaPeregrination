import pandas as pd
import json

# Excel読み込み
df = pd.read_excel("ファミリーマート行脚.xlsx", sheet_name="ファミマ行脚")

features = []

for _, row in df.iterrows():
    # 座標が無い行はスキップ
    if pd.isna(row["lat"]) or pd.isna(row["lon"]):
        continue

    # --- 日付処理 ---
    date_str = ""
    year_str = ""

    # ① date が入っている場合（最優先）
    if not pd.isna(row["date"]):
        if isinstance(row["date"], pd.Timestamp):
            # 日付型
            date_str = row["date"].strftime("%Y-%m-%d")
            year_str = str(row["date"].year)
        else:
            # 整数型
            date_raw = str(int(row["date"]))
            date_str = f"{date_raw[:4]}-{date_raw[4:6]}-{date_raw[6:8]}"
            year_str = date_raw[:4]

    # ② date が空なら year を暫定利用
    elif not pd.isna(row["year"]):
        year_str = str(int(row["year"]))
        date_str = ""  # date は空のまま

    # --- GeoJSON Feature 作成 ---
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(row["lon"]), float(row["lat"])]
        },
        "properties": {
            "no": int(row["no"]),
            "name": row.get("name", "") or "",
            "rename": row.get("rename", "") or "",
            "address": row.get("address", "") or "",
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
