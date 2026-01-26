import pandas as pd
import json

# Excel読み込み
df = pd.read_excel("ファミリーマート行脚.xlsx", sheet_name="ファミマ行脚")

features = []

for _, row in df.iterrows():
    if pd.isna(row["lat"]) or pd.isna(row["lon"]):
        continue  # 座標なしは除外

    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(row["lon"]), float(row["lat"])]
        },
        "properties": {
            "no": int(row["no"]),
            "name": str(row["name"]) if not pd.isna(row["name"]) else "",
            "rename": str(row["rename"]) if not pd.isna(row["rename"]) else "",
            "address": str(row["address"]) if not pd.isna(row["address"]) else "",
            "year": str(int(row["year"])) if not pd.isna(row["year"]) else ""
        }
    }
    features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open("C:\Users\ろへ\ドキュメント\document\ファミリーマート行脚\famimaPeregrination\docs\famimaPeregrination.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print(f"変換完了: {len(features)} 件")
