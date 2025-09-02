import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Employee, Branch } from '../services/localDataService';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Socket.io Verbindung aufbauen
    const socketInstance = io('http://localhost:3001');
    
    socketInstance.on('connect', () => {
      console.log('Socket verbunden:', socketInstance.id);
      setIsConnected(true);
      
      // Initiale Daten anfordern
      socketInstance.emit('requestInitialData');
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket getrennt');
      setIsConnected(false);
    });

    // Echtzeit-Updates für Mitarbeiter
    socketInstance.on('employeesUpdated', (updatedEmployees: Employee[]) => {
      console.log('Mitarbeiter aktualisiert:', updatedEmployees);
      setEmployees(updatedEmployees);
    });

    // Echtzeit-Updates für Filialen
    socketInstance.on('branchesUpdated', (updatedBranches: Branch[]) => {
      console.log('Filialen aktualisiert:', updatedBranches);
      setBranches(updatedBranches);
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket,
    employees,
    branches,
    isConnected
  };
};