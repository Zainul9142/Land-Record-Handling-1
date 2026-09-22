# BhoomiShield — Real-Time Land Record & Legal AI Intelligence Platform

> **BhoomiShield Pan-India Land Governance & Risk Intelligence Platform**  
> *Verify Land Records • Detect Cross-Layer Risk • Grounded AI Legal Advice • QR Certified Verification Reports*

[![Deploy to Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://app.netlify.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 🌟 Overview

**BhoomiShield** is an intelligent verification and risk intelligence layer designed for Jharkhand's land governance ecosystem. It bridges disconnected government services — including **Jharbhoomi**, **JharBhuNaksha**, and **Registration services** — into a unified, explainable Land Identity framework.

With BhoomiShield, citizens, prospective buyers, financial institutions, and revenue officers (Circle Officers & LRDCs) can instantly detect record discrepancies, evaluate title risks, access statutory legal advice, track mutation SLAs, and verify tamper-proof PDF reports using QR codes.

---

## ✨ Core Features

1. **Unified Land Identity (`JH-BOK-CHS-MAU-K125-K450-2`)**:
   - Assigns a standardized canonical ID linking Khatian (Record of Rights), Register-II (Tenant Roll), Dakhil-Kharij (Mutations), Registration Deeds, Revenue Court cases, and Cadastral maps.

2. **Deterministic Risk Engine (Rules R001–R008)**:
   - Evaluates cross-record inconsistencies automatically with a composite 0–100 risk score:
     - **R001**: Khatian vs. Register-II Owner Mismatch
     - **R002**: Recorded Area Discrepancy (>0.05 Acre)
     - **R003**: Missing Cadastral Polygon Layer
     - **R004 / R005**: Pending Mutation & Overdue SLA (>30 Days)
     - **R006**: Unmutated Registration Sale Deeds
     - **R007**: Active Revenue / Civil Court Stay Orders
     - **R008**: Bank Encumbrance / Mortgage Charges

3. **3D Cadastral & 2D GIS Interactive Map**:
   - **3D Land Extrusion (`LandMap3D`)**: Interactive perspective polygon extrusions, 360° camera orbit spin, elevation controls, and real-time land measurement conversions (Acres, Decimals, Sq. Ft, Sq. Meters).
   - **2D Spatial Map (`LandMap`)**: Leaflet-powered cadastral boundaries with OpenStreetMap and Satellite imagery toggles.

4. **Grounded AI Legal Advisor & Assistant**:
   - Grounded in the **Chota Nagpur Tenancy (CNT) Act 1908**, **Santhal Parganas Tenancy (SPT) Act 1949**, **Jharkhand Land Mutation Rules 2011**, **Registration Act 1908**, and **Specific Relief Act**. Provides 100% evidence-cited answers.

5. **Authority Grievance Redressal**:
   - Enables citizens to submit formal complaints directly to Circle Officers (CO), LRDC, or District Collectors with downloadable signed complaint PDFs.

6. **QR Code Certified Land Reports**:
   - Generates SHA-256 signed land verification PDFs with embedded QR codes linking to anti-tamper public verification URLs (`/verify/BS-2026-XXXX`).

7. **Revenue Officer Review Dashboard**:
   - Circle-wide analytics, flagged cases queue, evidence inspection, and audit log tracking.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism UI
- **Mapping & Charts**: React-Leaflet, Leaflet, Recharts, Custom 3D CSS Isometric Engine

### **Backend**
- **Framework**: Python 3.10+, FastAPI, Uvicorn
- **Database**: SQLite3 (`bhoomishield.db`)
- **PDF Generation**: ReportLab, PyQRNative / QRCoder
- **AI & Analytics**: Custom Rule Matrix Engine & Grounded Explainer Engine

---

## 🚀 Quick Start Guide

### 1. Clone Repository
```bash
git clone https://github.com/Zainul9142/Land-Record-Handling.git
cd Land-Record-Handling
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`*

### 3. Backend Setup
```bash
cd ../backend
pip install -r requirements.txt
python -m app.main
```
*Backend API runs at `http://localhost:8000` (Swagger UI at `http://localhost:8000/docs`)*

---

## 🌐 Deploy to Netlify

BhoomiShield frontend is ready for 1-click Netlify deployment with pre-configured `netlify.toml` and client-side simulation modes for instant demonstration:

1. Import your GitHub repository (`Land-Record-Handling`) into [Netlify](https://app.netlify.com).
2. Netlify will auto-detect the configuration from `netlify.toml`:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
3. Click **"Deploy Site"**. The full responsive React + Leaflet 3D GIS platform will build and deploy in seconds!

---

## 📸 Key Application Interfaces

| Module | Description |
| :--- | :--- |
| **Universal Search** | Real-time live query connected to Jharbhoomi portal streams with quick filter presets. |
| **Land Profile** | 3D Cadastral view, multi-record comparison, risk breakdown, and PDF report generation. |
| **AI Legal Advisor** | Statutory legal advice on CNT/SPT Acts, mutation delays, and partition suits. |
| **Grievance Redressal** | Formally file complaints to CO / LRDC with downloadable signed PDFs. |
| **Official Dashboard** | Revenue officer decision logging and immutable audit trail. |

---

## 📄 License
This project is developed under the MIT License for Land Governance & Revenue Records Modernization.
