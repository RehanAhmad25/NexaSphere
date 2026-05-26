import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { linearDecimate } from '../../../utils/dataDecimation';

const EventAttendanceChart = React.memo(function EventAttendanceChart({ data = [] }) {
  const decimatedData = useMemo(() => linearDecimate(data, 100), [data]);

  return (
    <section className="chart-container">
      <div className="chart-header">
        <h2>Event Attendance</h2>
        <p>Capacity, attendance, and waitlist comparison.</p>
      </div>

      {data.length > 0 ? (
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={decimatedData} margin={{ left: -10, right: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={40} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10, 10, 10, 0.95)',
                  border: '1px solid rgba(204, 17, 17, 0.28)',
                  borderRadius: '14px',
                  color: '#fff',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)'
                }}
              />
              <Legend />
              <Bar dataKey="capacity" fill="#5b616b" radius={[8, 8, 0, 0]} />
              <Bar dataKey="attendance" fill="#cc1111" radius={[8, 8, 0, 0]} />
              <Bar dataKey="waitlist" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty">No event data available.</div>
      )}
    </section>
  );
});

export default EventAttendanceChart;