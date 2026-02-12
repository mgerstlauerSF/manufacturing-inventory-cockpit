# Manufacturing Cockpit - React Application

A modern React + FastAPI dashboard for manufacturing inventory management, converted from the original Streamlit application.

## Architecture

```
manufacturing-cockpit-react/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Full-page views
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # Global CSS + Tailwind
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/               # Python FastAPI
│   ├── api/main.py        # REST endpoints
│   ├── services/          # Snowflake data access
│   └── requirements.txt
│
└── README.md
```

## Features

- **Global Command Center**: KPIs, risk scores, alerts, cash release opportunities
- **Planning Simulator**: Production & inventory scenario modeling with save/load
- **Logistics Optimization**: 3PL provider analytics and consolidation scenarios
- **AI Analytics**: Demand forecasting, anomaly detection, supplier risk intelligence
- **AI Chat Assistant**: Cortex-powered natural language queries

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Snowflake account with MANUFACTURING_DEMO database

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
SNOWFLAKE_CONNECTION_NAME=<your-connection> uvicorn api.main:app --reload
```

The frontend runs at http://localhost:5173 and proxies API requests to the backend at http://localhost:8000.

## Environment Variables

### Backend
- `SNOWFLAKE_CONNECTION_NAME` - Snowflake CLI connection name
- `SNOWFLAKE_DATABASE` - Default: MANUFACTURING_DEMO
- `SNOWFLAKE_SCHEMA` - Default: INVENTORY

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, SWR
- **Backend**: FastAPI, Snowflake Connector, Pydantic
- **AI**: Snowflake Cortex (ML functions, LLM)

## Design Patterns

This application follows the patterns defined in the `snowflake-demo-react-app` skill:

- `fetch-swr-dedup` - SWR for request deduplication and caching
- `bundle-direct-imports` - Direct Lucide icon imports
- `arch-lift-state` - State lifted to appropriate ancestors
- `sf-connection-pool` - Snowflake connection reuse
- `sf-parameterized` - Parameterized SQL queries
- `a11y-aria-labels` - Accessible components with ARIA labels
- `ux-loading-skeleton` - Skeleton loading states
