import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { decimateData } from '../../../utils/dataDecimation';

function formatTick(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

const UserGrowthChart = React.memo(function UserGrowthChart({ data = [] }) {
  const decimatedData = useMemo(() => {
    return decimateData(data, 100, 'date', 'registrations');
  }, [data]);

  return (
    <section className="chart-container">
      <div className="chart-header">
        <h2>User Growth</h2>
        <p>Daily registrations over the selected period.</p>
      </div>

      {data.length > 0 ? (
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={decimatedData}>
              <defs>
                <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cc1111" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#cc1111" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatTick}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
              />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={40} />
              <Tooltip
                labelFormatter={formatTick}
                contentStyle={{
                  background: 'rgba(10, 10, 10, 0.95)',
                  border: '1px solid rgba(204, 17, 17, 0.28)',
                  borderRadius: '14px',
                  color: '#fff',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)'
                }}
              />
              <Area
                type="monotone"
                dataKey="registrations"
                stroke="#cc1111"
                strokeWidth={2.5}
                fill="url(#userGrowthFill)"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty">No growth data available.</div>
      )}
    </section>
  );
});

export default UserGrowthChart;