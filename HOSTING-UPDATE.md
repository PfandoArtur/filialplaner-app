# Hosting Update Anleitung

Da SharePoint JavaScript blockiert, müssen Sie ein alternatives Hosting verwenden.

## Neue Hosting URL (Beispiel GitHub Pages)
Ersetzen Sie überall die SharePoint URL mit Ihrer neuen URL:

### 1. Azure AD App Registration aktualisieren
- Portal: https://portal.azure.com
- App: "Filialplaner" (f7cd8eaa-36ec-481a-9ab5-4ba531a38bcf)
- Authentifizierung → Umleitungs-URIs:
  
**ALT**: `https://pfandoscashanddrivegmbh.sharepoint.com/sites/MyPfando/FilialplanerApp/index.html`
**NEU**: `https://ihr-github-username.github.io/filialplaner-app`

### 2. authConfig.ts anpassen
```typescript
export const msalConfig: Configuration = {
    auth: {
        clientId: "f7cd8eaa-36ec-481a-9ab5-4ba531a38bcf",
        authority: "https://login.microsoftonline.com/f29e081c-4b24-4fc6-970d-9319194a7af5",
        redirectUri: "https://ihr-github-username.github.io/filialplaner-app", // NEUE URL
    },
    // ...
};
```

### 3. Teams Manifest anpassen
```json
{
  "staticTabs": [
    {
      "entityId": "filialplaner-tab",
      "name": "Filialplaner",
      "contentUrl": "https://ihr-github-username.github.io/filialplaner-app", // NEUE URL
      "scopes": ["personal"]
    }
  ],
  "validDomains": [
    "ihr-github-username.github.io", // NEUE DOMAIN
    "login.microsoftonline.com",
    "graph.microsoft.com"
  ]
}
```

### 4. Neu builden und deployen
```bash
npm run build
# Dann auf gewähltem Hosting-Service deployen
```

### 5. Neues Teams App Package erstellen
- teams-manifest Ordner als ZIP komprimieren
- In Teams neu hochladen

## Hosting-Optionen Vergleich

| Service | Kosten | Setup | Custom Domain | HTTPS |
|---------|--------|--------|---------------|-------|
| GitHub Pages | Kostenlos | Einfach | Ja | Ja |
| Netlify | Kostenlos | Sehr einfach | Ja | Ja |
| Vercel | Kostenlos | Sehr einfach | Ja | Ja |
| Azure Static Web Apps | Kostenlos | Mittel | Ja | Ja |