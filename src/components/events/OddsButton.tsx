interface OddsButtonProps {
  label: string;
  odds: number;
  onClick?: () => void;
  className?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  oddStatus?: number;
}

export default function OddsButton({ 
  label, 
  odds, 
  onClick, 
  className = "",
  isSelected = false,
  isDisabled = false,
  oddStatus = 0
}: OddsButtonProps) {
  const isLocked = oddStatus !== 0;
  const isButtonDisabled = isDisabled || isLocked;

  return (
    <button 
      onClick={isButtonDisabled ? undefined : onClick}
      disabled={isButtonDisabled}
      className={`
        flex items-center justify-between p-2 rounded border transition-colors relative
        ${isButtonDisabled 
          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
        }
        ${isSelected && !isButtonDisabled ? 'bg-blue-50 border-blue-300 text-blue-900' : ''}
        ${className}
      `}
    >
      {/* Ícone de cadeado para odds desativadas */}
      {isLocked && (
        <div className="absolute top-1 right-1">
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <div className={`text-sm ${isButtonDisabled ? 'text-gray-400' : (isSelected ? 'text-blue-900' : 'text-gray-700')}`}>
        {label}
      </div>
      <div className={`font-bold ${isButtonDisabled ? 'text-gray-400' : (isSelected ? 'text-blue-600' : 'text-blue-500')}`}>
        {odds}
      </div>
    </button>
  );
}
