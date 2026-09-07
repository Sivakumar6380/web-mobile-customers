import pandas as pd
import numpy as np
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import joblib

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'query_regression_detector_dataset.xlsx')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
REPORT_PATH = os.path.join(os.path.dirname(__file__), '..', 'datasets', 'model_evaluation_report.json')

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)

def train_and_evaluate():
    print("Loading dataset...")
    df = pd.read_excel(DATASET_PATH)

    print("Preprocessing data...")
    # Features available in the new schema:
    # execution_id, query_id, release_id, primary_table, query_category, business_criticality, 
    # client_type, execution_timestamp, period, execution_time_ms, baseline_ms, pct_change, 
    # status, scan_type, plan_changed_flag, stats_stale_flag, regression_flag, regression_severity
    
    # We will use categorical features and numeric features
    categorical_cols = ['primary_table', 'query_category', 'business_criticality', 'client_type', 'scan_type']
    
    # Label encode categoricals
    le_dict = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        le_dict[col] = le
        
    features = categorical_cols + ['execution_time_ms', 'baseline_ms', 'pct_change', 'plan_changed_flag', 'stats_stale_flag']
    
    X = df[features]
    y = df['regression_flag'].astype(int)

    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 1. Train Random Forest (Supervised)
    print("Training Random Forest...")
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_probs = rf.predict_proba(X_test)[:, 1]

    # 2. Train Isolation Forest (Unsupervised Anomaly Detection)
    print("Training Isolation Forest...")
    iso = IsolationForest(contamination=0.1, random_state=42)
    iso.fit(X_train)
    # Isolation forest returns -1 for anomaly, 1 for normal
    iso_preds_raw = iso.predict(X_test)
    iso_preds = np.where(iso_preds_raw == -1, 1, 0)
    # For AUC we can use decision_function (lower is more anomalous)
    iso_scores = -iso.decision_function(X_test) 

    # Evaluation Helper
    def evaluate(y_true, y_pred, y_prob):
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        return {
            "Accuracy": float(accuracy_score(y_true, y_pred)),
            "Precision": float(precision_score(y_true, y_pred, zero_division=0)),
            "Recall": float(recall_score(y_true, y_pred, zero_division=0)),
            "F1_Score": float(f1_score(y_true, y_pred, zero_division=0)),
            "ROC_AUC": float(roc_auc_score(y_true, y_prob)),
            "Confusion_Matrix": {
                "TN": int(tn), "FP": int(fp), "FN": int(fn), "TP": int(tp)
            }
        }

    rf_metrics = evaluate(y_test, rf_preds, rf_probs)
    iso_metrics = evaluate(y_test, iso_preds, iso_scores)

    # Determine Best Model
    best_model = "Random_Forest" if rf_metrics["F1_Score"] > iso_metrics["F1_Score"] else "Isolation_Forest"
    
    report = {
        "Dataset": "query_regression_detector_dataset.xlsx",
        "Total_Records": len(df),
        "Metrics": {
            "Random_Forest": rf_metrics,
            "Isolation_Forest": iso_metrics
        },
        "Best_Model": best_model,
        "Explanation": f"The {best_model.replace('_', ' ')} was automatically selected because it achieved a higher F1 Score ({max(rf_metrics['F1_Score'], iso_metrics['F1_Score']):.4f} vs {min(rf_metrics['F1_Score'], iso_metrics['F1_Score']):.4f}). F1 Score is preferred as it handles class imbalance better than accuracy, ensuring we minimize both false positives (alert fatigue) and false negatives (missed regressions)."
    }

    # Save models and report
    joblib.dump(rf, os.path.join(MODELS_DIR, 'random_forest.pkl'))
    joblib.dump(iso, os.path.join(MODELS_DIR, 'isolation_forest.pkl'))
    with open(REPORT_PATH, 'w') as f:
        json.dump(report, f, indent=4)

    print(f"Report saved to {REPORT_PATH}")

if __name__ == "__main__":
    train_and_evaluate()
