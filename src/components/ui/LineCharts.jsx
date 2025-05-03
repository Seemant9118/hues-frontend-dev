/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/no-array-index-key */

'use client';

import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const LineCharts = ({ data, lines, width = 700, height = 300 }) => {
  return (
    <LineChart width={width} height={height} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      {lines.map((line, index) => (
        <Line
          key={index}
          type="monotone"
          dataKey={line.dataKey}
          stroke={line.color}
          name={line.name}
          strokeWidth={2}
        />
      ))}
    </LineChart>
  );
};

export default LineCharts;
