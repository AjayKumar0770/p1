import React, { useState } from 'react';

export interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  initialValue?: [number, number];
  onChange?: (value: [number, number]) => void;
}

export const RangeFilter: React.FC<RangeFilterProps> = ({
  label,
  min,
  max,
  step = 1,
  initialValue,
  onChange
}) => {
  const [range, setRange] = useState<[number, number]>(initialValue || [min, max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), range[1]);
    setRange([val, range[1]]);
    if (onChange) onChange([val, range[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), range[0]);
    setRange([range[0], val]);
    if (onChange) onChange([range[0], val]);
  };

  return (
    <div className="flex flex-col space-y-2 w-full max-w-xs">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex items-center space-x-4">
        <input
          type="number"
          min={min}
          max={range[1]}
          step={step}
          value={range[0]}
          onChange={handleMinChange}
          className="w-20 rounded-md border border-gray-700 bg-gray-800 py-1 px-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-gray-400">to</span>
        <input
          type="number"
          min={range[0]}
          max={max}
          step={step}
          value={range[1]}
          onChange={handleMaxChange}
          className="w-20 rounded-md border border-gray-700 bg-gray-800 py-1 px-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={range[1]}
        onChange={handleMaxChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};
