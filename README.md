# Smart-Waste-VAUED

# Intelligent Waste Monitoring & Environmental Risk Analytics Dashboard

An end-to-end **visual analytics and machine learning solution** for monitoring environmental conditions and odour risks in smart waste management systems using **IoT sensor data, historical environmental datasets, and AI-powered decision support**.

---

## 📌 Project Overview

Traditional waste management systems often rely on manual monitoring, making it difficult to identify environmental risks and respond proactively. This project combines **IoT sensor data, historical environmental data, visual analytics, anomaly detection, and conversational AI** to support data-driven waste management decisions.

The system provides a unified platform for monitoring environmental conditions, identifying abnormal patterns, assessing risk, and supporting proactive decision-making.

---

## 🎯 Objectives

* Monitor environmental conditions using real-time IoT sensor data.
* Integrate and analyse historical environmental datasets.
* Identify abnormal environmental conditions and potential sensor failures.
* Visualise real-time and historical trends through interactive dashboards.
* Generate risk assessments and alerts for proactive waste management.
* Provide AI-assisted insights and natural language data exploration.

---

## 🧩 Key Components

### 1. Data Integration & Preprocessing

Combined **real-time IoT sensor readings** with a large-scale historical environmental dataset.

Key preprocessing tasks included:

* Data cleaning and transformation
* Feature engineering
* Risk score generation
* Risk classification
* Time-based feature extraction
* Preparation of analytics-ready datasets

### 2. Visual Analytics Dashboard

Developed interactive dashboards for:

* Real-time environmental monitoring
* Historical trend analysis
* Risk assessment
* Alert management
* Zone-wise comparisons
* Interactive filtering
* Brushing and drill-down analysis

The dashboards were designed to help users explore environmental patterns and identify areas requiring attention.

### 3. Machine Learning — Anomaly Detection

Implemented an **Isolation Forest** model to identify abnormal environmental conditions using sensor readings such as:

* Temperature
* Humidity
* Gas concentration

The model was used to detect potential:

* Hazardous gas spikes
* Unusual environmental conditions
* Sensor anomalies or possible sensor failures

### 4. Decision Support System

Developed analytical features to support proactive waste management, including:

* Priority bin ranking
* Zone-wise risk comparison
* Anomaly alerts
* Factor contribution analysis

These features help users identify high-risk areas and prioritise actions based on available data.

### 5. Conversational AI Assistant

Integrated a **Botpress-powered AI assistant** with FastAPI APIs to provide:

* Context-aware dashboard insights
* Natural-language queries
* Explanations of dashboard trends
* Assistance with data exploration

### 6. Deployment

The solution was developed using a **React-based frontend**, **FastAPI backend**, and **MongoDB**, with the analytics dashboard deployed through **Vercel**.

---

## 🏗️ System Architecture

```text
IoT Sensor Data + Historical Environmental Dataset
                         │
                         ▼
              Data Cleaning & Preprocessing
                         │
                         ▼
                Feature Engineering
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
      Visual Analytics        Machine Learning
       & Dashboards            Isolation Forest
             │                       │
             └───────────┬───────────┘
                         ▼
              Risk & Anomaly Analysis
                         │
                         ▼
              Decision Support Features
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
        Dashboard Insights    Conversational AI
                                  Assistant
```

---

## 🛠️ Technologies Used

### Data Science & Machine Learning

* Python
* Pandas
* Scikit-learn
* Isolation Forest

### Frontend & Visual Analytics

* React.js
* Vite
* Recharts
* Chart.js

### Backend & APIs

* FastAPI
* REST APIs

### Database & AI

* MongoDB
* Botpress

### Deployment & Development

* Vercel
* GitHub

---

## 📊 Data & Analytics

The project works with both **real-time sensor data** and **historical environmental data** to support:

* Environmental trend analysis
* Risk classification
* Anomaly detection
* Time-based analysis
* Comparative zone analysis
* Data-driven decision support

---

## ✨ Key Features

* 📡 IoT-based environmental monitoring
* 📊 Interactive visual analytics dashboard
* 🤖 Isolation Forest anomaly detection
* ⚠️ Environmental risk and anomaly alerts
* 🗺️ Zone-wise risk comparison
* 🗑️ Priority bin ranking
* 🔎 Factor contribution analysis
* 💬 AI-powered conversational assistant
* 🔄 FastAPI-based backend services
* ☁️ Web deployment using Vercel



