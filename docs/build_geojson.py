import csv, json, pathlib

SRC = pathlib.Path("ファミリーマート行脚.csv")
DST = pathlib.Path("famimaPeregrination\\docs\\famimaPeregrination.geojson")

features = []

with SRC.open(encoding="cp932", newline="") as f:
    reader = csv.DictReader(f)
    for r in reader:
        lat = float(r["lat"])
        lon = float(r["lon"])

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": {
                "no": r["no"],
                "name": r["name"],
                "rename": r.get("rename", ""),
                "address": r.get("address", "")
            }
        })

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with DST.open("w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print(f"✔ generated: {DST}")
