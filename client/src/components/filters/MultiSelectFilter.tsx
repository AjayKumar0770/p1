import React, { useState } from 'react';

export interface MultiSelectFilterProps {
  label: string;
  options: { label: string; value: string }[];
  initialSelected?: string[];
  onChange?: (selected: string[]) => void;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  label,
  options,
  initialSelected = [],
  onChange
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));

  const toggleOption = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setSelected(next);
    if (onChange) onChange(Array.from(next));
  };

  return (
    <div className="flex flex-col space-y-2 w-full max-w-xs">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.has(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
