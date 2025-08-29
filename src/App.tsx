import React, { useState, useEffect, useCallback } from 'react';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, loginRequest } from './config/authConfig';
import { GraphService, Employee, Branch } from './services/graphService';
import { LoginButton } from './components/LoginButton';
import { LogoutButton } from './components/LogoutButton';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { DataTable } from './components/DataTable';
import { useAutoRefresh } from './hooks/useAutoRefresh';

const msalInstance = new PublicClientApplication(msalConfig);

const MainContent: React.FC = () => {
  const { instance, accounts } = useMsal();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!accounts[0]) return;

    try {
      setLoading(true);
      setError(null);

      // Token abrufen
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      }).catch(async (error) => {
        if (error instanceof InteractionRequiredAuthError) {
          return instance.acquireTokenPopup(loginRequest);
        }
        throw error;
      });

      const graphService = new GraphService(response.accessToken);
      
      // Benutzerprofil abrufen (nur beim ersten Mal)
      if (!user) {
        const userProfile = await graphService.getUserProfile();
        setUser(userProfile);
      }

      // Daten parallel abrufen
      const [employeesData, branchesData] = await Promise.all([
        graphService.getEmployees(),
        graphService.getBranches()
      ]);

      setEmployees(employeesData);
      setBranches(branchesData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }, [instance, accounts, user]);

  // Initial data load
  useEffect(() => {
    if (accounts[0]) {
      fetchData();
    }
  }, [accounts, fetchData]);

  // Auto-refresh every 30 seconds
  useAutoRefresh({
    callback: fetchData,
    interval: 30000, // 30 seconds
    enabled: accounts.length > 0 && !loading
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teams-purple rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Filialplaner</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-600">
                  Willkommen, <span className="font-medium">{user.displayName}</span>
                </div>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <ErrorMessage message={error} onRetry={fetchData} />
        ) : (
          <DataTable 
            employees={employees}
            branches={branches}
            loading={loading}
            lastUpdated={lastUpdated}
          />
        )}
      </div>
    </div>
  );
};

const LoginScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-teams-purple rounded-lg flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Filialplaner
          </h2>
          <p className="text-gray-600 mb-8">
            Melden Sie sich mit Ihrem Microsoft-Konto an, um Mitarbeiter- und Filialdaten anzuzeigen.
          </p>
        </div>
        <div className="flex justify-center">
          <LoginButton className="w-full max-w-sm" />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <div className="App h-full">
        <AuthenticatedTemplate>
          <MainContent />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <LoginScreen />
        </UnauthenticatedTemplate>
      </div>
    </MsalProvider>
  );
}

export default App;