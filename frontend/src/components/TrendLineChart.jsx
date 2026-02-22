import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from 'recharts';
import styles from './TrendLineChart.module.css';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <span className={styles.ttDate}>{label}</span>
      <span className={styles.ttValue}>{payload[0].value.toLocaleString()} clicks</span>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TrendLineChart({ data, featureName }) {
  if (!data?.length) {
    return (
      <div className={styles.empty}>
        {featureName
          ? `No trend data for "${featureName}"`
          : 'Click a bar to see the trend'}
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    dateLabel: formatDate(d.date),
  }));

  const max = Math.max(...data.map((d) => d.click_count));

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2dd4bf" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#5a6070' }}
            axisLine={{ stroke: '#252930' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#5a6070' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={max}
            stroke="rgba(45,212,191,0.2)"
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="click_count"
            stroke="#2dd4bf"
            strokeWidth={2}
            fill="url(#tealGrad)"
            dot={{ fill: '#2dd4bf', strokeWidth: 0, r: 3 }}
            activeDot={{ fill: '#2dd4bf', stroke: 'rgba(45,212,191,0.3)', strokeWidth: 6, r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
