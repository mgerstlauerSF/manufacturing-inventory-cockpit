import { useState, useMemo } from 'react'
import { Bot, Sparkles, AlertTriangle, Shield } from 'lucide-react'
import { PageHeader, Section } from '../components/PageHeader'
import { LineChartComponent, PieChartComponent } from '../components/Charts'
import { useDashboardData } from '../hooks/useData'

export function AIAnalyticsPage() {
  const { data, isLoading } = useDashboardData()
  const [selectedSKU, setSelectedSKU] = useState('')
  const [demandScenario, setDemandScenario] = useState(0)
  const [anomalyMetric, setAnomalyMetric] = useState('Lead Time Delays')

  const criticalSKUs = useMemo(() => {
    if (!data) return []
    return data.bom.filter(b => b.CRITICALITY === 'Critical').slice(0, 5)
  }, [data])

  const forecastData = useMemo(() => {
    if (!selectedSKU && criticalSKUs.length > 0) {
      setSelectedSKU(criticalSKUs[0].SKU_NAME)
    }

    const baseDemand = 1200 + (selectedSKU.length * 50)
    const demandMultiplier = 1 + (demandScenario / 100)

    const historical = Array.from({ length: 6 }, (_, i) => ({
      month: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][i],
      demand: Math.round(baseDemand * (1 + (Math.random() - 0.5) * 0.2)),
      type: 'Historical',
    }))

    const forecast = Array.from({ length: 6 }, (_, i) => ({
      month: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i],
      demand: Math.round(historical[5].demand * demandMultiplier * (1 + i * 0.03 + (Math.random() - 0.5) * 0.1)),
      type: 'Forecast',
    }))

    const combined = historical.map(h => ({
      month: h.month,
      actual: h.demand,
      forecast: null as number | null,
    })).concat(forecast.map((f, i) => ({
      month: f.month,
      actual: i === 0 ? historical[5].demand : null as number | null,
      forecast: f.demand,
    })))

    const pctChange = ((forecast[5].demand - historical[5].demand) / historical[5].demand) * 100
    const baseAccuracy = 94.2
    const adjustedAccuracy = Math.max(75, baseAccuracy - Math.abs(demandScenario) * 0.15)

    return {
      data: combined,
      pctChange,
      accuracy: adjustedAccuracy,
      confidence: Math.abs(demandScenario) < 15 ? '95%' : Math.abs(demandScenario) < 30 ? '85%' : '75%',
    }
  }, [selectedSKU, demandScenario, criticalSKUs])

  const anomalyData = useMemo(() => {
    const days = Array.from({ length: 90 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (90 - i))
      return date.toISOString().split('T')[0]
    })

    let baseline: number, values: number[], unit: string
    const anomalyIndices: number[] = []

    if (anomalyMetric === 'Lead Time Delays') {
      baseline = 45
      values = days.map((_, i) => {
        let val = baseline + (Math.random() - 0.5) * 10
        if (i === 23 || i === 24) { val = baseline + 28; anomalyIndices.push(i) }
        if (i === 67 || i === 68) { val = baseline + 22; anomalyIndices.push(i) }
        return val
      })
      unit = 'days'
    } else if (anomalyMetric === 'Cost Variations') {
      baseline = 125000
      values = days.map((_, i) => {
        let val = baseline + (Math.random() - 0.5) * 16000
        if (i === 15) { val = baseline + 45000; anomalyIndices.push(i) }
        if (i === 45) { val = baseline - 38000; anomalyIndices.push(i) }
        if (i === 78) { val = baseline + 52000; anomalyIndices.push(i) }
        return val
      })
      unit = '€'
    } else {
      baseline = 96
      values = days.map((_, i) => {
        let val = Math.min(100, baseline + (Math.random() - 0.5) * 4)
        if (i === 30 || i === 31) { val = 78; anomalyIndices.push(i) }
        if (i === 60) { val = 75; anomalyIndices.push(i) }
        return val
      })
      unit = '%'
    }

    const chartData = days.map((date, i) => ({
      date: date.slice(5),
      value: values[i],
      isAnomaly: anomalyIndices.includes(i),
    }))

    const detectedAnomalies = anomalyIndices.slice(0, 3).map(idx => {
      const deviation = ((values[idx] - baseline) / baseline) * 100
      return {
        date: days[idx],
        value: values[idx],
        deviation,
        severity: Math.abs(deviation) > 30 ? 'HIGH' : 'MEDIUM',
      }
    })

    return { chartData, baseline, unit, detectedAnomalies }
  }, [anomalyMetric])

  const supplierRiskData = [
    { name: 'Global Components Ltd', region: 'Asia-Pacific', spend: 45000000, news: 'Recent port congestion in Shanghai affecting shipments. Company announced new facility in Vietnam.', riskScore: 72 },
    { name: 'EuroTech Industries', region: 'Europe', spend: 38000000, news: 'Stable operations. Won sustainability award. Minor labor negotiations ongoing.', riskScore: 35 },
    { name: 'AmeriParts Inc', region: 'Americas', spend: 32000000, news: 'Strong Q4 results. Expanding capacity in Mexico. No supply disruptions reported.', riskScore: 22 },
    { name: 'Pacific Manufacturing', region: 'Asia-Pacific', spend: 28000000, news: 'Facing raw material cost increases. Key executive departure announced.', riskScore: 68 },
    { name: 'Nordic Precision AB', region: 'Europe', spend: 25000000, news: 'Energy cost concerns in winter months. Otherwise stable operations.', riskScore: 41 },
  ]

  const riskDistribution = [
    { level: 'High Risk', count: 2, color: '#ef4444' },
    { level: 'Medium Risk', count: 1, color: '#f59e0b' },
    { level: 'Low Risk', count: 2, color: '#10b981' },
  ]

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="AI-Powered Analytics"
        subtitle="Snowflake Cortex ML & LLM insights"
        icon={<Bot className="text-accent-purple" size={20} />}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="p-4 bg-gradient-to-r from-purple-900/50 to-violet-900/50 rounded-xl border border-purple-700/30">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-400" size={20} />
            <span className="text-purple-200 font-medium">Powered by Snowflake Cortex</span>
          </div>
          <p className="text-sm text-purple-300/80 mt-1">
            ML FORECAST(), ANOMALY_DETECTION(), and LLM COMPLETE() functions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="AI Demand Forecast" subtitle="Cortex ML FORECAST() - Predict demand by SKU">
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Select Component</label>
                <select
                  value={selectedSKU}
                  onChange={(e) => setSelectedSKU(e.target.value)}
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-purple"
                >
                  {criticalSKUs.map(sku => (
                    <option key={sku.SKU_CODE} value={sku.SKU_NAME}>{sku.SKU_NAME}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Demand Scenario Adjustment</span>
                  <span className={`font-medium ${demandScenario > 0 ? 'text-accent-green' : demandScenario < 0 ? 'text-accent-red' : 'text-slate-300'}`}>
                    {demandScenario >= 0 ? '+' : ''}{demandScenario}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={50}
                  step={5}
                  value={demandScenario}
                  onChange={(e) => setDemandScenario(Number(e.target.value))}
                  className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-accent-purple"
                />
              </div>
            </div>

            <LineChartComponent
              data={forecastData.data}
              lines={[
                { dataKey: 'actual', name: 'Actual Demand', color: '#3b82f6' },
                { dataKey: 'forecast', name: 'Forecast', color: '#8b5cf6' }
              ]}
              xDataKey="month"
              yLabel="Units"
              height={250}
            />

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="p-3 bg-navy-700/50 rounded-lg">
                <p className="text-xs text-slate-400">6-Month Trend</p>
                <p className={`text-lg font-semibold ${forecastData.pctChange > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {forecastData.pctChange >= 0 ? '+' : ''}{forecastData.pctChange.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-navy-700/50 rounded-lg">
                <p className="text-xs text-slate-400">Forecast Accuracy</p>
                <p className="text-lg font-semibold text-slate-100">{forecastData.accuracy.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-navy-700/50 rounded-lg">
                <p className="text-xs text-slate-400">Confidence</p>
                <p className="text-lg font-semibold text-slate-100">{forecastData.confidence}</p>
              </div>
            </div>

            {demandScenario !== 0 && (
              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                <p className="text-sm text-yellow-200">
                  Scenario: {Math.abs(demandScenario)}% demand {demandScenario > 0 ? 'increase' : 'decrease'} applied
                </p>
              </div>
            )}
          </Section>

          <Section title="Anomaly Detection" subtitle="Cortex ML ANOMALY_DETECTION() - Detect unusual patterns">
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Monitor Metric</label>
              <select
                value={anomalyMetric}
                onChange={(e) => setAnomalyMetric(e.target.value)}
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-purple"
              >
                <option>Lead Time Delays</option>
                <option>Cost Variations</option>
                <option>Delivery Performance</option>
              </select>
            </div>

            <LineChartComponent
              data={anomalyData.chartData}
              lines={[{ dataKey: 'value', name: anomalyMetric, color: '#3b82f6' }]}
              xDataKey="date"
              yLabel={anomalyData.unit}
              height={250}
            />

            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-accent-red" />
                Detected Anomalies
              </h4>
              <div className="space-y-2">
                {anomalyData.detectedAnomalies.map((anomaly, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${anomaly.severity === 'HIGH' ? 'bg-red-900/30 border-l-4 border-red-500' : 'bg-yellow-900/30 border-l-4 border-yellow-500'}`}>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-200">{anomaly.date}</span>
                      <span className={`text-xs font-bold ${anomaly.severity === 'HIGH' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {anomaly.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Value: {anomaly.value.toFixed(1)} {anomalyData.unit} | Deviation: {anomaly.deviation >= 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <Section title="Supplier Risk Intelligence" subtitle="Cortex LLM COMPLETE() - AI-analyzed supplier assessment">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {supplierRiskData.map((supplier, idx) => (
                <div key={idx} className={`p-4 bg-navy-700/50 rounded-xl border-l-4 ${supplier.riskScore > 60 ? 'border-red-500' : supplier.riskScore > 40 ? 'border-yellow-500' : 'border-green-500'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-100">{supplier.name}</h4>
                      <p className="text-xs text-slate-400">{supplier.region} | Annual Spend: €{(supplier.spend / 1e6).toFixed(0)}M</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${supplier.riskScore > 60 ? 'text-red-400' : supplier.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {supplier.riskScore}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${supplier.riskScore > 60 ? 'bg-red-900/50 text-red-300' : supplier.riskScore > 40 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-green-900/50 text-green-300'}`}>
                        {supplier.riskScore > 60 ? 'HIGH RISK' : supplier.riskScore > 40 ? 'MEDIUM' : 'LOW RISK'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-navy-800/50 rounded-lg">
                    <p className="text-xs text-slate-300">
                      <span className="text-purple-400 font-medium">AI Analysis: </span>
                      {supplier.news}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Risk Distribution</h4>
                <PieChartComponent
                  data={riskDistribution}
                  dataKey="count"
                  nameKey="level"
                  colors={riskDistribution.map(r => r.color)}
                  height={200}
                />
              </div>

              <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-blue-400" size={16} />
                  <h4 className="text-sm font-medium text-blue-200">AI Recommendations</h4>
                </div>
                <ul className="text-xs text-blue-300/80 space-y-1">
                  <li>1. Diversify Asia-Pacific sourcing</li>
                  <li>2. Increase safety stock for high-risk suppliers</li>
                  <li>3. Initiate supplier review for Pacific Manufacturing</li>
                </ul>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-20 bg-navy-800/50 animate-pulse" />
      <div className="flex-1 p-6 space-y-6">
        <div className="h-16 bg-purple-900/30 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-96 bg-navy-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AIAnalyticsPage
