import React from 'react';
import { Employee, Branch, CellData } from '../data/dummyData';
import { DayCell } from './DayCell';

interface CalendarGridProps {
  employees: Employee[];
  branches: Branch[];
  calendarData: { [branchId: string]: { [dateKey: string]: CellData } };
  week1Days: Date[];
  week2Days: Date[];
  week1Number: number;
  week2Number: number;
  currentYear: number;
  onCellChange: (branchId: string, date: Date, updates: Partial<CellData>) => void;
  onWeekFill: (branchId: string, startDate: Date, updates: Partial<CellData>) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  employees,
  branches,
  calendarData,
  week1Days,
  week2Days,
  week1Number,
  week2Number,
  currentYear,
  onCellChange,
  onWeekFill,
}) => {
  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const getCellData = (branchId: string, date: Date): CellData => {
    const dateKey = getDateKey(date);
    return calendarData[branchId]?.[dateKey] || {
      employeeId: '',
      status: 'weiß',
      comment: '',
      note: '',
      isHybrid: false,
      hybridBranches: [],
    };
  };

  const getUsedEmployees = (date: Date): string[] => {
    const dateKey = getDateKey(date);
    const used: string[] = [];
    
    branches.forEach(branch => {
      const cellData = calendarData[branch.id]?.[dateKey];
      if (cellData?.employeeId && 
          cellData.employeeId !== '-' && 
          cellData.employeeId !== '-hybrid-') {
        used.push(cellData.employeeId);
      }
    });
    
    return used;
  };

  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  return (
    <div className="bg-white">
      {/* Jahr, KW und Day Headers */}
      <div className="sticky top-16 z-50 bg-white border-b-2" style={{ borderColor: '#163175' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(12, 1fr)', gridTemplateRows: 'auto auto' }}>
          {/* Year cell spanning both rows */}
          <div 
            className="p-2 font-bold text-center bg-gray-50 border-r-2 flex items-center justify-center" 
            style={{ color: '#163175', borderColor: '#163175', gridRow: 'span 2' }}
          >
            {currentYear}
          </div>
          
          {/* Week headers */}
          <div 
            className="p-2 font-bold text-center bg-blue-50 border-r-2" 
            style={{ color: '#163175', gridColumn: 'span 6', borderColor: '#3B82F6' }}
          >
            KW {week1Number}
          </div>
          <div 
            className="p-2 font-bold text-center bg-blue-50" 
            style={{ color: '#163175', gridColumn: 'span 6' }}
          >
            KW {week2Number}
          </div>
          
          {/* Day headers */}
          {week1Days.map((day, index) => (
            <div 
              key={`week1-header-${index}`} 
              className={`p-1 text-center border-r border-gray-200 ${index === 5 ? 'border-r-2' : ''}`}
              style={{ 
                color: '#163175',
                ...(index === 5 ? { borderRightColor: '#3B82F6' } : {})
              }}
            >
              <div className="font-bold text-sm">{dayNames[index]}</div>
              <div className="text-xs">
                {day.getDate().toString().padStart(2, '0')}.{(day.getMonth() + 1).toString().padStart(2, '0')}
              </div>
            </div>
          ))}
          {week2Days.map((day, index) => (
            <div key={`week2-header-${index}`} className="p-1 text-center border-r border-gray-200" style={{ color: '#163175' }}>
              <div className="font-bold text-sm">{dayNames[index]}</div>
              <div className="text-xs">
                {day.getDate().toString().padStart(2, '0')}.{(day.getMonth() + 1).toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Rows */}
      <div className="divide-y divide-gray-200">
        {branches.map((branch) => (
          <div key={branch.id} style={{ display: 'grid', gridTemplateColumns: '150px repeat(12, 1fr)', minHeight: '80px' }}>
            {/* Branch Name */}
            <div 
              className="p-2 font-medium text-center bg-gray-50 flex items-center justify-center sticky left-0 z-30 border-r-2 border-b border-gray-200"
              style={{ color: '#163175', borderColor: '#163175' }}
            >
              <span className="text-sm font-bold">{branch.name}</span>
            </div>

            {/* Week 1 Days */}
            {week1Days.map((day, dayIndex) => (
              <div 
                key={`${branch.id}-week1-${dayIndex}`}
                className={dayIndex === 5 ? 'border-r-2' : ''}
                style={dayIndex === 5 ? { borderRightColor: '#3B82F6', width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'visible' } : { width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'visible' }}
              >
                <DayCell
                  branchId={branch.id}
                  date={day}
                  dayIndex={dayIndex}
                  employees={employees}
                  branches={branches}
                  usedEmployees={getUsedEmployees(day)}
                  cellData={getCellData(branch.id, day)}
                  onCellChange={onCellChange}
                  onWeekFill={onWeekFill}
                />
              </div>
            ))}

            {/* Week 2 Days */}
            {week2Days.map((day, dayIndex) => (
              <div 
                key={`${branch.id}-week2-${dayIndex}`}
                style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'visible' }}
              >
                <DayCell
                  branchId={branch.id}
                  date={day}
                  dayIndex={dayIndex}
                  employees={employees}
                  branches={branches}
                  usedEmployees={getUsedEmployees(day)}
                  cellData={getCellData(branch.id, day)}
                  onCellChange={onCellChange}
                  onWeekFill={onWeekFill}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};