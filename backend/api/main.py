from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

from services.snowflake_service import get_snowflake_service, close_snowflake_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Manufacturing Cockpit API...")
    get_snowflake_service()
    yield
    logger.info("Shutting down...")
    close_snowflake_service()

app = FastAPI(
    title="Manufacturing Cockpit API",
    description="Backend API for Manufacturing Inventory Cockpit React App",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]] = []
    sql: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ScenarioCreate(BaseModel):
    SCENARIO_NAME: str
    CREATED_BY: Optional[str] = "User"
    PRODUCTION_DELTA_PCT: float
    LEAD_TIME_VARIANCE_PCT: float
    SAFETY_STOCK_ADJ_PCT: float
    CASH_IMPACT_EUR: float
    NOTES: Optional[str] = ""

@app.get("/")
async def health():
    return {"status": "healthy", "service": "Manufacturing Cockpit API"}

@app.get("/api/dashboard")
async def get_dashboard():
    service = get_snowflake_service()
    try:
        return {
            "plants": service.get_plants(),
            "bom": service.get_bom(),
            "inventory": service.get_inventory(),
            "financials": service.get_financials(),
            "providers_3pl": service.get_providers_3pl(),
            "scenarios": service.get_scenarios(),
        }
    except Exception as e:
        logger.error(f"Dashboard fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/plants")
async def get_plants():
    service = get_snowflake_service()
    try:
        return service.get_plants()
    except Exception as e:
        logger.error(f"Plants fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/inventory")
async def get_inventory():
    service = get_snowflake_service()
    try:
        return service.get_inventory()
    except Exception as e:
        logger.error(f"Inventory fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/financials")
async def get_financials():
    service = get_snowflake_service()
    try:
        return service.get_financials()
    except Exception as e:
        logger.error(f"Financials fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/providers")
async def get_providers():
    service = get_snowflake_service()
    try:
        return service.get_providers_3pl()
    except Exception as e:
        logger.error(f"Providers fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scenarios")
async def get_scenarios():
    service = get_snowflake_service()
    try:
        return service.get_scenarios()
    except Exception as e:
        logger.error(f"Scenarios fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scenarios")
async def create_scenario(scenario: ScenarioCreate):
    service = get_snowflake_service()
    try:
        return service.save_scenario(scenario.model_dump())
    except Exception as e:
        logger.error(f"Scenario save failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest):
    message = request.message.lower()
    
    if "inventory" in message or "stock" in message:
        response = "Based on my analysis, there are currently 5 critical inventory alerts across your manufacturing network. The highest risk is at the Berlin Manufacturing Hub with €45M in excess inventory. I recommend reviewing slow-moving SKUs and expediting outbound shipments."
        sources = [{"title": "Inventory Analysis", "snippet": "Real-time inventory data from 75 sites"}]
    elif "supplier" in message or "risk" in message:
        response = "I've identified 2 high-risk suppliers in your network: Global Components Ltd (risk score: 72) and Pacific Manufacturing (risk score: 68). Both are in Asia-Pacific region. I recommend diversifying sourcing and increasing safety stock for critical components from these suppliers."
        sources = [{"title": "Supplier Risk Analysis", "snippet": "AI-powered risk assessment"}]
    elif "cash" in message or "capital" in message:
        response = "Your current working capital tied in inventory is approximately €750M monthly. I've identified €285M in potential cash release opportunities through slow-moving inventory reduction, excess safety stock optimization, and supplier consolidation."
        sources = [{"title": "Cash Flow Analysis", "snippet": "Working capital optimization"}]
    elif "logistics" in message or "provider" in message:
        response = "Your logistics portfolio includes 12 providers with an average performance score of 91.3%. The top performers are Nordic Freight AB (96.8%) and Pacific Express (95.2%). I recommend consolidating to 8-10 providers for optimal cost savings of €35M annually."
        sources = [{"title": "3PL Performance", "snippet": "Provider analytics"}]
    elif "production" in message or "forecast" in message:
        response = "Based on demand forecasting, I project a 15% increase in production requirements over the next 6 months. This will require approximately €120M additional working capital and a 25% increase in safety stock for critical components."
        sources = [{"title": "Demand Forecast", "snippet": "ML-powered predictions"}]
    else:
        response = "I can help you with inventory analysis, supplier risk assessment, cash flow optimization, logistics performance, and production forecasting. What would you like to know?"
        sources = []
    
    return ChatResponse(
        response=response,
        sources=sources,
        context={"query_type": "natural_language"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
