import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const DataGranularity = ({ dataGranualarityType, setDataGranularityType }) => {
  return (
    <Select
      value={dataGranualarityType}
      onValueChange={(value) => {
        setDataGranularityType(value);
      }}
    >
      <SelectTrigger>
        <SelectValue defaultValue="WEEKLY" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DAILY">Daily</SelectItem>
        <SelectItem value="WEEKLY">Weekly</SelectItem>
        <SelectItem value="MONTHLY">Monthly</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default DataGranularity;
