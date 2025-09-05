import React, { useState, useRef, useEffect } from 'react';
import { Employee, Branch, CellData, StatusType } from '../data/dummyData';

interface DayCellProps {
  branchId: string;
  date: Date;
  dayIndex: number; // 0=Mo, 1=Di, 2=Mi, 3=Do, 4=Fr, 5=Sa
  employees: Employee[];
  branches: Branch[];
  usedEmployees: string[];
  cellData: CellData;
  onCellChange: (branchId: string, date: Date, updates: Partial<CellData>) => void;
  onWeekFill: (branchId: string, startDate: Date, updates: Partial<CellData>) => void;
}

export const DayCell: React.FC<DayCellProps> = ({
  branchId,
  date,
  dayIndex,
  employees,
  branches,
  usedEmployees,
  cellData,
  onCellChange,
  onWeekFill,
}) => {
  const [showComment, setShowComment] = useState(false);
  const [tempComment, setTempComment] = useState(cellData.comment);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(cellData.hybridBranches);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const isMonday = dayIndex === 0;
  const isFriday = dayIndex === 4;
  const isSaturday = dayIndex === 5;
  const showNoteField = isMonday || isFriday || isSaturday;

  const STATUS_COLORS: Record<StatusType, string> = {
    'weiß': '#FFFFFF',
    '100%': '#22C55E',
    '80%': '#EAB308',
    'vorläufig': '#F97316',
  };

  const HYBRID_COLOR = '#C026D3';

  useEffect(() => {
    if (showComment && commentRef.current) {
      commentRef.current.focus();
    }
  }, [showComment]);

  useEffect(() => {
    setTempComment(cellData.comment);
  }, [cellData.comment]);

  const handleEmployeeChange = (employeeId: string) => {
    if (employeeId === '-hybrid-') {
      const updates = { 
        employeeId, 
        isHybrid: true, 
        hybridBranches: [] 
      };
      onCellChange(branchId, date, updates);
      
      // Bei Montag: Ganze Woche bis Freitag als Hybrid
      if (isMonday) {
        onWeekFill(branchId, date, updates);
      }
    } else {
      const updates = { 
        employeeId, 
        isHybrid: false, 
        hybridBranches: [] 
      };
      onCellChange(branchId, date, updates);
      
      // Bei Montag: Ganze Woche bis Freitag füllen (auch bei Entfernung)
      if (isMonday) {
        onWeekFill(branchId, date, updates);
      }
    }
  };

  const handleStatusChange = () => {
    const statuses: StatusType[] = ['weiß', '100%', '80%', 'vorläufig'];
    const currentIndex = statuses.indexOf(cellData.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    const updates = { status: nextStatus };
    onCellChange(branchId, date, updates);
    
    // Bei Montag: Status für ganze Woche
    if (isMonday) {
      onWeekFill(branchId, date, updates);
    }
  };

  const saveComment = () => {
    onCellChange(branchId, date, { comment: tempComment });
    setShowComment(false);
  };

  const cancelComment = () => {
    setTempComment(cellData.comment);
    setShowComment(false);
  };

  const handleNoteChange = (note: string) => {
    onCellChange(branchId, date, { note });
  };

  const toggleHybridBranch = (branchName: string) => {
    const newBranches = selectedBranches.includes(branchName)
      ? selectedBranches.filter(b => b !== branchName)
      : [...selectedBranches, branchName];
    
    setSelectedBranches(newBranches);
    onCellChange(branchId, date, { hybridBranches: newBranches });
  };

  const removeBranch = (branchToRemove: string) => {
    const newBranches = selectedBranches.filter(b => b !== branchToRemove);
    setSelectedBranches(newBranches);
    onCellChange(branchId, date, { hybridBranches: newBranches });
  };

  const removeHybridMode = () => {
    const updates = { 
      employeeId: '', 
      isHybrid: false, 
      hybridBranches: [] 
    };
    onCellChange(branchId, date, updates);
    setSelectedBranches([]);
    
    // Bei Montag: Ganze Woche bis Freitag entfernen
    if (isMonday) {
      onWeekFill(branchId, date, updates);
    }
  };

  const availableEmployees = employees.filter(emp => 
    !usedEmployees.includes(emp.id) || emp.id === cellData.employeeId
  );

  const selectedEmployee = employees.find(emp => emp.id === cellData.employeeId);

  const backgroundColor = cellData.isHybrid 
    ? `${HYBRID_COLOR}20` 
    : cellData.status === 'weiß' ? '#FFFFFF' : `${STATUS_COLORS[cellData.status]}20`;

  return (
    <div 
      className="h-20 border-r border-gray-300 border-b border-gray-200 p-1 relative overflow-hidden bg-white"
      style={{ backgroundColor, width: '100%', maxWidth: '100%', minWidth: 0 }}
    >
      {/* Employee Dropdown and Status/Comment Buttons */}
      <div className="mb-1 flex items-start gap-1 w-full">
        <div className="flex-1 min-w-0 max-w-full">
          {cellData.isHybrid ? (
          <div className="text-xs w-full">
            <div className="flex gap-1 mb-1 w-full">
              <select 
                onChange={(e) => e.target.value && toggleHybridBranch(e.target.value)}
                className="flex-1 min-w-0 text-xs border rounded px-1 py-1"
                value=""
                style={{ maxWidth: '100%', width: '100%' }}
              >
                <option value="">Filiale hinzufügen...</option>
                {branches
                  .filter(b => !selectedBranches.includes(b.name))
                  .map(branch => (
                  <option key={branch.id} value={branch.name}>{branch.name}</option>
                ))}
              </select>
              <button
                onClick={removeHybridMode}
                className="text-gray-600 hover:text-gray-800 text-sm px-1 flex-shrink-0"
                title="Hybrid-Modus entfernen"
              >
                ×
              </button>
            </div>
            <div className="w-full">
              {selectedBranches.map(branchName => (
                <div 
                  key={branchName}
                  className="flex items-center text-xs bg-white rounded px-1 py-0.5 mb-1 w-full"
                >
                  <span className="truncate flex-1 min-w-0">{branchName}</span>
                  <button 
                    onClick={() => removeBranch(branchName)}
                    className="ml-1 text-red-500 hover:text-red-700 text-xs flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <select
            value={cellData.employeeId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            className="w-full text-xs border rounded px-1 py-1"
          >
            <option value="">-</option>
            <option value="-hybrid-">-Hybrid-</option>
            {availableEmployees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        )}
        </div>

        {/* Status und Comment Buttons */}
        {!cellData.isHybrid && (
          <div className="flex flex-col gap-1">
            <button
              onClick={handleStatusChange}
              className="w-4 h-4 rounded border border-gray-400 hover:border-gray-600 transition-colors"
              style={{ backgroundColor: STATUS_COLORS[cellData.status] }}
              title={`Status: ${cellData.status}`}
            />
            <button
              onClick={() => setShowComment(true)}
              className={`w-4 h-4 rounded text-xs flex items-center justify-center transition-colors ${
                cellData.comment 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
              }`}
              title="Kommentar"
            >
              💬
            </button>
          </div>
        )}
      </div>

      {/* Comment Popup */}
      {showComment && (
        <div className="absolute top-0 left-full ml-2 z-20 bg-white border border-gray-300 rounded shadow-lg p-2 w-48">
          <textarea
            ref={commentRef}
            value={tempComment}
            onChange={(e) => setTempComment(e.target.value)}
            className="w-full text-xs border rounded p-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Kommentar eingeben..."
          />
          <div className="flex justify-end space-x-1 mt-2">
            <button
              onClick={saveComment}
              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
            >
              ✓
            </button>
            <button
              onClick={cancelComment}
              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
            >
              ✗
            </button>
          </div>
        </div>
      )}

      {/* Notizfeld für Mo, Fr, Sa oder Hybrid */}
      {(showNoteField || cellData.isHybrid) && (
        <div className="mt-1">
          <textarea
            value={cellData.note}
            onChange={(e) => handleNoteChange(e.target.value)}
            className="w-full text-xs border rounded p-1 resize-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={1}
            placeholder={cellData.isHybrid ? "" : "Notiz..."}
            style={{ minHeight: '18px', maxHeight: '36px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 36) + 'px';
            }}
          />
        </div>
      )}
    </div>
  );
};