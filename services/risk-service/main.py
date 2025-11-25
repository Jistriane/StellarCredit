from fastapi import FastAPI, BackgroundTasks
import joblib
import pandas as pd
from pydantic import BaseModel
import random
import time

app = FastAPI()

class RiskRequest(BaseModel):
    address: str
    amount: float

class RiskResponse(BaseModel):
    default_probability: float
    fraud_detected: bool
    risk_tier: str
    timestamp: int

# Real ML Model
class RealRiskModel:
    def __init__(self):
        try:
            self.model = joblib.load('xgb_v1.pkl')
            print("Loaded Real XGBoost Model")
        except:
            print("Model not found, training one now...")
            from train_model import train_model
            train_model()
            self.model = joblib.load('xgb_v1.pkl')

    def predict_proba(self, address: str, amount: float) -> float:
        # Extract features (In prod, this would query the Feature Store/DB)
        # Here we generate synthetic features based on address hash to be deterministic
        seed = sum(ord(c) for c in address)
        random.seed(seed)
        
        features = pd.DataFrame([{
            'tx_count': random.randint(5, 50),
            'avg_tx_value': random.uniform(100, 5000),
            'account_age': random.randint(30, 1000),
            'failed_ratio': random.uniform(0, 0.1)
        }])
        
        prob = self.model.predict_proba(features)[0][1]
        return float(prob)

risk_model = RealRiskModel()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/risk/assess", response_model=RiskResponse)
async def assess_risk(request: RiskRequest, background_tasks: BackgroundTasks):
    # 1. Calculate Default Probability
    prob = risk_model.predict_proba(request.address, request.amount)
    
    # 2. Fraud Detection (Simple Threshold)
    is_fraud = prob > 0.9
    
    # 3. Determine Tier
    if prob < 0.2:
        tier = "Low Risk"
    elif prob < 0.5:
        tier = "Medium Risk"
    else:
        tier = "High Risk"
    
    return RiskResponse(
        default_probability=prob,
        fraud_detected=is_fraud,
        risk_tier=tier,
        timestamp=int(time.time())
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
