import React, { useState, useRef, useEffect } from 'react';
import { Employee, Branch } from '../services/graphService';

interface CalendarCellProps {
  branchId: string;
  date: Date;
  dayIndex: number; // 0=Mo, 1=Di, 2=Mi, 3=Do, 4=Fr, 5=Sa
  employees: Employee[];
  branches: Branch[];
  usedEmployees: string[]; // Bereits verwendete Mitarbeiter an diesem Tag
  onEmployeeChange: (branchId: string, date: Date, employee: string) => void;
  onStatusChange: (branchId: string, date: Date, status: string) => void;
  onCommentChange: (branchId: string, date: Date, comment: string) => void;
  onNoteChange: (branchId: string, date: Date, note: string) => void;
  onHybridBranchesChange: (branchId: string, date: Date, branches: string[]) => void;
  cellData?: {
    employee: string;
    status: '100%' | '80%' | 'vorläufig';
    comment: string;
    note: string;
    isHybrid: boolean;
    hybridBranches: string[];
  };
}

const STATUS_COLORS = {
  '100%': '#22C55E',
  '80%': '#EAB308',
  'vorläufig': '#F97316',
  'hybrid': '#8B5CF6'
};

export const CalendarCell: React.FC<CalendarCellProps> = ({
  branchId,
  date,
  dayIndex,
  employees,
  branches,
  usedEmployees,
  onEmployeeChange,
  onStatusChange,
  onCommentChange,
  onNoteChange,
  onHybridBranchesChange,
  cellData = {
    employee: '',
    status: '100%',
    comment: '',
    note: '',
    isHybrid: false,
    hybridBranches: []
  }
}) => {
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState(cellData.comment);
  const [noteText, setNoteText] = useState(cellData.note);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(cellData.hybridBranches);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const isMonday = dayIndex === 0;
  const isFriday = dayIndex === 4;
  const isSaturday = dayIndex === 5;
  const isWeekend = dayIndex >= 5;
  
  // Zeige Notizfeld für Mo, Fr, Sa
  const showNoteField = isMonday || isFriday || isSaturday;

  useEffect(() => {
    if (showComment && commentRef.current) {
      commentRef.current.focus();
    }
  }, [showComment]);

  const handleEmployeeSelect = (selectedEmployee: string) => {
    onEmployeeChange(branchId, date, selectedEmployee);
    
    // Bei Montag: Automatisch ganze Woche bis Freitag füllen
    if (isMonday && selectedEmployee !== '-' && selectedEmployee !== '-Hybrid-') {
      for (let i = 1; i <= 4; i++) { // Di bis Fr
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + i);
        onEmployeeChange(branchId, nextDay, selectedEmployee);
      }
    }
    
    // Hybrid-Modus aktivieren
    if (selectedEmployee === '-Hybrid-') {
      if (isMonday) {
        // Ganze Woche bis Freitag als Hybrid markieren
        for (let i = 0; i <= 4; i++) {
          const day = new Date(date);
          day.setDate(date.getDate() + i);
          onEmployeeChange(branchId, day, '-Hybrid-');
        }
      }
    }
  };

  const handleStatusClick = () => {
    const statuses: ('100%' | '80%' | 'vorläufig')[] = ['100%', '80%', 'vorläufig'];
    const currentIndex = statuses.indexOf(cellData.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    onStatusChange(branchId, date, nextStatus);
    
    // Bei Montag: Status für ganze Woche bis Freitag übernehmen
    if (isMonday) {
      for (let i = 1; i <= 4; i++) {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + i);
        onStatusChange(branchId, nextDay, nextStatus);
      }
    }
  };

  const saveComment = () => {
    onCommentChange(branchId, date, commentText);
    setShowComment(false);
  };

  const cancelComment = () => {
    setCommentText(cellData.comment);
    setShowComment(false);
  };

  const handleNoteChange = (value: string) => {
    setNoteText(value);
    onNoteChange(branchId, date, value);
  };

  const toggleBranch = (branchTitle: string) => {
    const newBranches = selectedBranches.includes(branchTitle)
      ? selectedBranches.filter(b => b !== branchTitle)
      : [...selectedBranches, branchTitle];
    
    setSelectedBranches(newBranches);
    onHybridBranchesChange(branchId, date, newBranches);
  };

  const removeBranch = (branchToRemove: string) => {
    const newBranches = selectedBranches.filter(b => b !== branchToRemove);
    setSelectedBranches(newBranches);
    onHybridBranchesChange(branchId, date, newBranches);
  };

  const availableEmployees = employees.filter(emp => 
    !usedEmployees.includes(emp.Mitarbeiter) || emp.Mitarbeiter === cellData.employee
  );

  const backgroundColor = cellData.isHybrid 
    ? STATUS_COLORS.hybrid 
    : STATUS_COLORS[cellData.status];

  return (
    <div 
      className="h-32 border-r border-gray-300 p-1 relative overflow-visible"
      style={{ backgroundColor: `${backgroundColor}20` }}
    >
      {/* Employee Dropdown oder Hybrid-Branches */}
      <div className="mb-1">
        {cellData.isHybrid ? (
          <div className="text-xs">
            <div className="mb-1">
              <select 
                onChange={(e) => e.target.value && toggleBranch(e.target.value)}
                className="w-full text-xs border rounded px-1"
                value=""
              >
                <option value="">Filiale hinzufügen...</option>
                {branches.filter(b => !selectedBranches.includes(b.Title)).map(branch => (
                  <option key={branch.id} value={branch.Title}>{branch.Title}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedBranches.map(branchName => (
                <span 
                  key={branchName}
                  className="inline-flex items-center text-xs bg-white rounded px-1"
                >
                  {branchName}
                  <button 
                    onClick={() => removeBranch(branchName)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <select
            value={cellData.employee}
            onChange={(e) => handleEmployeeSelect(e.target.value)}
            className="w-full text-xs border rounded px-1"
          >
            <option value="">-</option>
            <option value="-">-</option>
            <option value="-Hybrid-">-Hybrid-</option>
            {availableEmployees.map(employee => (
              <option key={employee.id} value={employee.Mitarbeiter}>
                {employee.Mitarbeiter}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Status und Comment Buttons */}
      {!cellData.isHybrid && (
        <div className="absolute top-1 right-1 flex flex-col space-y-1">
          <button
            onClick={handleStatusClick}
            className="w-4 h-4 rounded border border-gray-400"
            style={{ backgroundColor }}
            title={`Status: ${cellData.status}`}
          />
          <button
            onClick={() => setShowComment(true)}
            className="w-4 h-4 bg-blue-500 text-white rounded text-xs flex items-center justify-center"
            title="Kommentar"
          >
            💬
          </button>
        </div>
      )}

      {/* Comment Input */}
      {showComment && (
        <div className="absolute top-8 left-0 right-0 z-10 bg-white border border-gray-300 rounded p-2 shadow-lg">
          <textarea
            ref={commentRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full text-xs border rounded p-1 resize-none"
            rows={2}
            placeholder="Kommentar..."
          />
          <div className="flex justify-end space-x-1 mt-1">
            <button
              onClick={saveComment}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded"
            >
              ✓
            </button>
            <button
              onClick={cancelComment}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded"
            >
              ✗
            </button>
          </div>
        </div>
      )}

      {/* Note Field für Mo, Fr, Sa */}
      {showNoteField && (
        <div className="absolute bottom-1 left-1 right-1">
          <textarea
            ref={noteRef}
            value={noteText}
            onChange={(e) => handleNoteChange(e.target.value)}
            className="w-full text-xs border rounded p-1 resize-none bg-white/80"
            rows={1}
            placeholder="Notiz..."
            style={{ minHeight: '20px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>
      )}

      {/* Hybrid Note Field */}
      {cellData.isHybrid && (
        <div className="absolute bottom-1 left-1 right-1">
          <textarea
            value={noteText}
            onChange={(e) => handleNoteChange(e.target.value)}
            className="w-full text-xs border rounded p-1 resize-none bg-white/80"
            rows={1}
            placeholder="Hybrid-Notiz..."
            style={{ minHeight: '20px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>
      )}
    </div>
  );
};