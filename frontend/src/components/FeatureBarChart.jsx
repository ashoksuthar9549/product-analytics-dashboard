import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import styles from './FeatureBarChart.module.css';

const ACCENT     = '#f0b429';
const ACCENT_DIM = '#2a2214';
const TEAL       = '#2dd4bf';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <span className={styles.ttFeature}>{payload[0].payload.feature_name}</span>
      <span className={styles.ttValue}>{payload[0].value.toLocaleString()} clicks</span>
    </div>
  );
}

export default function FeatureBarChart({ data, selectedFeature, onSelect }) {
  if (!data?.length) {
    return (
      <div className={styles.empty}>
        <span>No data for the selected filters</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 52)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 60, bottom: 4, left: 20 }}
          barCategoryGap="30%"
          onClick={(e) => {
            if (e && e.activePayload?.[0]) {
              onSelect(e.activePayload[0].payload.feature_name);
            }
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            type="number"
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#5a6070' }}
            axisLine={{ stroke: '#252930' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="feature_name"
            width={115}
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#8b9099' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240,180,41,0.04)' }} />
          <Bar dataKey="total_clicks" radius={[0, 3, 3, 0]} cursor="pointer">
            {data.map((entry) => {
              const isSelected = entry.feature_name === selectedFeature;
              return (
                <Cell
                  key={entry.feature_name}
                  fill={isSelected ? TEAL : ACCENT}
                  opacity={selectedFeature && !isSelected ? 0.35 : 1}
                />
              );
            })}
            <LabelList
              dataKey="total_clicks"
              position="right"
              formatter={(v) => v.toLocaleString()}
              style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#8b9099' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
