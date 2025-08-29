import { graphConfig } from '../config/authConfig';

export interface Employee {
  id: string;
  Mitarbeiter: string;
}

export interface Branch {
  id: string;
  Title: string;
}

export class GraphService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async callMSGraph(endpoint: string): Promise<any> {
    const headers = new Headers();
    const bearer = `Bearer ${this.accessToken}`;
    headers.append("Authorization", bearer);

    const options = {
      method: "GET",
      headers: headers
    };

    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Graph API call failed:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<any> {
    return this.callMSGraph(graphConfig.graphMeEndpoint);
  }

  async getSiteId(siteUrl: string): Promise<string> {
    try {
      // Extrahiere Hostname und Pfad aus der URL
      const url = new URL(siteUrl);
      const hostname = url.hostname;
      const sitePath = url.pathname;
      
      const endpoint = `https://graph.microsoft.com/v1.0/sites/${hostname}:${sitePath}`;
      const site = await this.callMSGraph(endpoint);
      return site.id;
    } catch (error) {
      console.error('Failed to get site ID:', error);
      throw error;
    }
  }

  async getEmployees(): Promise<Employee[]> {
    try {
      const siteId = await this.getSiteId(graphConfig.sharePointSiteUrl);
      
      // Erstmal alle Listen abrufen um die richtige zu finden
      const listsEndpoint = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists`;
      const lists = await this.callMSGraph(listsEndpoint);
      
      // Suche nach der "Mitarbeiter" Liste
      const employeeList = lists.value.find((list: any) => 
        list.displayName === 'Mitarbeiter' || list.name === 'Mitarbeiter'
      );
      
      if (!employeeList) {
        throw new Error('Mitarbeiter Liste nicht gefunden');
      }

      // Abrufen der Listenelemente
      const itemsEndpoint = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${employeeList.id}/items?expand=fields`;
      const items = await this.callMSGraph(itemsEndpoint);
      
      return items.value.map((item: any) => ({
        id: item.id,
        Mitarbeiter: item.fields.Mitarbeiter || item.fields.Title || 'Unbekannt'
      }));
    } catch (error) {
      console.error('Failed to get employees:', error);
      throw error;
    }
  }

  async getBranches(): Promise<Branch[]> {
    try {
      const siteId = await this.getSiteId(graphConfig.sharePointSiteUrl);
      
      // Alle Listen abrufen
      const listsEndpoint = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists`;
      const lists = await this.callMSGraph(listsEndpoint);
      
      // Suche nach der "Filialen" Liste
      const branchList = lists.value.find((list: any) => 
        list.displayName === 'Filialen' || list.name === 'Filialen'
      );
      
      if (!branchList) {
        throw new Error('Filialen Liste nicht gefunden');
      }

      // Abrufen der Listenelemente
      const itemsEndpoint = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${branchList.id}/items?expand=fields`;
      const items = await this.callMSGraph(itemsEndpoint);
      
      return items.value.map((item: any) => ({
        id: item.id,
        Title: item.fields.Title || 'Unbekannt'
      }));
    } catch (error) {
      console.error('Failed to get branches:', error);
      throw error;
    }
  }
}