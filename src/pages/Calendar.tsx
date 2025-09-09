import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '../components/Header';
import { NotesSection } from '../components/NotesSection';
import { CalendarGrid } from '../components/CalendarGrid';
import { dummyEmployees, dummyBranches, CellData, NoteEntry, Employee, Branch } from '../data/dummyData';
import { GraphService } from '../services/graphService';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from '../config/authConfig';
import { APP_VERSION, BUILD_DATE, CACHE_BUSTER } from '../config/version';

interface WeekData {
  weekNumber: number;
  year: number;
  days: Date[];
}

type CalendarData = {
  [branchId: string]: {
    [dateKey: string]: CellData;
  };
};

export const Calendar: React.FC = () => {
  // State für aktuelle Wochen
  const [currentWeeks, setCurrentWeeks] = useState<[WeekData, WeekData]>(() => {
    const week1 = getCurrentWeek();
    const week2 = getNextWeek(week1);
    return [week1, week2];
  });

  // State für Notizen
  const [notesWeek1, setNotesWeek1] = useState<NoteEntry[]>([]);
  const [notesWeek2, setNotesWeek2] = useState<NoteEntry[]>([]);

  // State für Kalenderdaten
  const [calendarData, setCalendarData] = useState<CalendarData>({});

  // MSAL für SharePoint-Zugriff
  const { instance, accounts } = useMsal();
  
  // State für SharePoint-Daten
  const [employees, setEmployees] = useState<Employee[]>(dummyEmployees);
  const [branches, setBranches] = useState<Branch[]>(dummyBranches);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'dummy' | 'sharepoint' | 'error'>('dummy');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // SharePoint-Daten laden mit MSAL
  useEffect(() => {
    const loadSharePointData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading SharePoint data with MSAL...');
        
        // MSAL Token abrufen
        const activeAccount = accounts[0];
        if (!activeAccount) {
          throw new Error('Kein aktiver Account gefunden');
        }

        const silentRequest = {
          ...loginRequest,
          account: activeAccount
        };

        const response = await instance.acquireTokenSilent(silentRequest);
        const graphService = new GraphService(response.accessToken);
        
        // SharePoint-Daten abrufen
        const [spBranches, spEmployees] = await Promise.all([
          graphService.getBranches(),
          graphService.getEmployees()
        ]);

        // Transform SharePoint data to match local interface
        const transformedBranches = spBranches.map(branch => ({
          id: branch.id,
          name: branch.Title
        }));
        
        const transformedEmployees = spEmployees.map(employee => ({
          id: employee.id,
          name: employee.Mitarbeiter
        }));

        setBranches(transformedBranches);
        setEmployees(transformedEmployees);
        setDataSource('sharepoint');
        
        console.log('SharePoint data loaded:', { 
          branches: transformedBranches.length, 
          employees: transformedEmployees.length 
        });
      } catch (error) {
        console.error('Failed to load SharePoint data, using dummy data:', error);
        
        setDataSource('error');
        if (error instanceof Error) {
          setErrorMessage(`SharePoint-Fehler: ${error.message}`);
        } else {
          setErrorMessage('Unbekannter Fehler beim Laden der SharePoint-Daten');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (accounts.length > 0) {
      loadSharePointData();
    } else {
      setIsLoading(false);
      setDataSource('error');
      setErrorMessage('Kein Microsoft-Account angemeldet');
    }
  }, [instance, accounts]);

  // Helper Funktionen
  function getCurrentWeek(): WeekData {
    const now = new Date();
    return getWeekFromDate(now);
  }

  function getWeekFromDate(date: Date): WeekData {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Montag
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekNumber = getWeekNumber(startOfWeek);
    const days = [];

    for (let i = 0; i < 6; i++) { // Montag bis Samstag
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return {
      weekNumber,
      year: startOfWeek.getFullYear(),
      days,
    };
  }

  function getNextWeek(weekData: WeekData): WeekData {
    const nextWeekDate = new Date(weekData.days[0]);
    nextWeekDate.setDate(weekData.days[0].getDate() + 7);
    return getWeekFromDate(nextWeekDate);
  }

  function getPreviousWeek(weekData: WeekData): WeekData {
    const prevWeekDate = new Date(weekData.days[0]);
    prevWeekDate.setDate(weekData.days[0].getDate() - 7);
    return getWeekFromDate(prevWeekDate);
  }

  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  function getDateFromWeekNumber(year: number, weekNumber: number): Date {
    const jan1 = new Date(year, 0, 1);
    const daysFromJan1 = (weekNumber - 1) * 7;
    const targetDate = new Date(jan1.getTime() + daysFromJan1 * 24 * 60 * 60 * 1000);
    
    // Korrigiere zum Montag
    const day = targetDate.getDay();
    const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
    targetDate.setDate(diff);
    
    return targetDate;
  }

  // Navigation Handler
  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentWeeks(([week1, week2]) => {
      if (direction === 'prev') {
        const newWeek1 = getPreviousWeek(week1);
        return [newWeek1, week1];
      } else {
        const newWeek2 = getNextWeek(week2);
        return [week2, newWeek2];
      }
    });
  }, []);

  const handleJumpToWeek = useCallback((weekNumber: number) => {
    const targetDate = getDateFromWeekNumber(new Date().getFullYear(), weekNumber);
    const week1 = getWeekFromDate(targetDate);
    const week2 = getNextWeek(week1);
    setCurrentWeeks([week1, week2]);
  }, []);

  // Kalender Data Handler
  const getDateKey = useCallback((date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }, []);

  const handleCellChange = useCallback((
    branchId: string, 
    date: Date, 
    updates: Partial<CellData>
  ) => {
    const dateKey = getDateKey(date);
    setCalendarData(prev => {
      const defaultCellData: CellData = {
        employeeId: '',
        status: 'weiß',
        comment: '',
        note: '',
        isHybrid: false,
        hybridBranches: [],
      };

      return {
        ...prev,
        [branchId]: {
          ...prev[branchId],
          [dateKey]: {
            ...defaultCellData,
            ...prev[branchId]?.[dateKey],
            ...updates,
          }
        }
      };
    });
  }, [getDateKey]);

  const handleWeekFill = useCallback((
    branchId: string, 
    startDate: Date, 
    updates: Partial<CellData>
  ) => {
    // Fülle Montag bis Freitag (0-4)
    for (let i = 0; i <= 4; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      handleCellChange(branchId, date, updates);
    }
  }, [handleCellChange]);

  const handleNotesWeek1Change = useCallback((newNotes: NoteEntry[]) => {
    setNotesWeek1(newNotes);
  }, []);

  const handleNotesWeek2Change = useCallback((newNotes: NoteEntry[]) => {
    setNotesWeek2(newNotes);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">SharePoint-Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentWeek1={currentWeeks[0].weekNumber}
        currentWeek2={currentWeeks[1].weekNumber}
        currentYear={currentWeeks[0].year}
        onNavigate={handleNavigate}
        onJumpToWeek={handleJumpToWeek}
      />

      {/* Data Source Indicator */}
      <div className={`px-4 py-1 text-xs border-b flex justify-between items-start ${
        dataSource === 'sharepoint' ? 'bg-green-100 text-green-800' :
        dataSource === 'error' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-600'
      }`}>
        <div className="flex-1">
          Datenquelle: {
            dataSource === 'sharepoint' ? 'SharePoint (Live-Daten)' :
            dataSource === 'error' ? 'Dummy-Daten (SharePoint-Fehler)' :
            'Dummy-Daten'
          } 
          ({branches.length} Filialen, {employees.length} Mitarbeiter)
          {errorMessage && (
            <div className="mt-1 text-xs opacity-75">
              {errorMessage}
            </div>
          )}
        </div>
        <div className="text-right text-xs opacity-75 ml-4 flex-shrink-0">
          <div>{APP_VERSION}</div>
          <div className="text-[10px]">{BUILD_DATE}</div>
          <div className="text-[8px] opacity-50">#{CACHE_BUSTER}</div>
        </div>
      </div>

      <NotesSection
        employees={employees}
        notesWeek1={notesWeek1}
        notesWeek2={notesWeek2}
        onNotesWeek1Change={handleNotesWeek1Change}
        onNotesWeek2Change={handleNotesWeek2Change}
        week1Number={currentWeeks[0].weekNumber}
        week2Number={currentWeeks[1].weekNumber}
      />

      <CalendarGrid
        employees={employees}
        branches={branches}
        calendarData={calendarData}
        week1Days={currentWeeks[0].days}
        week2Days={currentWeeks[1].days}
        week1Number={currentWeeks[0].weekNumber}
        week2Number={currentWeeks[1].weekNumber}
        currentYear={currentWeeks[0].year}
        onCellChange={handleCellChange}
        onWeekFill={handleWeekFill}
      />
    </div>
  );
};