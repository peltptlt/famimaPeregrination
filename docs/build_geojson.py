import pandas as pd
import json
import math

# --------------------------------------
# 安全な文字列化
# --------------------------------------
def safe_str(v):
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    return str(v).strip()


# --------------------------------------
# 市区町村の正規化（都道府県名の除去）
# --------------------------------------
def normalize_city(pref, city):
    if not city:
        return ""
    if pref and city.startswith(pref):
        return city[len(pref):].strip()
    return city.strip()


# --------------------------------------
# 同名市区町村の区別（辞書方式）
# --------------------------------------
CITY_SUFFIX = {
    "伊達市": {
        "北海道": "北",
        "福島県": "福"
    },
    "府中市": {
        "東京都": "東",
        "広島県": "広"
    }
}

def convert_city(pref, city):
    if city in CITY_SUFFIX and pref in CITY_SUFFIX[city]:
        suffix = CITY_SUFFIX[city][pref]
        return f"{city}（{suffix}）"
    return city


# --------------------------------------
# Excel 読み込み
# --------------------------------------
df = pd.read_excel("ファミリーマート行脚.xlsx", sheet_name="ファミマ行脚")
df["date"] = pd.to_datetime(df["date"], errors="coerce")

features = []

for _, row in df.iterrows():

    lon = row.get("lon", row.get("lng"))
    lat = row.get("lat")

    if pd.isna(lat) or pd.isna(lon):
        continue

    lon = float(lon)
    lat = float(lat)

    date_str = row["date"].strftime("%Y-%m-%d %H:%M")

    pref = safe_str(row.get("pref"))
    city_raw = safe_str(row.get("city"))
    city_norm = normalize_city(pref, city_raw)
    city = convert_city(pref, city_norm)

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
            "city": city,
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
