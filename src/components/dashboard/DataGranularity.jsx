import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const DataGranularity = ({
  dataGranualarityType,
  setDataGranularityType,
  translations,
}) => {
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
        <SelectItem value="DAILY">
          {translations('analytics.granularity.DAILY')}
        </SelectItem>
        <SelectItem value="WEEKLY">
          {translations('analytics.granularity.WEEKLY')}
        </SelectItem>
        <SelectItem value="MONTHLY">
          {translations('analytics.granularity.MONTHLY')}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default DataGranularity;
