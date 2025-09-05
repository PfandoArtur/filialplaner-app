import React from 'react';
import { Employee, NoteEntry, NoteStatus } from '../data/dummyData';

interface NotesSectionProps {
  employees: Employee[];
  notesWeek1: NoteEntry[];
  notesWeek2: NoteEntry[];
  onNotesWeek1Change: (notes: NoteEntry[]) => void;
  onNotesWeek2Change: (notes: NoteEntry[]) => void;
  week1Number: number;
  week2Number: number;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  employees,
  notesWeek1,
  notesWeek2,
  onNotesWeek1Change,
  onNotesWeek2Change,
  week1Number,
  week2Number,
}) => {
  const addNoteToWeek = (weekNotes: NoteEntry[], onChange: (notes: NoteEntry[]) => void) => {
    const newNote: NoteEntry = {
      id: Date.now().toString(),
      employeeId: '',
      status: 'frei',
      note: '',
    };
    onChange([...weekNotes, newNote]);
  };

  const updateNote = (
    weekNotes: NoteEntry[],
    onChange: (notes: NoteEntry[]) => void,
    id: string,
    field: keyof Omit<NoteEntry, 'id'>,
    value: string
  ) => {
    const updatedNotes = weekNotes.map(note =>
      note.id === id ? { ...note, [field]: value } : note
    );
    onChange(updatedNotes);
  };

  const deleteNote = (weekNotes: NoteEntry[], onChange: (notes: NoteEntry[]) => void, id: string) => {
    const updatedNotes = weekNotes.filter(note => note.id !== id);
    onChange(updatedNotes);
  };

  // Automatisch neue Zeile hinzufügen
  React.useEffect(() => {
    if (notesWeek1.length === 0) {
      addNoteToWeek(notesWeek1, onNotesWeek1Change);
    } else {
      const lastNote = notesWeek1[notesWeek1.length - 1];
      if (lastNote.employeeId && notesWeek1.length < 6) {
        addNoteToWeek(notesWeek1, onNotesWeek1Change);
      }
    }
  }, [notesWeek1, onNotesWeek1Change]);

  React.useEffect(() => {
    if (notesWeek2.length === 0) {
      addNoteToWeek(notesWeek2, onNotesWeek2Change);
    } else {
      const lastNote = notesWeek2[notesWeek2.length - 1];
      if (lastNote.employeeId && notesWeek2.length < 6) {
        addNoteToWeek(notesWeek2, onNotesWeek2Change);
      }
    }
  }, [notesWeek2, onNotesWeek2Change]);

  const statusOptions: { value: NoteStatus; label: string }[] = [
    { value: 'frei', label: 'Status' },
    { value: 'krankheit', label: 'Krankheit' },
    { value: 'urlaub', label: 'Urlaub' },
    { value: 'sonstige', label: 'Sonstige' },
  ];

  const WeekNotes: React.FC<{ 
    notes: NoteEntry[]; 
    onChange: (notes: NoteEntry[]) => void; 
    weekNumber: number;
  }> = ({ notes, onChange, weekNumber }) => (
    <div>
      {notes.slice(0, 6).map((note) => (
        <div key={note.id} className="grid grid-cols-4 gap-1 mb-1">
          <select
            value={note.employeeId}
            onChange={(e) => updateNote(notes, onChange, note.id, 'employeeId', e.target.value)}
            className="p-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ borderColor: '#163175' }}
          >
            <option value="">Mitarbeiter...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          
          <select
            value={note.status}
            onChange={(e) => updateNote(notes, onChange, note.id, 'status', e.target.value)}
            className="p-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ borderColor: '#163175' }}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            value={note.note}
            onChange={(e) => updateNote(notes, onChange, note.id, 'note', e.target.value)}
            placeholder="Notiz..."
            className="p-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ borderColor: '#163175' }}
          />
          
          <button
            onClick={() => deleteNote(notes, onChange, note.id)}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center w-6 h-6"
            title="Zeile löschen"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-2 bg-gray-100 border-b">
      <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(12, 1fr)', gap: '8px' }}>
        <div className="flex items-center justify-center font-bold text-sm border-r-2" style={{ color: '#163175', borderRightColor: '#3B82F6' }}>
          Notizen
        </div>
        <div 
          className="border-r-2 pr-2"
          style={{ gridColumn: 'span 6', borderRightColor: '#3B82F6' }}
        >
          <WeekNotes 
            notes={notesWeek1} 
            onChange={onNotesWeek1Change} 
            weekNumber={week1Number} 
          />
        </div>
        <div 
          className="pl-2"
          style={{ gridColumn: 'span 6' }}
        >
          <WeekNotes 
            notes={notesWeek2} 
            onChange={onNotesWeek2Change} 
            weekNumber={week2Number} 
          />
        </div>
      </div>
    </div>
  );
};