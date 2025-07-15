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
      size="sm"
      value={dataGranualarityType}
      onValueChange={(value) => {
        setDataGranularityType(value);
      }}
    >
      <SelectTrigger>
        <SelectValue defaultValue="weekly" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default DataGranularity;
