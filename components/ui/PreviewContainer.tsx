
import React from 'react';
import { EyeIcon, EyeOffIcon } from './Icons.tsx';

interface PreviewContainerProps {
  title: string;
  children: React.ReactNode;
  isVisible: boolean;
  toggleVisibility: () => void;
  actions?: React.ReactNode;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({ title, children, isVisible, toggleVisibility, actions }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-700">
      <div className="flex justify-between items-center p-3 bg-gray-700/50 border-b border-gray-700">
        <h2 className="font-bold text-gray-300">{title}</h2>
        <div className="flex items-center gap-4">
            {actions}
            <button onClick={toggleVisibility} className="text-gray-400 hover:text-white">
            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
      </div>
      <div className={`transition-all duration-300 ${isVisible ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};