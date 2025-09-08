export interface Employee {
  id: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
}

// Transformations-Funktionen für SharePoint-Daten
export const transformSharePointBranch = (spBranch: any): Branch => ({
  id: spBranch.Id.toString(),
  name: spBranch.Title
});

export const transformSharePointEmployee = (spEmployee: any): Employee => ({
  id: spEmployee.Id.toString(),
  name: spEmployee.Name
});

export const dummyEmployees: Employee[] = [
  { id: '1', name: 'Max Mustermann' },
  { id: '2', name: 'Anna Schmidt' },
  { id: '3', name: 'Tom Weber' },
  { id: '4', name: 'Lisa Müller' },
  { id: '5', name: 'Jonas Klein' },
  { id: '6', name: 'Sara Fischer' },
  { id: '7', name: 'David Wolf' },
  { id: '8', name: 'Julia Becker' },
];

export const dummyBranches: Branch[] = [
  { id: '1', name: 'Berlin' },
  { id: '2', name: 'Hamburg' },
  { id: '3', name: 'München' },
  { id: '4', name: 'Köln' },
  { id: '5', name: 'Frankfurt' },
];

export type StatusType = 'weiß' | '100%' | '80%' | 'vorläufig';

export type NoteStatus = 'krankheit' | 'frei' | 'urlaub' | 'sonstige';

export interface CellData {
  employeeId: string;
  status: StatusType;
  comment: string;
  note: string;
  isHybrid: boolean;
  hybridBranches: string[];
}

export interface NoteEntry {
  id: string;
  employeeId: string;
  status: NoteStatus;
  note: string;
}