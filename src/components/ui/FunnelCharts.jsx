/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Cell, Funnel, FunnelChart, Legend, Tooltip } from 'recharts';

const colors = ['#0E42D2', '#165DFF', '#4080FF', '#6AA1FF', '#94BFFF'];

const FunnelCharts = ({ data, width = 400, height = 300 }) => {
  return (
    <FunnelChart width={width} height={height}>
      <Tooltip />
      <Legend />
      <Funnel
        dataKey="value"
        data={data}
        isAnimationActive
        lastShapeType="rectangle"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index]} />
        ))}
      </Funnel>
    </FunnelChart>
  );
};

export default FunnelCharts;
