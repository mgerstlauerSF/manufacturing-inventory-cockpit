import { useMemo } from 'react'
import { LayoutDashboard, Package, Truck, DollarSign, AlertTriangle } from 'lucide-react'
import { PageHeader, Section, AlertCard } from '../components/PageHeader'
import { MetricCard, KPIGrid } from '../components/MetricCard'
import { WaterfallChart, RiskGauge, BarChartComponent, formatCurrency } from '../components/Charts'
import { useDashboardData } from '../hooks/useData'

export function CommandCenterPage() {
  const { data, isLoading } = useDashboardData()

  const metrics = useMemo(() => {
    if (!data) return null

    const totalInventoryValue = data.financials.reduce((sum, f) => sum + f.HARD_INVENTORY_VALUE_EUR, 0)
    const totalCashTied = data.financials.reduce((sum, f) => sum + f.CASH_TIED_EUR, 0)
    const total3PLSpend = data.providers_3pl.reduce((sum, p) => sum + p.CONTRACT_VALUE_EUR, 0)
    const budget3PL = 200_000_000

    const plantInventory = data.inventory.reduce((acc, inv) => {
      acc[inv.PLANT_ID] = (acc[inv.PLANT_ID] || 0) + inv.INVENTORY_VALUE_EUR
      return acc
    }, {} as Record<string, number>)

    const plantData = data.plants.map(plant => ({
      ...plant,
      inventoryValue: plantInventory[plant.PLANT_ID] || 0,
    }))

    const values = plantData.map(p => p.inventoryValue)
    const p75 = quantile(values, 0.75)
    const p50 = quantile(values, 0.50)

    const plantsWithStatus = plantData.map(plant => ({
      ...plant,
      status: plant.inventoryValue > p75 ? 'Critical' : plant.inventoryValue > p50 ? 'Warning' : 'Normal',
    }))

    const criticalPlants = plantsWithStatus.filter(p => p.status === 'Critical').sort((a, b) => b.inventoryValue - a.inventoryValue).slice(0, 5)
    const warningPlants = plantsWithStatus.filter(p => p.status === 'Warning').sort((a, b) => b.inventoryValue - a.inventoryValue).slice(0, 3)

    const inventoryWithBOM = data.inventory.map(inv => {
      const bom = data.bom.find(b => b.SKU_CODE === inv.SKU_CODE)
      const plant = data.plants.find(p => p.PLANT_ID === inv.PLANT_ID)
      return { ...inv, bom, plant }
    })

    const criticalSKUs = inventoryWithBOM
      .filter(inv => inv.bom?.CRITICALITY === 'Critical' && inv.CURRENT_STOCK < inv.REORDER_POINT)
      .sort((a, b) => (b.REORDER_POINT - b.CURRENT_STOCK) - (a.REORDER_POINT - a.CURRENT_STOCK))
      .slice(0, 5)

    const slowMovingValue = data.inventory.reduce((sum, inv) => sum + inv.INVENTORY_VALUE_EUR * 0.3, 0)
    const excessSafetyStock = totalInventoryValue * 0.12
    const supplierConsolidation = total3PLSpend * 0.08
    const leadTimeReduction = totalInventoryValue * 0.05
    const totalOpportunity = slowMovingValue + excessSafetyStock + supplierConsolidation + leadTimeReduction

    const cashReleaseData = [
      { category: 'Slow-Moving\nInventory', value: slowMovingValue },
      { category: 'Excess Safety\nStock', value: excessSafetyStock },
      { category: 'Supplier\nConsolidation', value: supplierConsolidation },
      { category: 'Lead Time\nReduction', value: leadTimeReduction },
      { category: 'Total\nOpportunity', value: totalOpportunity },
    ]

    const riskScore = calculateRiskScore(data)

    const stockoutForecast = calculateStockoutForecast(inventoryWithBOM)

    const regionStatus = ['Europe', 'Americas', 'Asia-Pacific', 'MEA'].map(region => {
      const regionPlants = plantsWithStatus.filter(p => p.REGION === region)
      return {
        region,
        critical: regionPlants.filter(p => p.status === 'Critical').length,
        warning: regionPlants.filter(p => p.status === 'Warning').length,
        normal: regionPlants.filter(p => p.status === 'Normal').length,
      }
    })

    return {
      totalInventoryValue: totalInventoryValue / 12,
      totalCashTied: totalCashTied / 12,
      total3PLSpend,
      budget3PL,
      criticalPlants,
      warningPlants,
      criticalSKUs,
      cashReleaseData,
      riskScore,
      stockoutForecast,
      regionStatus,
      statusCounts: {
        critical: plantsWithStatus.filter(p => p.status === 'Critical').length,
        warning: plantsWithStatus.filter(p => p.status === 'Warning').length,
        normal: plantsWithStatus.filter(p => p.status === 'Normal').length,
      }
    }
  }, [data])

  if (isLoading || !metrics) {
    return <LoadingSkeleton />
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Global Command Center"
        subtitle="Real-time operational overview across 75 manufacturing sites"
        icon={<LayoutDashboard className="text-accent-blue" size={20} />}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <KPIGrid>
          <MetricCard
            title="Hard Inventory Value"
            value={formatCurrency(metrics.totalInventoryValue)}
            trend="up"
            trendValue="+2.3%"
            trendInverse
            icon={<Package className="text-accent-blue" size={20} />}
          />
          <MetricCard
            title="Logistics Spend vs Budget"
            value={`${((metrics.total3PLSpend / metrics.budget3PL) * 100).toFixed(0)}%`}
            subtitle={`${formatCurrency(Math.abs(metrics.budget3PL - metrics.total3PLSpend))} under`}
            trend="down"
            icon={<Truck className="text-accent-blue" size={20} />}
          />
          <MetricCard
            title="Days of Inventory (DOI)"
            value="42 days"
            trend="down"
            trendValue="-3 days"
            trendInverse
            icon={<Package className="text-accent-blue" size={20} />}
          />
          <MetricCard
            title="Cash Tied in Inventory"
            value={formatCurrency(metrics.totalCashTied)}
            trend="up"
            trendValue="+€45M risk"
            trendInverse
            icon={<DollarSign className="text-accent-blue" size={20} />}
          />
        </KPIGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Section title="Global Site Overview" subtitle="Status by region">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 p-3 bg-red-900/20 rounded-lg">
                  <div className="w-3 h-3 bg-accent-red rounded-full" />
                  <span className="text-sm text-slate-300">Critical: {metrics.statusCounts.critical}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-900/20 rounded-lg">
                  <div className="w-3 h-3 bg-accent-yellow rounded-full" />
                  <span className="text-sm text-slate-300">Warning: {metrics.statusCounts.warning}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg">
                  <div className="w-3 h-3 bg-accent-green rounded-full" />
                  <span className="text-sm text-slate-300">Normal: {metrics.statusCounts.normal}</span>
                </div>
              </div>
              {console.log('regionStatus:', JSON.stringify(metrics.regionStatus))}
              <BarChartComponent
                data={metrics.regionStatus}
                bars={[
                  { dataKey: 'critical', name: 'Critical', color: '#ef4444' },
                  { dataKey: 'warning', name: 'Warning', color: '#f59e0b' },
                  { dataKey: 'normal', name: 'Normal', color: '#10b981' },
                ]}
                xDataKey="region"
                yLabel="Sites"
                height={180}
                stacked
              />
            </Section>
          </div>

          <Section title="Critical Site Alerts" subtitle="Sites requiring attention">
            {metrics.criticalPlants.length > 0 ? (
              metrics.criticalPlants.map(plant => (
                <AlertCard
                  key={plant.PLANT_ID}
                  type="critical"
                  title={plant.PLANT_NAME}
                  description={`${plant.COUNTRY} | ${plant.SPECIALIZATION}`}
                  details={`Inventory: ${formatCurrency(plant.inventoryValue)}`}
                  action="Review slow-moving SKUs, expedite outbound shipments"
                />
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No critical alerts</p>
              </div>
            )}
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section title="Cash Release Opportunities" subtitle="Potential working capital freed">
            <WaterfallChart
              data={metrics.cashReleaseData}
              dataKey="value"
              nameKey="category"
              totalLabel="Total\nOpportunity"
              height={280}
            />
            <div className="mt-4 p-4 bg-gradient-to-r from-accent-green to-accent-green/80 rounded-xl text-center">
              <p className="text-sm text-white/80">Total Cash Release Potential</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(metrics.cashReleaseData[4].value)}</p>
            </div>
          </Section>

          <Section title="Supply Chain Risk Score" subtitle="Composite risk indicator">
            <div className="flex justify-center py-4">
              <RiskGauge score={metrics.riskScore.total} />
            </div>
            <div className="space-y-3 mt-4">
              {metrics.riskScore.breakdown.map(item => (
                <div key={item.factor}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{item.factor}</span>
                    <span className="text-slate-300">{item.score.toFixed(1)}/{item.max}</span>
                  </div>
                  <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.score / item.max) * 100}%`,
                        backgroundColor: item.score / item.max > 0.7 ? '#ef4444' : item.score / item.max > 0.5 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Stock-out Forecast" subtitle="Components at risk in 30/60/90 days">
            <BarChartComponent
              data={metrics.stockoutForecast}
              bars={[{ dataKey: 'count', name: 'SKUs at Risk', color: '#ef4444' }]}
              xDataKey="horizon"
              height={200}
            />
            <div className="mt-4 space-y-2">
              {metrics.criticalSKUs.slice(0, 3).map(sku => (
                <div key={sku.INVENTORY_ID} className="p-2 bg-navy-700/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-200 truncate">{sku.bom?.SKU_NAME || 'Unknown'}</span>
                    <span className="text-xs text-accent-red font-medium">
                      {Math.max(0, 100 - (sku.CURRENT_STOCK / sku.REORDER_POINT * 100)).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Stock: {sku.CURRENT_STOCK} / Reorder: {sku.REORDER_POINT}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-20 bg-navy-800/50 animate-pulse" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-navy-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-navy-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

function quantile(arr: number[], q: number): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base])
  }
  return sorted[base]
}

function calculateRiskScore(data: any) {
  const supplierConcentration = 35 / 100 * 30
  const avgLeadTime = data.bom.reduce((sum: number, b: any) => sum + b.LEAD_TIME_DAYS, 0) / data.bom.length
  const leadTimeRisk = Math.min(30, (avgLeadTime / 90) * 30)
  const geoRisk = 8
  const stockRisk = 12

  const total = supplierConcentration + leadTimeRisk + geoRisk + stockRisk

  return {
    total,
    breakdown: [
      { factor: 'Supplier Concentration', score: supplierConcentration, max: 30 },
      { factor: 'Lead Time Variability', score: leadTimeRisk, max: 30 },
      { factor: 'Geographic Exposure', score: geoRisk, max: 25 },
      { factor: 'Stock-out Risk', score: stockRisk, max: 15 },
    ]
  }
}

function calculateStockoutForecast(inventoryWithBOM: any[]) {
  const critical = inventoryWithBOM.filter(inv => inv.bom?.CRITICALITY === 'Critical')
  
  const stockout30 = critical.filter(inv => {
    const coverage = inv.CURRENT_STOCK / (inv.REORDER_POINT / 30)
    return coverage < 30
  }).length

  const stockout60 = critical.filter(inv => {
    const coverage = inv.CURRENT_STOCK / (inv.REORDER_POINT / 30)
    return coverage >= 30 && coverage < 60
  }).length

  const stockout90 = critical.filter(inv => {
    const coverage = inv.CURRENT_STOCK / (inv.REORDER_POINT / 30)
    return coverage >= 60 && coverage < 90
  }).length

  return [
    { horizon: '30 Days', count: stockout30 },
    { horizon: '60 Days', count: stockout60 },
    { horizon: '90 Days', count: stockout90 },
  ]
}

export default CommandCenterPage
