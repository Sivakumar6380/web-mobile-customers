import pandas as pd
import numpy as np
import uuid
import random
from datetime import datetime, timedelta
import os

def generate_plan_hash():
    return uuid.uuid4().hex

def generate_synthetic_data(num_records=10000):
    np.random.seed(42)
    random.seed(42)
    
    # Base configuration
    tables = ['orders', 'customers', 'products', 'payments', 'shipments', 'employees', 'inventory']
    schema_versions = ['v1.0', 'v1.1', 'v1.2', 'v2.0']
    release_versions = ['r1.0.0', 'r1.1.0', 'r1.2.0', 'r2.0.0']
    stats_versions = ['s1', 's2', 's3', 's4']
    
    data = []
    
    start_date = datetime.now() - timedelta(days=30)
    
    for i in range(num_records):
        timestamp = start_date + timedelta(minutes=i * 5)
        
        # Simulate different queries by base cost/time
        query_type = random.choice(['simple_select', 'complex_join', 'aggregation', 'subquery'])
        base_time_ms = {'simple_select': 10, 'complex_join': 100, 'aggregation': 50, 'subquery': 80}[query_type]
        
        # Introduce variations
        execution_time_ms = max(1, np.random.normal(base_time_ms, base_time_ms * 0.2))
        cpu_usage_ms = execution_time_ms * random.uniform(0.5, 0.9)
        memory_usage_kb = np.random.normal(1024 * (base_time_ms/10), 1024)
        rows_processed = int(max(1, np.random.normal(100 * (base_time_ms/10), 50)))
        actual_cost = execution_time_ms * random.uniform(0.8, 1.2)
        buffers_hit = int(rows_processed * random.uniform(1, 5))
        
        schema = random.choice(schema_versions)
        release = random.choice(release_versions)
        stats = random.choice(stats_versions)
        
        plan_hash = generate_plan_hash()
        
        # Introduce anomalies / regressions
        regression_label = 'No Regression'
        severity = 0
        
        anomaly_chance = random.random()
        if anomaly_chance < 0.1: # 10% chance of some regression
            if anomaly_chance < 0.02:
                regression_label = 'Critical'
                severity = 3
                execution_time_ms *= random.uniform(2.5, 5.0) # > 60% increase (actually way more)
                plan_hash = generate_plan_hash() # Plan change
            elif anomaly_chance < 0.05:
                regression_label = 'Major'
                severity = 2
                execution_time_ms *= random.uniform(1.4, 2.0) # 40-100% increase
                plan_hash = generate_plan_hash()
            else:
                regression_label = 'Minor'
                severity = 1
                execution_time_ms *= random.uniform(1.15, 1.3) # 15-30% increase
                
        # More realistic SQL queries
        query_templates = [
            f"SELECT id, status, created_at FROM {random.choice(tables)} WHERE created_at > CURRENT_DATE - INTERVAL '30 days'",
            f"SELECT * FROM {random.choice(tables)} WHERE status = 'PENDING' ORDER BY created_at DESC LIMIT 100",
            f"SELECT customer_id, SUM(total_amount) FROM {random.choice(tables)} GROUP BY customer_id HAVING SUM(total_amount) > 1000",
            f"SELECT t1.id, t2.name FROM {random.choice(tables)} t1 JOIN customers t2 ON t1.customer_id = t2.id WHERE t2.is_active = true",
            f"SELECT COUNT(*) FROM {random.choice(tables)} WHERE {random.choice(['status = 1', 'is_deleted = false', 'category_id = 5'])}"
        ]
        
        data.append({
            'query_text': random.choice(query_templates),
            'plan_hash': plan_hash,
            'execution_time_ms': round(execution_time_ms, 2),
            'cpu_usage_ms': round(cpu_usage_ms, 2),
            'memory_usage_kb': round(memory_usage_kb, 2),
            'rows_processed': rows_processed,
            'actual_cost': round(actual_cost, 2),
            'buffers_hit': buffers_hit,
            'schema_version': schema,
            'release_version': release,
            'statistics_version': stats,
            'regression_label': regression_label,
            'severity': severity,
            'execution_timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    df = pd.DataFrame(data)
    
    # Feature Engineering
    # We will simulate the 'previous' metrics to calculate differences
    # For simplicity in the dataset, we'll just add columns representing the diffs
    df['Execution_Time_Difference'] = df.apply(lambda row: row['execution_time_ms'] * random.uniform(-0.1, 0.1) if row['regression_label'] == 'No Regression' else row['execution_time_ms'] * random.uniform(0.2, 0.8), axis=1)
    df['Plan_Difference_Score'] = df['regression_label'].apply(lambda x: 0 if x == 'No Regression' else random.uniform(0.5, 1.0))
    df['CPU_Difference'] = df['Execution_Time_Difference'] * random.uniform(0.6, 0.9)
    df['Memory_Difference'] = np.where(df['regression_label'] == 'No Regression', 
                                       df['memory_usage_kb'] * random.uniform(-0.05, 0.05), 
                                       df['memory_usage_kb'] * random.uniform(0.1, 0.5))

    os.makedirs('../datasets', exist_ok=True)
    df.to_csv('../datasets/synthetic_queries.csv', index=False)
    print(f"Generated {num_records} records in ../datasets/synthetic_queries.csv")

if __name__ == '__main__':
    generate_synthetic_data(10500)
