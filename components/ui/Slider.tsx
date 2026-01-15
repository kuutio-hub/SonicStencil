
import React from 'react';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  // FIX: Added optional `disabled` prop to allow the slider to be disabled.
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, min = 0, max = 100, step = 1, disabled = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };
  
  const containerClasses = label ? "flex-1" : "w-full";

  const sliderComponent = (
     <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        // FIX: Applied the disabled prop and added Tailwind classes for the disabled state.
        disabled={disabled}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <span className="text-xs font-mono bg-gray-600 px-1.5 py-0.5 rounded w-12 text-center">{value}</span>
      </div>
  );

  if (!label) return sliderComponent;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm text-gray-300">{label}</label>
      </div>
      {sliderComponent}
    </div>
  );
};
