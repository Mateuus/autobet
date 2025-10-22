interface OddsButtonProps {
  label: string;
  odds: number;
  onClick?: () => void;
  className?: string;
  isSelected?: boolean;
}

export default function OddsButton({ 
  label, 
  odds, 
  onClick, 
  className = "",
  isSelected = false 
}: OddsButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`
        bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 text-center transition-colors
        ${isSelected ? 'bg-blue-50 border-blue-300 text-blue-900' : ''}
        ${className}
      `}
    >
      <div className={`text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
        {label}
      </div>
      <div className={`font-bold ${isSelected ? 'text-blue-600' : 'text-blue-500'}`}>
        {odds}
      </div>
    </button>
  );
}
