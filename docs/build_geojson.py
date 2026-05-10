import pandas as pd
import json
import math

def safe_str(v):
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    return str(v)

def normalize_city(pref, city):
    if not city:
        return city
    if pref and city.startswith(pref):
        city = city[len(pref):]
    return city

def pad_zenkaku(s, width):
    return s + "　" * (width - len(s))


# ============================
# ① Excel 読み込み
# ============================
df = pd.read_excel("ファミリーマート行脚.xlsx", sheet_name="ファミマ行脚")

# 日付を Timestamp に変換
df["date"] = pd.to_datetime(df["date"], errors="coerce")

# city_norm を作成
df["city_norm"] = df.apply(
    lambda r: normalize_city(safe_str(r["pref"]), safe_str(r["city"])),
    axis=1
)


# ============================
# ② ラベル（pref_labels / city_labels）作成
# ============================
max_pref_len = df["pref"].str.len().max()
max_city_len = df["city_norm"].str.len().max()

# 都道府県ラベル
pref_counts = df["pref"].value_counts()
pref_labels = {
    pref: f"{pad_zenkaku(pref, max_pref_len)}（{count}）"
    for pref, count in pref_counts.items()
}

# 市区町村ラベル
city_counts = df["city_norm"].value_counts()
city_labels = {
    city: f"{pad_zenkaku(city, max_city_len)}（{count}）"
    for city, count in city_counts.items()
}


# ============================
# ③ GeoJSON 生成
# ============================
features = []

for _, row in df.iterrows():

    # 座標
    lon = row.get("lon", row.get("lng"))
    lat = row.get("lat")
    if pd.isna(lat) or pd.isna(lon):
        continue

    lon = float(lon)
    lat = float(lat)

    # 日付
    date_str = row["date"].strftime("%Y-%m-%d %H:%M")

    pref = safe_str(row["pref"])
    city = safe_str(row["city_norm"])

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
            "pref": pref,
            "pref_label": pref_labels[pref],
            "city": city,
            "city_label": city_labels[city],
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
