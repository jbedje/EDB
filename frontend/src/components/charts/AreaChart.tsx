import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartProps {
  data: any[];
  xKey: string;
  areas: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

/**
 * Reusable Area Chart Component
 */
export default function AreaChart({
  data,
  xKey,
  areas,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
}: AreaChartProps) {
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis dataKey={xKey} stroke="#6b7280" style={{ fontSize: '12px' }} />
        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px',
          }}
        />
        {showLegend && <Legend />}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stackId={stacked ? '1' : undefined}
            stroke={area.color || defaultColors[index % defaultColors.length]}
            fill={area.color || defaultColors[index % defaultColors.length]}
            fillOpacity={0.6}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
