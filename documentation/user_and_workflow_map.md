# User & Workflow Map: NexusDB Guardian

## 1. Executive Summary
This document delineates the persona workflows, operational journeys, automated detection pipelines, and legacy coexistence architecture for **NexusDB Guardian (SQL Query Regression Detector)** serving high-volume transactional order databases for web and mobile customers.

---

## 2. Multi-Persona User Journeys

### 2.1 Database Administrator (DBA) Journey: Incident Triage & Emergency Rollback
```mermaid
sequenceDiagram
    autonumber
    actor DBA as Database Administrator
    participant APM as NexusDB Guardian Engine
    participant DB as PostgreSQL 14+ Catalog
    participant Alert as Alert Notification System

    APM->>Alert: Critical Anomaly Detected (v1.1.0 Drop Index)
    Alert-->>DBA: Push Notification (+18,650% Latency Spike)
    DBA->>APM: Log in to Admin Console (/admin)
    APM-->>DBA: Display Regression Dashboard & Anomaly Dossier
    DBA->>APM: Inspect Evidence & Rollback Simulation (/rollback)
    DBA->>DB: Trigger Migration Rollback (03_v1.1.1_rollback_restore_index.sql)
    DB-->>APM: Report Restored Index 'idx_orders_user_id'
    APM-->>DBA: Verified Latency Reverted to 0.102ms (Baseline Optimal)
```

### 2.2 Database Reliability Engineer (DBRE) Journey: Plan Diffing & Stale Statistics Tuning
```mermaid
flowchart TD
    A[DBRE Opens Engineer Workspace] --> B[Review Top Slow Queries Table]
    B --> C{Select Query with Hash Drift}
    C --> D[Open Plan Comparison View /plan-comparison]
    D --> E[Inspect Side-by-Side Plan JSON]
    E --> F[Identify Mutation: Index Scan ➔ Hash Join / Seq Scan]
    F --> G[Inspect Statistics Analysis /statistics-analysis]
    G --> H{Is Stats Drift > 50%?}
    H -- Yes --> I[Trigger ANALYZE / UPDATE STATISTICS]
    H -- No --> J[Generate Concurrent Index Script]
    I --> K[Re-evaluate Plan in Test Suite /testing]
    J --> K
    K --> L[Performance Restored within SLA]
```

### 2.3 Executive & VP of Engineering Journey: Financial & SLA Impact Governance
```mermaid
flowchart LR
    A[VP of Engineering] --> B[Open Stakeholder Dashboard]
    B --> C[Inspect Mobile Checkout p99 SLA Compliance]
    B --> D[Review Monthly Outage Prevention Savings]
    B --> E[Audit Release Quality Gate History]
    C --> F[Export Board-Ready Compliance PDF]
    D --> F
    E --> F
```

---

## 3. Automated Pre-Deployment CI/CD Pipeline Integration

```mermaid
flowchart TD
    PR[Developer Opens Pull Request / DDL Migration] --> GH[GitHub Actions / GitLab CI Runner]
    GH --> TR[Trigger Synthetic Replay Suite]
    TR --> ENG[NexusDB Guardian Headless Engine]
    ENG --> ML[Evaluate Random Forest Regression Classifier]
    ML --> CHK{Regression Detected > 15%?}
    CHK -- Yes --> FAIL[Block Merge: Emit Detailed Plan Diff Dossier to PR]
    CHK -- No --> PASS[Approve Quality Gate: Allow Automated Deployment]
```

---

## 4. Legacy APM Coexistence & Migration Architecture

```mermaid
graph TD
    subgraph Client Traffic
        Web[Web Customer Orders]
        Mobile[Mobile App Purchases]
    end

    subgraph Production Tier
        Web --> PG[(PostgreSQL 14+ Order Database)]
        Mobile --> PG
    end

    subgraph Phase 1: Legacy Monitoring [Current State]
        PG -.-> |Metric Polling| OldAPM[Datadog / CloudWatch Host Agent]
        OldAPM --> |Reactive CPU/RAM Alerts| Ops[On-Call Ops Team]
    end

    subgraph Phase 2: Parallel Ingestion [Coexistence]
        PG --> |EXPLAIN ANALYZE Logs| Queue[Kafka / Telemetry Buffer]
        Queue --> Guardian[NexusDB Guardian ML Engine]
        Guardian --> MLModel[Random Forest & Plan Diff Detector]
    end

    subgraph Phase 3: Proactive Prevention [Future State]
        MLModel --> ProactiveAlert[Pre-Impact Smart Alerting]
        MLModel --> AutoFix[Automated Plan Baseline Binding]
        ProactiveAlert --> DBRE[DB Engineer Dashboard]
    end
```
