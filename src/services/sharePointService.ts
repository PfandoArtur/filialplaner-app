import { app, authentication } from "@microsoft/teams-js";

export interface SharePointBranch {
  Id: number;
  Title: string;
}

export interface SharePointEmployee {
  Id: number;
  Name: string;
}

class SharePointService {
  private baseUrl = 'https://pfandoscashanddrivegmbh.sharepoint.com/sites/MyPfando/_api/web/lists';
  
  private async getAccessToken(): Promise<string> {
    try {
      // Versuche Teams SSO Token zu bekommen
      const token = await authentication.getAuthToken({
        resources: ['https://graph.microsoft.com']
      });
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error('Authentication failed');
    }
  }

  private async makeRequest(url: string): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async getBranches(): Promise<SharePointBranch[]> {
    try {
      const url = `${this.baseUrl}/getByTitle('Filialen')/items?$select=Id,Title`;
      const data = await this.makeRequest(url);
      return data.d.results;
    } catch (error) {
      console.error('Error fetching branches:', error);
      // Fallback zu Dummy-Daten bei Fehler
      return [
        { Id: 1, Title: 'Berlin' },
        { Id: 2, Title: 'Hamburg' },
        { Id: 3, Title: 'München' },
        { Id: 4, Title: 'Köln' },
        { Id: 5, Title: 'Frankfurt' }
      ];
    }
  }

  async getEmployees(): Promise<SharePointEmployee[]> {
    try {
      const url = `${this.baseUrl}/getByTitle('Mitarbeiter')/items?$select=Id,Name&$filter=Name ne null`;
      const data = await this.makeRequest(url);
      return data.d.results;
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Fallback zu Dummy-Daten bei Fehler
      return [
        { Id: 1, Name: 'Max Mustermann' },
        { Id: 2, Name: 'Anna Schmidt' },
        { Id: 3, Name: 'Peter Weber' },
        { Id: 4, Name: 'Lisa Müller' },
        { Id: 5, Name: 'Tom Klein' },
        { Id: 6, Name: 'Sarah Hoffmann' }
      ];
    }
  }
}

export const sharePointService = new SharePointService();