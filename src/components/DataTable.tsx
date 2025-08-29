import React from 'react';
import { Employee, Branch } from '../services/graphService';

interface DataTableProps {
  employees: Employee[];
  branches: Branch[];
  loading: boolean;
  lastUpdated: Date | null;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  employees, 
  branches, 
  loading, 
  lastUpdated 
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-teams-purple text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Filialplaner Daten</h2>
          <div className="flex items-center space-x-4">
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span className="text-sm">Aktualisiere...</span>
              </div>
            )}
            {lastUpdated && (
              <span className="text-sm opacity-90">
                Letzte Aktualisierung: {formatTime(lastUpdated)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mitarbeiter Tabelle */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-teams-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Mitarbeiter ({employees.length})
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                          Keine Mitarbeiter gefunden
                        </td>
                      </tr>
                    ) : (
                      employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{employee.id}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{employee.Mitarbeiter}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Filialen Tabelle */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-teams-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Filialen ({branches.length})
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {branches.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                          Keine Filialen gefunden
                        </td>
                      </tr>
                    ) : (
                      branches.map((branch) => (
                        <tr key={branch.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{branch.id}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{branch.Title}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};