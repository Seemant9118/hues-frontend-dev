/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';

const PieCharts = ({ data, totalInvitation, colors }) => {
  const renderCustomLegend = (props) => {
    const { payload } = props;

    return (
      <ul className="mt-4 flex flex-wrap justify-center">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="mx-4 mb-2 flex items-center">
            <div
              className="mr-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{`${entry.value} : ${entry.payload.value}`}</span>
          </li>
        ))}

        {/* Total item in legend */}
        <li className="mx-4 mb-2 flex items-center">
          <div
            className="mr-2 h-3 w-3 rounded-full"
            style={{ backgroundColor: 'black' }}
          />
          <span className="text-sm font-medium">Total: {totalInvitation}</span>
        </li>
      </ul>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <PieChart width={400} height={400}>
        <Legend content={renderCustomLegend} />
        <Tooltip
          formatter={(value, name) => [`${value}`, `${name}`]}
          cursor={{ fill: 'rgba(0,0,0,0.1)' }}
        />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          startAngle={90}
          endAngle={450}
          dataKey="value"
          nameKey="name" // show name on tooltip
          className="cursor-pointer"
        >
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
};

export default PieCharts;
