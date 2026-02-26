from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from sklearn.cluster import DBSCAN

app = FastAPI()

class IssuePoint(BaseModel):
    lat: float
    lng: float
    severity: int

class HotspotRequest(BaseModel):
    points: list[IssuePoint]

@app.post("/predict-hotspots")
def predict_hotspots(data: HotspotRequest):
    if len(data.points) < 5:
        return {"clusters": []}

    coords = np.array([
        [p.lat, p.lng] for p in data.points
    ])

    weights = np.array([
        p.severity for p in data.points
    ])

    # DBSCAN clustering
    db = DBSCAN(
        eps=0.002,   # ~200m radius
        min_samples=3
    ).fit(coords)

    labels = db.labels_

    clusters = {}
    for idx, label in enumerate(labels):
        if label == -1:
            continue

        if label not in clusters:
            clusters[label] = {
                "points": [],
                "avg_severity": 0
            }

        clusters[label]["points"].append(coords[idx].tolist())
        clusters[label]["avg_severity"] += weights[idx]

    result = []
    for c in clusters.values():
        c["avg_severity"] /= len(c["points"])
        result.append(c)

    return {
        "hotspots": result
    }
