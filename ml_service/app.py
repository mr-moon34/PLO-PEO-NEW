from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn


class PredictRequest(BaseModel):
    # Keep schema flexible; validate lengths in code to avoid pydantic version issues
    inputs: List[List[float]]


class PredictResponse(BaseModel):
    predictions: List[List[float]]


app = FastAPI(title="PLO Predictor", version="0.1.0")


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


@app.get("/")
def root():
    return {"status": "ok", "message": "Use POST /invocations"}


@app.post("/invocations", response_model=PredictResponse)
def invocations(req: PredictRequest):
    predictions: List[List[float]] = []
    for row in req.inputs:
        # Expected: [gender, semester, plo1..plo12]
        gender = row[0]
        semester = row[1]
        plos = row[2:14]

        # Basic fallback if fewer than 12 PLOs were provided
        if len(plos) < 12:
            plos = plos + [0.0] * (12 - len(plos))

        # Simple deterministic baseline model:
        # prediction_i = clamp( 0.6*plo_i + 0.4*avg_plos + (semester/7)*4 + (gender*1.0) )
        avg_plos = sum(plos) / 12.0 if plos else 0.0
        bias = (float(semester) / 7.0) * 4.0 + float(gender) * 1.0
        pred_row = []
        for value in plos:
            pred = 0.6 * float(value) + 0.4 * avg_plos + bias
            pred_row.append(round(clamp(pred), 6))
        predictions.append(pred_row[:12])

    return {"predictions": predictions}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)


