import { ReactNode } from 'react';
import OddsButton from './OddsButton';
import { MarketOption } from '@/types/events';

interface MarketCardProps {
  title: string;
  options: MarketOption[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  additionalIcons?: ReactNode;
  children?: ReactNode;
}

export default function MarketCard({ 
  title, 
  options, 
  isCollapsible = true,
  isCollapsed = false,
  onToggleCollapse,
  additionalIcons,
  children 
}: MarketCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-900 font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          {additionalIcons}
          {isCollapsible && (
            <button 
              onClick={onToggleCollapse}
              className="text-gray-400 hover:text-gray-600"
            >
              {isCollapsed ? '▶' : '▼'}
            </button>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          {children}
          <div className={`grid gap-2 ${
            options.length === 2 ? 'grid-cols-2' : 
            options.length === 3 ? 'grid-cols-3' : 
            'grid-cols-1'
          }`}>
            {options.map((option, index) => (
              <OddsButton
                key={index}
                label={option.label}
                odds={option.odds}
                onClick={option.onClick}
                isSelected={option.isSelected}
                isDisabled={option.isDisabled}
                oddStatus={option.oddStatus}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
