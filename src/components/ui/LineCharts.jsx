'use client';

import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

const LineCharts = ({
  data,
  lines,
  xAxisKey = 'name',
  width = '100%',
  height = 300,
  xAxisFormatter = null,
}) => {
  const maxYValue = useMemo(() => {
    let max = 0;
    data.forEach((item) => {
      lines.forEach((line) => {
        const val = Number(item[line.dataKey]);
        if (!Number.isNaN(val) && val > max) max = val;
      });
    });

    const padded = max * 1.1;

    let roundTo = 100;
    if (padded > 1000) roundTo = 1000;
    else if (padded > 500) roundTo = 500;

    return Math.ceil(padded / roundTo) * roundTo;
  }, [data, lines]);

  return (
    <div style={{ width }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
            horizontal={true}
            vertical={false} // optional: disable vertical if not needed
          />
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={xAxisFormatter || undefined}
            stroke="#888"
            tick={{ fill: '#000', fontSize: 12 }}
            tickLine={false} // ✅ removes the small line near each label
          />

          <YAxis
            domain={[0, maxYValue]}
            axisLine={false} // ❌ removes the Y-axis stroke line
            tickLine={false} // ❌ removes the small ticks beside numbers
            tick={{ fill: '#000', fontSize: 12 }} // ✅ keeps the label visible
            tickFormatter={(value) =>
              new Intl.NumberFormat('en-IN', {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 1,
              }).format(value)
            }
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          {lines.map((line, index) => (
            <Line
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              name={line.name}
              strokeWidth={2}
              dot={false} // ✅ removes regular dots
              activeDot={true} // ✅ removes hover dots
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineCharts;
