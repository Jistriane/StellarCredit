import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import random
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score

def generate_synthetic_data(n_samples=10000):
    print(f"Generating {n_samples} synthetic samples...")
    np.random.seed(42)
    
    # Features
    # 1. Transaction Count (last 30 days)
    tx_count = np.random.poisson(20, n_samples)
    
    # 2. Average Transaction Value (BRL)
    avg_tx_value = np.random.exponential(500, n_samples)
    
    # 3. Account Age (days)
    account_age = np.random.randint(1, 1000, n_samples)
    
    # 4. Failed Transactions Ratio
    failed_ratio = np.random.beta(2, 20, n_samples)
    
    # Target: Default (1) or Pay (0)
    # Logic: High tx_count, high age, low failed_ratio -> Low Default Risk
    risk_score = (
        (100 / (tx_count + 1)) + 
        (1000 / (avg_tx_value + 1)) + 
        (500 / (account_age + 1)) + 
        (failed_ratio * 100)
    )
    
    # Normalize and add noise
    risk_prob = 1 / (1 + np.exp(-(risk_score - np.mean(risk_score)) / np.std(risk_score)))
    default = np.random.binomial(1, risk_prob)
    
    df = pd.DataFrame({
        'tx_count': tx_count,
        'avg_tx_value': avg_tx_value,
        'account_age': account_age,
        'failed_ratio': failed_ratio,
        'default': default
    })
    
    return df

def train_model():
    df = generate_synthetic_data()
    
    X = df.drop('default', axis=1)
    y = df['default']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost model...")
    model = xgb.XGBClassifier(
        objective='binary:logistic',
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
    
    print(f"Model Trained! Accuracy: {acc:.4f}, AUC: {auc:.4f}")
    
    # Save model
    joblib.dump(model, 'xgb_v1.pkl')
    print("Model saved to xgb_v1.pkl")

if __name__ == "__main__":
    train_model()
