# Deployment Anleitung - Filialplaner Teams App

Diese Anleitung führt Sie Schritt für Schritt durch die Bereitstellung Ihrer Filialplaner Teams App.

## 📋 Checkliste vor dem Deployment

- [ ] Azure AD App Registration ist erstellt und konfiguriert
- [ ] SharePoint Listen sind vorhanden und korrekt benannt
- [ ] Konfigurationsdateien sind angepasst
- [ ] App wurde lokal getestet
- [ ] HTTPS Hosting ist verfügbar

## 🔧 Schritt 1: Azure AD App Registration

### 1.1 App Registration erstellen

1. Öffnen Sie das [Azure Portal](https://portal.azure.com)
2. Navigieren Sie zu **Azure Active Directory** → **App Registrierungen**
3. Klicken Sie auf **+ Neue Registrierung**
4. Konfigurieren Sie:
   ```
   Name: Filialplaner Teams App
   Unterstützte Kontotypen: Nur Konten in diesem Organisationsverzeichnis
   Plattform: Single-Page-Anwendung (SPA)
   Umleitungs-URI: https://ihre-app-domain.com
   ```

### 1.2 API-Berechtigungen hinzufügen

1. Gehen Sie zu **API-Berechtigungen**
2. Klicken Sie auf **+ Berechtigung hinzufügen**
3. Wählen Sie **Microsoft Graph** → **Delegierte Berechtigungen**
4. Fügen Sie folgende Berechtigungen hinzu:
   - `User.Read`
   - `Sites.Read.All`
   - `Sites.ReadWrite.All` (optional, für Schreibzugriff)
5. Klicken Sie auf **Administratoreinwilligung gewähren**

### 1.3 Wichtige Werte notieren

Notieren Sie sich aus der **Übersicht**:
- **Anwendungs-ID (Client-ID)**: `12345678-1234-1234-1234-123456789012`
- **Verzeichnis-ID (Tenant-ID)**: `87654321-4321-4321-4321-210987654321`

## 🌐 Schritt 2: Hosting einrichten

### Option A: Azure Static Web Apps (Empfohlen - Kostenlos)

1. **Azure Static Web App erstellen:**
   ```bash
   # Via Azure Portal oder Azure CLI
   az staticwebapp create \
     --name filialplaner-app \
     --resource-group your-resource-group \
     --source https://github.com/your-org/filialplaner \
     --location "West Europe" \
     --branch main \
     --app-location "/" \
     --api-location "api" \
     --output-location "build"
   ```

2. **GitHub Actions automatisch eingerichtet**
3. **URL notieren**: `https://filialplaner-app.azurestaticapps.net`

### Option B: SharePoint Hosting

1. **Build erstellen:**
   ```bash
   npm run build
   ```

2. **Dateien hochladen:**
   - Gehen Sie zu Ihrer SharePoint Site
   - Erstellen Sie eine Dokumentbibliothek "FilialplanerApp"
   - Laden Sie alle Dateien aus dem `build/` Ordner hoch
   - URL: `https://ihredomain.sharepoint.com/sites/sitename/FilialplanerApp`

### Option C: Andere Hosting-Services

**Netlify:**
```bash
# Build und Deploy
npm run build
npx netlify deploy --prod --dir=build
```

**Vercel:**
```bash
npm run build
npx vercel --prod
```

## ⚙️ Schritt 3: Konfiguration anpassen

### 3.1 authConfig.ts aktualisieren

Bearbeiten Sie `src/config/authConfig.ts`:

```typescript
export const msalConfig: Configuration = {
    auth: {
        clientId: "12345678-1234-1234-1234-123456789012", // Ihre Client-ID
        authority: "https://login.microsoftonline.com/87654321-4321-4321-4321-210987654321", // Ihre Tenant-ID
        redirectUri: "https://ihre-echte-app-domain.com", // Ihre Hosting-URL
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};
```

### 3.2 SharePoint URL prüfen

Stellen Sie sicher, dass die SharePoint URL korrekt ist:

```typescript
export const graphConfig = {
    // ...
    sharePointSiteUrl: "https://pfandoscashanddrivegmbh.sharepoint.com/sites/MyPfando",
};
```

### 3.3 Teams Manifest aktualisieren

Bearbeiten Sie `teams-manifest/manifest.json`:

```json
{
  "webApplicationInfo": {
    "id": "12345678-1234-1234-1234-123456789012",
    "resource": "https://graph.microsoft.com"
  },
  "validDomains": [
    "ihre-echte-app-domain.com",
    "login.microsoftonline.com",
    "graph.microsoft.com"
  ],
  "staticTabs": [
    {
      "entityId": "filialplaner-tab",
      "name": "Filialplaner",
      "contentUrl": "https://ihre-echte-app-domain.com",
      "scopes": ["personal"]
    }
  ]
}
```

## 📱 Schritt 4: Teams App Package erstellen

### 4.1 App Package vorbereiten

```bash
# Ins Manifest-Verzeichnis wechseln
cd teams-manifest

# ZIP-Datei erstellen (Windows)
powershell Compress-Archive -Path .\* -DestinationPath ..\filialplaner-teams-app.zip

# Oder manuell:
# 1. Alle Dateien im teams-manifest/ Ordner auswählen
# 2. Als ZIP komprimieren
# 3. Datei als "filialplaner-teams-app.zip" speichern
```

### 4.2 Package validieren

Stellen Sie sicher, dass die ZIP-Datei enthält:
- `manifest.json`
- `color.png` (192x192 px)
- `outline.png` (32x32 px)

## 🚀 Schritt 5: In Teams bereitstellen

### Option A: Teams Admin Center (Empfohlen für Organisationen)

1. **Teams Admin Center öffnen:** https://admin.teams.microsoft.com
2. **Teams-Apps** → **Apps verwalten** → **+ App hochladen**
3. ZIP-Datei hochladen
4. App genehmigen und für Organisation verfügbar machen

### Option B: Direkt in Teams

1. **Microsoft Teams öffnen**
2. **Apps** in der linken Seitenleiste
3. **App hochladen** → **Benutzerdefinierte App hochladen**
4. ZIP-Datei auswählen
5. **Hinzufügen** klicken

## 🧪 Schritt 6: Testen und Validierung

### 6.1 Funktionstest

1. **Login testen:**
   - App öffnen
   - Microsoft-Login sollte automatisch starten
   - Nach erfolgreicher Anmeldung sollten Benutzerdaten angezeigt werden

2. **Daten laden testen:**
   - Mitarbeiter-Tabelle sollte Daten aus SharePoint anzeigen
   - Filialen-Tabelle sollte Daten aus SharePoint anzeigen
   - Auto-Refresh nach 30 Sekunden testen

3. **Responsive Design testen:**
   - App in verschiedenen Bildschirmgrößen testen
   - Mobile Ansicht in Teams prüfen

### 6.2 Fehlerbehandlung testen

1. **Offline-Verhalten**
2. **Fehlende Berechtigungen**
3. **SharePoint Listen nicht verfügbar**
4. **Network-Timeouts**

## 🔍 Troubleshooting

### Problem: "App kann nicht geladen werden"

**Lösung:**
1. HTTPS-URL überprüfen
2. `validDomains` im Manifest kontrollieren
3. Browser-Cache leeren
4. Teams-Cache leeren: `%appdata%\Microsoft\Teams` löschen

### Problem: "Anmeldung fehlgeschlagen"

**Lösung:**
1. Client-ID in `authConfig.ts` prüfen
2. Redirect-URI in Azure AD überprüfen
3. Tenant-ID korrekt?
4. Pop-up-Blocker deaktivieren

### Problem: "Berechtigung verweigert" für SharePoint

**Lösung:**
1. Graph API Berechtigungen in Azure AD prüfen
2. Administratoreinwilligung erteilen
3. Benutzer hat Zugriff auf SharePoint Site?
4. SharePoint Liste existiert und ist korrekt benannt?

### Problem: "Listen nicht gefunden"

**Lösung:**
1. SharePoint URL in `graphConfig` prüfen
2. Listen-Namen überprüfen: "Mitarbeiter" und "Filialen"
3. Spalten-Namen: "Mitarbeiter" und "Title"
4. Graph Explorer testen: https://developer.microsoft.com/graph/graph-explorer

## 📊 Monitoring und Wartung

### Performance Monitoring

1. **Browser DevTools** verwenden
2. **Azure Application Insights** einrichten (optional)
3. **Teams Admin Center** für App-Nutzung

### Regelmäßige Updates

1. **Dependencies aktualisieren:**
   ```bash
   npm audit
   npm update
   ```

2. **Teams SDK Updates:**
   ```bash
   npm install @microsoft/teams-js@latest
   ```

3. **MSAL Updates:**
   ```bash
   npm install @azure/msal-browser@latest @azure/msal-react@latest
   ```

### Backup-Strategie

1. **Code in Git-Repository**
2. **Azure AD App Registration dokumentieren**
3. **Teams App Package archivieren**
4. **Konfigurationsdateien sichern**

## 🎯 Go-Live Checkliste

- [ ] Azure AD App Registration konfiguriert
- [ ] App auf HTTPS-Domain gehostet
- [ ] Konfiguration auf Production-Werte angepasst
- [ ] Teams Manifest aktualisiert
- [ ] App Package erstellt und validiert
- [ ] In Teams Admin Center hochgeladen und genehmigt
- [ ] Mit mehreren Testbenutzern getestet
- [ ] Dokumentation für Endbenutzer erstellt
- [ ] Support-Prozess definiert

## 📞 Support

Bei Problemen:

1. **Browser DevTools** und Console-Logs prüfen
2. **Azure AD Logs** in Azure Portal kontrollieren
3. **Microsoft Graph Explorer** für API-Tests nutzen
4. **Teams Developer Portal** für Manifest-Validierung

**Wichtige Links:**
- [Teams Developer Portal](https://dev.teams.microsoft.com/)
- [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)
- [Azure Portal](https://portal.azure.com/)
- [Teams Admin Center](https://admin.teams.microsoft.com/)