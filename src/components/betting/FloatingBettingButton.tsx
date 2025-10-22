'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useBetting } from '@/contexts/BettingContext';

export default function FloatingBettingButton() {
  const { selections, isOpen, setIsOpen } = useBetting();
  const [isHovered, setIsHovered] = useState(false);

  if (selections.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9998]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {selections.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {selections.length}
            </div>
          )}
        </div>
      </button>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-lg whitespace-nowrap">
          Boletim de Aposta ({selections.length} seleção{selections.length !== 1 ? 'ões' : ''})
        </div>
      )}
    </div>
  );
}
