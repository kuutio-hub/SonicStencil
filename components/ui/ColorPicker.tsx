
import React from 'react';

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, compact }) => {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  const containerClasses = compact ? "flex items-center gap-2" : "flex justify-between items-center";

  return (
    <div className={containerClasses}>
      {label && <label className="text-sm text-gray-300">{label}</label>}
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={handleColorChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          style={{ backgroundColor: value }}
          className="w-10 h-6 rounded border border-gray-500"
        ></div>
      </div>
    </div>
  );
};
