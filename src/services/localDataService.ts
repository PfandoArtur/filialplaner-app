export interface Employee {
  id: string;
  Mitarbeiter: string;
  created: string;
  modified: string;
}

export interface Branch {
  id: string;
  Title: string;
  created: string;
  modified: string;
}

class LocalDataService {
  private baseUrl = 'http://localhost:3001/api';

  async getEmployees(): Promise<Employee[]> {
    try {
      const response = await fetch(`${this.baseUrl}/employees`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      return [];
    }
  }

  async getBranches(): Promise<Branch[]> {
    try {
      const response = await fetch(`${this.baseUrl}/branches`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Laden der Filialen:', error);
      return [];
    }
  }

  async addEmployee(mitarbeiter: string): Promise<Employee | null> {
    try {
      const response = await fetch(`${this.baseUrl}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Mitarbeiter: mitarbeiter }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Mitarbeiters:', error);
      return null;
    }
  }

  async addBranch(title: string): Promise<Branch | null> {
    try {
      const response = await fetch(`${this.baseUrl}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Title: title }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Filiale:', error);
      return null;
    }
  }
}

export const localDataService = new LocalDataService();