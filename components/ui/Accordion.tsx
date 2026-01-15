
import React, { useState } from 'react';
import { ChevronDownIcon } from './Icons.tsx';

export const Accordion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="space-y-2">{children}</div>;
};

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left font-bold bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <span>{title}</span>
        <ChevronDownIcon className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-3 space-y-4 border-t border-gray-600">
          {children}
        </div>
      )}
    </div>
  );
};