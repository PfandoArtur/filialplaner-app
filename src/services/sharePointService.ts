import { authentication } from "@microsoft/teams-js";

export interface SharePointBranch {
  Id: number;
  Title: string;
}

export interface SharePointEmployee {
  Id: number;
  Name: string;
}

class SharePointService {
  private graphBaseUrl = 'https://graph.microsoft.com/v1.0';
  private siteId = 'pfandoscashanddrivegmbh.sharepoint.com:/sites/MyPfando';
  
  private async getAccessToken(): Promise<string> {
    try {
      // Teams SSO Token für Graph API
      const token = await authentication.getAuthToken({
        resources: ['https://graph.microsoft.com']
      });
      console.log('Got access token successfully');
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error('Authentication failed');
    }
  }

  private async makeGraphRequest(endpoint: string): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.graphBaseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log(`Graph API request to ${endpoint}:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, body:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async getBranches(): Promise<SharePointBranch[]> {
    try {
      console.log('Fetching branches from SharePoint...');
      
      // Erst Site-ID abrufen
      const siteData = await this.makeGraphRequest(`/sites/${this.siteId}`);
      console.log('Site data:', siteData);
      
      // Dann Listen abrufen
      const listsData = await this.makeGraphRequest(`/sites/${siteData.id}/lists`);
      console.log('Lists found:', listsData.value.map((l: any) => l.displayName));
      
      // Filialen-Liste finden
      const filialeList = listsData.value.find((list: any) => 
        list.displayName === 'Filialen'
      );
      
      if (!filialeList) {
        console.error('Filialen list not found');
        throw new Error('Filialen list not found');
      }
      
      console.log('Found Filialen list:', filialeList.id);
      
      // Items aus der Liste abrufen
      const itemsData = await this.makeGraphRequest(
        `/sites/${siteData.id}/lists/${filialeList.id}/items?expand=fields&$select=fields`
      );
      
      console.log('Filialen items:', itemsData.value.length);
      
      return itemsData.value.map((item: any) => ({
        Id: parseInt(item.fields.id),
        Title: item.fields.Title || item.fields.title
      }));
      
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
      console.log('Fetching employees from SharePoint...');
      
      // Erst Site-ID abrufen
      const siteData = await this.makeGraphRequest(`/sites/${this.siteId}`);
      
      // Dann Listen abrufen
      const listsData = await this.makeGraphRequest(`/sites/${siteData.id}/lists`);
      console.log('Lists found:', listsData.value.map((l: any) => l.displayName));
      
      // Mitarbeiter-Liste finden
      const mitarbeiterList = listsData.value.find((list: any) => 
        list.displayName === 'Mitarbeiter'
      );
      
      if (!mitarbeiterList) {
        console.error('Mitarbeiter list not found');
        throw new Error('Mitarbeiter list not found');
      }
      
      console.log('Found Mitarbeiter list:', mitarbeiterList.id);
      
      // Items aus der Liste abrufen
      const itemsData = await this.makeGraphRequest(
        `/sites/${siteData.id}/lists/${mitarbeiterList.id}/items?expand=fields&$select=fields`
      );
      
      console.log('Mitarbeiter items:', itemsData.value.length);
      
      return itemsData.value
        .filter((item: any) => item.fields.Name || item.fields.name)
        .map((item: any) => ({
          Id: parseInt(item.fields.id),
          Name: item.fields.Name || item.fields.name
        }));
      
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