import { useMemo, useState } from 'react'
import { Truck, TrendingUp, MapPin } from 'lucide-react'
import { PageHeader, Section } from '../components/PageHeader'
import { MetricCard, KPIGrid } from '../components/MetricCard'
import { ScatterChartComponent, PieChartComponent, formatCurrency, REGION_COLORS } from '../components/Charts'
import { useDashboardData } from '../hooks/useData'

export function LogisticsPage() {
  const { data, isLoading } = useDashboardData()
  const [targetProviders, setTargetProviders] = useState(10)

  const metrics = useMemo(() => {
    if (!data) return null

    const providers = data.providers_3pl
    const totalSpend = providers.reduce((sum, p) => sum + p.CONTRACT_VALUE_EUR, 0)
    const avgPerformance = providers.reduce((sum, p) => sum + p.PERFORMANCE_SCORE, 0) / providers.length
    const totalPlantsServed = providers.reduce((sum, p) => sum + p.PLANTS_SERVED, 0)
    const budget = 200_000_000

    const regionSpend = providers.reduce((acc, p) => {
      acc[p.REGION] = (acc[p.REGION] || 0) + p.CONTRACT_VALUE_EUR
      return acc
    }, {} as Record<string, number>)

    const regionData = Object.entries(regionSpend).map(([region, value]) => ({
      region,
      value,
      percentage: (value / totalSpend) * 100,
    }))

    const scatterData = providers.map(p => ({
      name: p.PROVIDER_NAME,
      contractValue: p.CONTRACT_VALUE_EUR,
      performance: p.PERFORMANCE_SCORE,
      plantsServed: p.PLANTS_SERVED,
      region: p.REGION,
    }))

    const topProviders = [...providers].sort((a, b) => b.PERFORMANCE_SCORE - a.PERFORMANCE_SCORE).slice(0, targetProviders)
    const consolidatedSpend = topProviders.reduce((sum, p) => sum + p.CONTRACT_VALUE_EUR, 0)
    const projectedSavings = totalSpend - consolidatedSpend
    const newAvgPerformance = topProviders.reduce((sum, p) => sum + p.PERFORMANCE_SCORE, 0) / topProviders.length

    return {
      totalSpend,
      avgPerformance,
      totalPlantsServed,
      budget,
      regionData,
      scatterData,
      providers,
      consolidation: {
        currentCount: providers.length,
        targetCount: targetProviders,
        projectedSavings,
        newAvgPerformance,
        turnoverImprovement: (providers.length - targetProviders) * 0.8,
      }
    }
  }, [data, targetProviders])

  if (isLoading || !metrics) {
    return <LoadingSkeleton />
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Logistics Optimization"
        subtitle="3PL provider performance & budget analysis"
        icon={<Truck className="text-accent-blue" size={20} />}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <KPIGrid>
          <MetricCard
            title="Total Contract Value"
            value={formatCurrency(metrics.totalSpend)}
            trend="down"
            trendValue={`${((metrics.totalSpend / metrics.budget - 1) * 100).toFixed(1)}% vs budget`}
            icon={<Truck className="text-accent-blue" size={20} />}
          />
          <MetricCard
            title="Avg. Performance Score"
            value={`${metrics.avgPerformance.toFixed(1)}%`}
            trend="up"
            trendValue="+2.3% YoY"
            icon={<TrendingUp className="text-accent-blue" size={20} />}
          />
          <MetricCard
            title="Total Sites Served"
            value={metrics.totalPlantsServed.toString()}
            subtitle={`${metrics.totalPlantsServed - 75} overlap`}
            icon={<MapPin className="text-accent-blue" size={20} />}
          />
          <MetricCard
            title="Active Providers"
            value={metrics.providers.length.toString()}
            subtitle="Across 4 regions"
          />
        </KPIGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Provider Performance vs Contract Value" subtitle="Bubble size = sites served">
            <ScatterChartComponent
              data={metrics.scatterData}
              xDataKey="contractValue"
              yDataKey="performance"
              zDataKey="plantsServed"
              colorKey="region"
              xLabel="Contract Value (€)"
              yLabel="Performance (%)"
              height={350}
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(REGION_COLORS).map(([region, color]) => (
                <div key={region} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-400">{region}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Budget Allocation by Region" subtitle="Contract value distribution">
            <PieChartComponent
              data={metrics.regionData}
              dataKey="value"
              nameKey="region"
              colors={Object.values(REGION_COLORS)}
              height={350}
            />
          </Section>
        </div>

        <Section title="Consolidation Scenario Analysis" subtitle="Optimize provider portfolio">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Target Number of Providers</span>
              <span className="text-slate-200 font-medium">{targetProviders}</span>
            </div>
            <input
              type="range"
              min={3}
              max={metrics.providers.length}
              value={targetProviders}
              onChange={(e) => setTargetProviders(Number(e.target.value))}
              className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>3 providers</span>
              <span>{metrics.providers.length} providers</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-navy-700/50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Current → Target</p>
              <p className="text-xl font-semibold text-slate-100">
                {metrics.consolidation.currentCount} → {metrics.consolidation.targetCount}
              </p>
            </div>
            <div className="p-4 bg-navy-700/50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Projected Savings</p>
              <p className="text-xl font-semibold text-accent-green">
                {formatCurrency(metrics.consolidation.projectedSavings)}
              </p>
            </div>
            <div className="p-4 bg-navy-700/50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">New Avg. Performance</p>
              <p className="text-xl font-semibold text-slate-100">
                {metrics.consolidation.newAvgPerformance.toFixed(1)}%
              </p>
              <p className="text-xs text-accent-green">
                +{(metrics.consolidation.newAvgPerformance - metrics.avgPerformance).toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-navy-700/50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Turnover Impact</p>
              <p className="text-xl font-semibold text-accent-green">
                +{metrics.consolidation.turnoverImprovement.toFixed(1)}%
              </p>
            </div>
          </div>
        </Section>

        <Section title="Provider Details" subtitle="Performance and contract information">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">Provider</th>
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">Region</th>
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">Service</th>
                  <th className="text-right py-3 px-2 text-slate-400 font-medium">Contract Value</th>
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">Performance</th>
                  <th className="text-right py-3 px-2 text-slate-400 font-medium">Sites</th>
                  <th className="text-right py-3 px-2 text-slate-400 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {metrics.providers.map((provider) => (
                  <tr key={provider.PROVIDER_ID} className="border-b border-navy-700/50 hover:bg-navy-700/30">
                    <td className="py-3 px-2 text-slate-200">{provider.PROVIDER_NAME}</td>
                    <td className="py-3 px-2">
                      <span className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: REGION_COLORS[provider.REGION] || '#64748b' }}
                        />
                        <span className="text-slate-400">{provider.REGION}</span>
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400">{provider.SERVICE_TYPE}</td>
                    <td className="py-3 px-2 text-right text-slate-300">{formatCurrency(provider.CONTRACT_VALUE_EUR)}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-green rounded-full"
                            style={{ width: `${provider.PERFORMANCE_SCORE}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-300 w-12 text-right">{provider.PERFORMANCE_SCORE.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300">{provider.PLANTS_SERVED}</td>
                    <td className="py-3 px-2 text-right text-slate-400">{provider.CONTRACT_EXPIRY.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-navy-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-96 bg-navy-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LogisticsPage
