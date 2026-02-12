import { useState, useMemo, useCallback } from 'react'
import { Settings, Save, RotateCcw } from 'lucide-react'
import { PageHeader, Section } from '../components/PageHeader'
import { MetricCard, KPIGrid } from '../components/MetricCard'
import { LineChartComponent, BarChartComponent, formatCurrency } from '../components/Charts'
import { useDashboardData, useScenarios } from '../hooks/useData'
import { saveScenario } from '../utils/api'

interface SimulationParams {
  productionDelta: number
  leadTimeVariance: number
  safetyStockAdj: number
}

export function SimulatorPage() {
  const { data, isLoading } = useDashboardData()
  const { scenarios, refresh: refreshScenarios } = useScenarios()
  
  const [params, setParams] = useState<SimulationParams>({
    productionDelta: 0,
    leadTimeVariance: 0,
    safetyStockAdj: 0,
  })
  
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioNotes, setScenarioNotes] = useState('')

  const simulation = useMemo(() => {
    if (!data) return null

    const baseAnnualVehicles = 8500
    const componentCostPerVehicle = 520_000
    const baseMonthlyInvValue = 900_000_000
    const inventoryCarryingRate = 0.22

    const prodMultiplier = 1 + (params.productionDelta / 100)
    const leadTimeFactor = 1 + (params.leadTimeVariance / 100)
    const safetyStockFactor = 1 + (params.safetyStockAdj / 100)

    const adjustedAnnualVehicles = Math.round(baseAnnualVehicles * prodMultiplier)
    const monthlyBaseline = baseAnnualVehicles / 12
    const monthlyAdjusted = adjustedAnnualVehicles / 12

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const productionData = months.map((month, idx) => {
      const seasonality = 1 + Math.sin((idx - 3) * Math.PI / 6) * 0.1
      const baseUnits = Math.round(monthlyBaseline * seasonality)
      const adjUnits = Math.round(monthlyAdjusted * seasonality)
      return {
        month,
        baseline: baseUnits,
        simulated: adjUnits,
      }
    })

    let cumulativeBaseCash = 0
    let cumulativeAdjCash = 0
    
    const cashFlowData = months.map((month, idx) => {
      const baseMonthlyCarrying = (baseMonthlyInvValue * inventoryCarryingRate / 12) + (productionData[idx].baseline * componentCostPerVehicle * 0.15)
      const adjMonthlyCarrying = (baseMonthlyInvValue * inventoryCarryingRate / 12 * leadTimeFactor * safetyStockFactor) + (productionData[idx].simulated * componentCostPerVehicle * 0.15 * leadTimeFactor)
      
      cumulativeBaseCash += baseMonthlyCarrying
      cumulativeAdjCash += adjMonthlyCarrying
      
      return {
        month,
        baseline: cumulativeBaseCash,
        simulated: cumulativeAdjCash,
      }
    })

    const totalCashImpact = cumulativeAdjCash - cumulativeBaseCash
    const baseDOI = 42
    const adjustedDOI = baseDOI * leadTimeFactor * safetyStockFactor
    const additionalSafetyStockCost = baseMonthlyInvValue * (safetyStockFactor - 1)
    const workingCapitalImpact = totalCashImpact + additionalSafetyStockCost

    const componentImpact = data.bom
      .filter(b => b.CRITICALITY === 'Critical')
      .map(bom => {
        const baseMonthlyDemand = bom.QUANTITY_PER_VEHICLE * monthlyBaseline
        const adjMonthlyDemand = bom.QUANTITY_PER_VEHICLE * monthlyAdjusted
        const demandDelta = adjMonthlyDemand - baseMonthlyDemand
        const adjustedLeadTime = Math.round(bom.LEAD_TIME_DAYS * leadTimeFactor)
        
        const baseInvValue = baseMonthlyDemand * bom.UNIT_COST_EUR * (bom.LEAD_TIME_DAYS / 30)
        const adjInvValue = adjMonthlyDemand * bom.UNIT_COST_EUR * (adjustedLeadTime / 30) * safetyStockFactor
        const invImpact = adjInvValue - baseInvValue

        const risk = (adjustedLeadTime > 100 || params.productionDelta > 20) ? 'High' : 
                    (adjustedLeadTime > 60 || params.productionDelta > 10) ? 'Medium' : 'Low'

        return {
          component: bom.SKU_NAME,
          productType: bom.VEHICLE_TYPE,
          baseLead: bom.LEAD_TIME_DAYS,
          adjLead: adjustedLeadTime,
          demandDelta: Math.round(demandDelta),
          invImpact,
          risk,
        }
      })
      .sort((a, b) => b.invImpact - a.invImpact)

    return {
      baseAnnualVehicles,
      adjustedAnnualVehicles,
      vehicleDelta: adjustedAnnualVehicles - baseAnnualVehicles,
      totalCashImpact,
      baseDOI,
      adjustedDOI,
      workingCapitalImpact,
      productionData,
      cashFlowData,
      componentImpact,
    }
  }, [data, params])

  const handleSaveScenario = useCallback(async () => {
    if (!scenarioName.trim() || !simulation) return

    try {
      await saveScenario({
        SCENARIO_NAME: scenarioName,
        CREATED_BY: 'User',
        PRODUCTION_DELTA_PCT: params.productionDelta,
        LEAD_TIME_VARIANCE_PCT: params.leadTimeVariance,
        SAFETY_STOCK_ADJ_PCT: params.safetyStockAdj,
        CASH_IMPACT_EUR: simulation.totalCashImpact,
        NOTES: scenarioNotes,
      })
      setShowSaveModal(false)
      setScenarioName('')
      setScenarioNotes('')
      refreshScenarios()
    } catch (error) {
      console.error('Failed to save scenario:', error)
    }
  }, [scenarioName, scenarioNotes, params, simulation, refreshScenarios])

  const resetParams = () => {
    setParams({ productionDelta: 0, leadTimeVariance: 0, safetyStockAdj: 0 })
  }

  if (isLoading || !simulation) {
    return <LoadingSkeleton />
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Production & Inventory Simulator"
        subtitle="Model scenarios before committing resources"
        icon={<Settings className="text-accent-blue" size={20} />}
        actions={
          <div className="flex gap-2">
            <button onClick={resetParams} className="btn-secondary flex items-center gap-2">
              <RotateCcw size={16} />
              Reset
            </button>
            <button onClick={() => setShowSaveModal(true)} className="btn-primary flex items-center gap-2">
              <Save size={16} />
              Save Scenario
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-navy-800/30 border-r border-navy-700/50 p-4 space-y-6 overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Production Adjustments</h3>
            <SliderControl
              label="Production Change"
              value={params.productionDelta}
              min={-30}
              max={50}
              step={5}
              unit="%"
              onChange={(v) => setParams(p => ({ ...p, productionDelta: v }))}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Supply Chain Factors</h3>
            <SliderControl
              label="Lead Time Variance"
              value={params.leadTimeVariance}
              min={-30}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => setParams(p => ({ ...p, leadTimeVariance: v }))}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Inventory Safety Stock</h3>
            <SliderControl
              label="Safety Stock Adjustment"
              value={params.safetyStockAdj}
              min={-50}
              max={100}
              step={10}
              unit="%"
              onChange={(v) => setParams(p => ({ ...p, safetyStockAdj: v }))}
            />
          </div>

          {scenarios.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Saved Scenarios</h3>
              <div className="space-y-2">
                {scenarios.slice(0, 5).map(s => (
                  <button
                    key={s.SCENARIO_ID}
                    onClick={() => setParams({
                      productionDelta: s.PRODUCTION_DELTA_PCT,
                      leadTimeVariance: s.LEAD_TIME_VARIANCE_PCT,
                      safetyStockAdj: s.SAFETY_STOCK_ADJ_PCT,
                    })}
                    className="w-full text-left p-2 bg-navy-700/50 rounded-lg hover:bg-navy-700 transition-colors"
                  >
                    <p className="text-sm text-slate-200 truncate">{s.SCENARIO_NAME}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(s.CASH_IMPACT_EUR)} impact</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-auto p-6 space-y-6">
          <KPIGrid>
            <MetricCard
              title="Annual Production"
              value={`${simulation.adjustedAnnualVehicles.toLocaleString()} units`}
              trend={simulation.vehicleDelta >= 0 ? 'up' : 'down'}
              trendValue={`${simulation.vehicleDelta >= 0 ? '+' : ''}${simulation.vehicleDelta.toLocaleString()} (${params.productionDelta >= 0 ? '+' : ''}${params.productionDelta}%)`}
            />
            <MetricCard
              title="Cash Tied Impact"
              value={formatCurrency(Math.abs(simulation.totalCashImpact))}
              trend={simulation.totalCashImpact > 0 ? 'up' : 'down'}
              trendValue={simulation.totalCashImpact > 0 ? 'increase' : 'decrease'}
              trendInverse
            />
            <MetricCard
              title="Days of Inventory"
              value={`${simulation.adjustedDOI.toFixed(0)} days`}
              trend={simulation.adjustedDOI > simulation.baseDOI ? 'up' : 'down'}
              trendValue={`${(simulation.adjustedDOI - simulation.baseDOI) >= 0 ? '+' : ''}${(simulation.adjustedDOI - simulation.baseDOI).toFixed(0)} days`}
              trendInverse
            />
            <MetricCard
              title="Working Capital Impact"
              value={formatCurrency(Math.abs(simulation.workingCapitalImpact))}
              trend={simulation.workingCapitalImpact > 0 ? 'up' : 'down'}
              trendValue={simulation.workingCapitalImpact > 0 ? 'tied up' : 'freed'}
              trendInverse
            />
          </KPIGrid>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Cash Burn Projection" subtitle="12-month cumulative cash tied">
              <LineChartComponent
                data={simulation.cashFlowData}
                lines={[
                  { dataKey: 'baseline', name: 'Baseline', color: '#64748b', strokeDash: '5 5' },
                  { dataKey: 'simulated', name: 'Simulated', color: '#3b82f6' },
                ]}
                xDataKey="month"
                yLabel="Cumulative Cash (€)"
                height={280}
              />
            </Section>

            <Section title="Monthly Production Comparison" subtitle="Baseline vs simulated output">
              <BarChartComponent
                data={simulation.productionData}
                bars={[
                  { dataKey: 'baseline', name: 'Baseline', color: '#64748b' },
                  { dataKey: 'simulated', name: 'Simulated', color: '#3b82f6' },
                ]}
                xDataKey="month"
                yLabel="Units"
                height={280}
              />
            </Section>
          </div>

          <Section title="Component-Level Impact Analysis" subtitle="Critical components affected by simulation">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-700">
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Component</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Product Type</th>
                    <th className="text-right py-3 px-2 text-slate-400 font-medium">Base Lead</th>
                    <th className="text-right py-3 px-2 text-slate-400 font-medium">Adj. Lead</th>
                    <th className="text-right py-3 px-2 text-slate-400 font-medium">Demand Δ/mo</th>
                    <th className="text-right py-3 px-2 text-slate-400 font-medium">Inventory € Impact</th>
                    <th className="text-center py-3 px-2 text-slate-400 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.componentImpact.slice(0, 10).map((item, idx) => (
                    <tr key={idx} className="border-b border-navy-700/50 hover:bg-navy-700/30">
                      <td className="py-3 px-2 text-slate-200">{item.component}</td>
                      <td className="py-3 px-2 text-slate-400">{item.productType}</td>
                      <td className="py-3 px-2 text-right text-slate-300">{item.baseLead}d</td>
                      <td className="py-3 px-2 text-right text-slate-300">{item.adjLead}d</td>
                      <td className="py-3 px-2 text-right text-slate-300">{item.demandDelta >= 0 ? '+' : ''}{item.demandDelta}</td>
                      <td className="py-3 px-2 text-right text-slate-300">{formatCurrency(item.invImpact)}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.risk === 'High' ? 'bg-red-900/50 text-red-300' :
                          item.risk === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-green-900/50 text-green-300'
                        }`}>
                          {item.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </main>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-xl p-6 w-96 border border-navy-700">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Save Scenario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Scenario Name</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="e.g., Growth Scenario Q2"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Notes</label>
                <textarea
                  value={scenarioNotes}
                  onChange={(e) => setScenarioNotes(e.target.value)}
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-blue h-24 resize-none"
                  placeholder="Describe assumptions..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowSaveModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleSaveScenario} className="btn-primary flex-1" disabled={!scenarioName.trim()}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={`font-medium ${value > 0 ? 'text-accent-green' : value < 0 ? 'text-accent-red' : 'text-slate-300'}`}>
          {value >= 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-20 bg-navy-800/50 animate-pulse" />
      <div className="flex flex-1">
        <div className="w-72 bg-navy-800/30 animate-pulse" />
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-navy-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulatorPage
