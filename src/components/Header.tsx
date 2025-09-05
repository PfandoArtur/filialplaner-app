import React from 'react';

interface HeaderProps {
  currentWeek1: number;
  currentWeek2: number;
  currentYear: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onJumpToWeek: (week: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentWeek1,
  currentWeek2,
  currentYear,
  onNavigate,
  onJumpToWeek,
}) => {
  const [weekInput, setWeekInput] = React.useState('');

  const handleWeekSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const weekNum = parseInt(weekInput);
      if (weekNum >= 1 && weekNum <= 53) {
        onJumpToWeek(weekNum);
        setWeekInput('');
      }
    }
  };

  const legendItems = [
    { color: '#C026D3', label: 'Hybrid' },
    { color: '#3B82F6', label: 'Filialleiter' },
    { color: '#22C55E', label: '100%' },
    { color: '#EAB308', label: '80%' },
    { color: '#F97316', label: 'Vorläufig' },
  ];

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div 
        className="flex items-center justify-between p-4"
        style={{ backgroundColor: '#163175' }}
      >
        {/* Titel */}
        <h1 className="text-2xl font-bold text-white">
          Pfando Filialplaner
        </h1>

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('prev')}
            className="p-2 rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <input
            type="number"
            min="1"
            max="53"
            value={weekInput}
            onChange={(e) => setWeekInput(e.target.value)}
            onKeyPress={handleWeekSubmit}
            placeholder="KW"
            className="w-16 px-2 py-1 rounded text-center text-black focus:outline-none focus:ring-2 focus:ring-white/50"
          />

          <button
            onClick={() => onNavigate('next')}
            className="p-2 rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Legende */}
        <div className="flex items-center space-x-4">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white text-sm font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};