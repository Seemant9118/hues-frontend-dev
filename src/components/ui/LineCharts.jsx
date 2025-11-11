'use client';

import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Util to derive X-Axis config
export const getXAxisConfig = (viewType) => {
  const formatDateLabel = (label) => {
    const date = new Date(label);
    if (Number.isNaN(date)) return label; // fallback if not a valid date

    const day = date.getDate();
    const daySuffix =
      day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return `${day}${daySuffix} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  return {
    xAxisKey: 'label',
    xAxisFormatter:
      viewType === 'DAILY' ? formatDateLabel : (label) => label ?? '', // fallback to empty string for undefined
  };
};

const LineCharts = ({
  data,
  lines,
  viewType = 'DAILY',
  width = '100%',
  height = 300,
}) => {
  const { xAxisKey, xAxisFormatter } = useMemo(
    () => getXAxisConfig(viewType),
    [viewType],
  );

  const maxYValue = useMemo(() => {
    let max = 0;
    data?.forEach((item) => {
      lines?.forEach((line) => {
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

  // Dynamically calculate width: e.g. 100px per data point
  const chartPixelWidth = Math.max(
    (Array.isArray(data) ? data.length : 0) * 100,
    600,
  ); // fallback to min 600px

  return (
    <div className="scrollBarStyles" style={{ width, overflowX: 'auto' }}>
      <div style={{ width: chartPixelWidth }}>
        <LineChart data={data} width={chartPixelWidth} height={height}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={xAxisFormatter}
            stroke="#888"
            tick={{ fill: '#000', fontSize: 10 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, maxYValue]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#000', fontSize: 10 }}
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
              dot={false}
              activeDot={true}
            />
          ))}
        </LineChart>
      </div>
    </div>
  );
};

export default LineCharts;
