const API_BASE = '/api'

export interface Plant {
  PLANT_ID: string
  PLANT_NAME: string
  COUNTRY: string
  REGION: string
  LATITUDE: number
  LONGITUDE: number
  SPECIALIZATION: string
  CAPACITY_UNITS: number
  OPERATIONAL_STATUS: string
}

export interface BOMItem {
  SKU_CODE: string
  SKU_NAME: string
  CATEGORY: string
  VEHICLE_TYPE: string
  CRITICALITY: string
  UNIT_COST_EUR: number
  LEAD_TIME_DAYS: number
  QUANTITY_PER_VEHICLE: number
  SUPPLIER_COUNT: number
  WEIGHT_KG: number
}

export interface Inventory {
  INVENTORY_ID: string
  PLANT_ID: string
  SKU_CODE: string
  CURRENT_STOCK: number
  REORDER_POINT: number
  MAX_STOCK: number
  INVENTORY_VALUE_EUR: number
  LAST_MOVEMENT_DATE: string
  STORAGE_LOCATION: string
}

export interface Financial {
  FINANCIAL_ID: string
  PLANT_ID: string
  FISCAL_YEAR: number
  FISCAL_MONTH: number
  HARD_INVENTORY_VALUE_EUR: number
  SOFT_INVENTORY_VALUE_EUR: number
  CASH_TIED_EUR: number
  INVENTORY_TURNS: number
  CARRYING_COST_EUR: number
}

export interface Provider3PL {
  PROVIDER_ID: string
  PROVIDER_NAME: string
  REGION: string
  SERVICE_TYPE: string
  CONTRACT_VALUE_EUR: number
  PERFORMANCE_SCORE: number
  PLANTS_SERVED: number
  CONTRACT_EXPIRY: string
}

export interface Scenario {
  SCENARIO_ID: string
  SCENARIO_NAME: string
  CREATED_BY: string
  CREATED_AT: string
  PRODUCTION_DELTA_PCT: number
  LEAD_TIME_VARIANCE_PCT: number
  SAFETY_STOCK_ADJ_PCT: number
  CASH_IMPACT_EUR: number
  NOTES: string
}

export interface DashboardData {
  plants: Plant[]
  bom: BOMItem[]
  inventory: Inventory[]
  financials: Financial[]
  providers_3pl: Provider3PL[]
  scenarios: Scenario[]
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export async function fetchDashboardData(): Promise<DashboardData> {
  return fetchJSON<DashboardData>(`${API_BASE}/dashboard`)
}

export async function fetchPlants(): Promise<Plant[]> {
  return fetchJSON<Plant[]>(`${API_BASE}/plants`)
}

export async function fetchInventory(): Promise<Inventory[]> {
  return fetchJSON<Inventory[]>(`${API_BASE}/inventory`)
}

export async function fetchFinancials(): Promise<Financial[]> {
  return fetchJSON<Financial[]>(`${API_BASE}/financials`)
}

export async function fetchProviders(): Promise<Provider3PL[]> {
  return fetchJSON<Provider3PL[]>(`${API_BASE}/providers`)
}

export async function fetchScenarios(): Promise<Scenario[]> {
  return fetchJSON<Scenario[]>(`${API_BASE}/scenarios`)
}

export async function saveScenario(scenario: Omit<Scenario, 'SCENARIO_ID' | 'CREATED_AT'>): Promise<Scenario> {
  const response = await fetch(`${API_BASE}/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario),
  })
  if (!response.ok) {
    throw new Error(`Failed to save scenario: ${response.status}`)
  }
  return response.json()
}

export async function sendChatMessage(message: string, threadId?: string): Promise<{
  response: string
  sources?: Array<{ title: string; snippet?: string }>
  sql?: string
  context?: any
  thread_id?: string
}> {
  const response = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, thread_id: threadId }),
  })
  if (!response.ok) {
    throw new Error(`Chat error: ${response.status}`)
  }
  return response.json()
}

export function formatCurrency(value: number): string {
  if (value >= 1e9) return `€${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `€${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `€${(value / 1e3).toFixed(0)}K`
  return `€${value.toFixed(0)}`
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number): string {
  return value.toLocaleString()
}
