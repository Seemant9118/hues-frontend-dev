/* eslint-disable react/no-array-index-key */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Cell, Pie, PieChart } from 'recharts';

const PieCharts = ({ data, colors }) => {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <PieChart width={200} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          startAngle={90}
          endAngle={450}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute text-center">
        <p className="text-lg font-semibold">Total</p>
        <p className="text-xl font-bold">1,203</p>
      </div>
    </div>
  );
};

export default PieCharts;
