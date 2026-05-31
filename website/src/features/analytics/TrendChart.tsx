import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartWrapper, CustomTooltip } from '../../components/analytics/ChartComponents';
import { TrendDataPoint } from '../../utils/chartDataFormatters';

interface TrendChartProps {
  data: TrendDataPoint[];
  loading: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, loading }) => {
  return (
    <ChartWrapper title="Platform Trends" subtitle="User growth and activity over time" loading={loading} height={350}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#888" 
          tick={{ fill: '#888', fontSize: 11 }} 
          tickLine={false} 
          axisLine={false} 
          angle={-45} 
          textAnchor="end" 
          height={50}
        />
        <YAxis yAxisId="left" stroke="#888" tick={{ fill: '#888' }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" stroke="#888" tick={{ fill: '#888' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="users" 
          name="Active Users" 
          stroke="#4ade80" 
          strokeWidth={3} 
          dot={{ r: 4, fill: '#111', strokeWidth: 2 }} 
          activeDot={{ r: 6, strokeWidth: 0 }} 
          animationDuration={1000}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="activity" 
          name="Activities" 
          stroke="#60a5fa" 
          strokeWidth={3} 
          dot={{ r: 4, fill: '#111', strokeWidth: 2 }} 
          activeDot={{ r: 6, strokeWidth: 0 }} 
          animationDuration={1000}
        />
      </LineChart>
    </ChartWrapper>
  );
};
