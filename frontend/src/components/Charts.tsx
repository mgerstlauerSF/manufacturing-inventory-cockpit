import { memo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'

const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  cyan: '#06b6d4',
  purple: '#8b5cf6',
  slate: '#64748b',
}

const REGION_COLORS: Record<string, string> = {
  'Europe': COLORS.blue,
  'Americas': COLORS.red,
  'Asia-Pacific': COLORS.green,
  'MEA': COLORS.yellow,
}

interface BaseChartProps {
  data: any[]
  height?: number
}

interface LineChartComponentProps extends BaseChartProps {
  lines: Array<{ dataKey: string; name: string; color?: string; strokeDash?: string }>
  xDataKey: string
  yLabel?: string
}

export const LineChartComponent = memo(function LineChartComponent({
  data,
  lines,
  xDataKey,
  yLabel,
  height = 300,
}: LineChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey={xDataKey} stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#64748b' } : undefined} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Legend />
        {lines.map((line, idx) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color || Object.values(COLORS)[idx % Object.values(COLORS).length]}
            strokeWidth={2}
            dot={{ r: 3, fill: line.color || Object.values(COLORS)[idx % Object.values(COLORS).length] }}
            strokeDasharray={line.strokeDash}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
})

interface BarChartComponentProps extends BaseChartProps {
  bars: Array<{ dataKey: string; name: string; color?: string }>
  xDataKey: string
  yLabel?: string
  stacked?: boolean
}

export const BarChartComponent = memo(function BarChartComponent({
  data,
  bars,
  xDataKey,
  yLabel,
  height = 300,
  stacked = false,
}: BarChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey={xDataKey} stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#64748b' } : undefined} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Legend />
        {bars.map((bar, idx) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color || Object.values(COLORS)[idx % Object.values(COLORS).length]}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
})

interface PieChartComponentProps extends BaseChartProps {
  dataKey: string
  nameKey: string
  colors?: string[]
}

export const PieChartComponent = memo(function PieChartComponent({
  data,
  dataKey,
  nameKey,
  colors = Object.values(COLORS),
  height = 300,
}: PieChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#64748b' }}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
})

interface ScatterChartComponentProps extends BaseChartProps {
  xDataKey: string
  yDataKey: string
  zDataKey?: string
  colorKey?: string
  xLabel?: string
  yLabel?: string
}

export const ScatterChartComponent = memo(function ScatterChartComponent({
  data,
  xDataKey,
  yDataKey,
  zDataKey,
  colorKey,
  xLabel,
  yLabel,
  height = 300,
}: ScatterChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey={xDataKey}
          name={xLabel || xDataKey}
          stroke="#64748b"
          fontSize={12}
          label={xLabel ? { value: xLabel, position: 'bottom', fill: '#64748b' } : undefined}
        />
        <YAxis
          dataKey={yDataKey}
          name={yLabel || yDataKey}
          stroke="#64748b"
          fontSize={12}
          label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#64748b' } : undefined}
        />
        {zDataKey && <ZAxis dataKey={zDataKey} range={[50, 400]} />}
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Scatter data={data} fill={COLORS.blue}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colorKey && entry[colorKey] ? REGION_COLORS[entry[colorKey]] || COLORS.blue : COLORS.blue}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
})

interface WaterfallChartProps extends BaseChartProps {
  dataKey: string
  nameKey: string
  totalLabel?: string
}

export const WaterfallChart = memo(function WaterfallChart({
  data,
  dataKey,
  nameKey,
  totalLabel = 'Total',
  height = 300,
}: WaterfallChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: item[nameKey] === totalLabel ? COLORS.blue : COLORS.green,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey={nameKey} stroke="#64748b" fontSize={10} angle={-45} textAnchor="end" height={60} />
        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0' }}
          formatter={(value) => formatCurrency(value as number)}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
})

interface RiskGaugeProps {
  score: number
  maxScore?: number
  label?: string
}

export const RiskGauge = memo(function RiskGauge({ score, maxScore = 100, label }: RiskGaugeProps) {
  const percentage = (score / maxScore) * 100
  const riskLevel = score > 60 ? 'HIGH' : score > 40 ? 'MEDIUM' : 'LOW'
  const riskColor = score > 60 ? COLORS.red : score > 40 ? COLORS.yellow : COLORS.green

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="#334155"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={riskColor}
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${percentage * 4.4} 440`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: riskColor }}>{score.toFixed(0)}</span>
          <span className="text-xs text-slate-400">/ {maxScore}</span>
        </div>
      </div>
      <div
        className="mt-2 px-3 py-1 rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: riskColor }}
      >
        {riskLevel} RISK
      </div>
      {label && <p className="text-xs text-slate-400 mt-1">{label}</p>}
    </div>
  )
})

export function formatCurrency(value: number): string {
  if (value >= 1e9) return `€${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `€${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `€${(value / 1e3).toFixed(0)}K`
  return `€${value.toFixed(0)}`
}

export { COLORS, REGION_COLORS }
