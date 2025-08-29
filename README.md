# Filialplaner Teams App

Eine Microsoft Teams-App zur Verwaltung und Anzeige von Mitarbeiter- und Filialdaten aus SharePoint Listen.

## 🚀 Features

- **Single Sign-On**: Automatische Anmeldung mit Microsoft-Konto
- **SharePoint Integration**: Direkter Zugriff auf SharePoint Listen über Microsoft Graph API
- **Auto-Refresh**: Automatische Aktualisierung alle 30 Sekunden
- **Responsive Design**: Moderne UI mit Tailwind CSS
- **Teams Integration**: Läuft als eigenständige Teams-App

## 📋 Voraussetzungen

1. Microsoft 365 Konto mit Zugriff auf SharePoint
2. Azure Active Directory App Registration
3. Node.js (Version 16 oder höher)
4. SharePoint Listen mit folgender Struktur:
   - Liste "Mitarbeiter" mit Spalte "Mitarbeiter"
   - Liste "Filialen" mit Spalte "Title"

## 🛠️ Installation und Setup

### 1. Repository klonen und Abhängigkeiten installieren

```bash
cd filialplaner
npm install
```

### 2. Azure AD App Registration einrichten

1. Gehen Sie zum [Azure Portal](https://portal.azure.com)
2. Navigieren Sie zu "Azure Active Directory" > "App Registrationen"
3. Klicken Sie auf "Neue Registrierung"
4. Füllen Sie die Details aus:
   - Name: "Filialplaner Teams App"
   - Unterstützte Kontotypen: "Konten in diesem Organisationsverzeichnis"
   - Umleitungs-URI: "Single-Page-Anwendung (SPA)" mit Ihrer App-URL

5. Nach der Erstellung:
   - Notieren Sie sich die "Anwendungs-ID (Client-ID)"
   - Gehen Sie zu "API-Berechtigungen"
   - Fügen Sie folgende Berechtigungen hinzu:
     - Microsoft Graph > Delegated Permissions:
       - `User.Read`
       - `Sites.Read.All`
       - `Sites.ReadWrite.All` (falls Schreibzugriff benötigt)
   - Gewähren Sie Administratoreinwilligung

### 3. Konfiguration anpassen

Bearbeiten Sie `src/config/authConfig.ts`:

```typescript
export const msalConfig: Configuration = {
    auth: {
        clientId: "IHRE_CLIENT_ID_HIER", // Von der Azure AD App Registration
        authority: "https://login.microsoftonline.com/IHRE_TENANT_ID", // Optional: Spezifische Tenant ID
        redirectUri: "https://ihre-app-domain.com", // Ihre App URL
    },
    // ...
};
```

Bearbeiten Sie auch den `sharePointSiteUrl` in derselben Datei:

```typescript
export const graphConfig = {
    // ...
    sharePointSiteUrl: "https://pfandoscashanddrivegmbh.sharepoint.com/sites/MyPfando",
};
```

### 4. Teams Manifest konfigurieren

Bearbeiten Sie `teams-manifest/manifest.json`:

1. Ersetzen Sie `"YOUR_APP_ID_HERE"` mit Ihrer Azure AD Client ID
2. Ersetzen Sie `"https://your-app-domain.com"` mit Ihrer App URL
3. Passen Sie die `validDomains` entsprechend an

## 🏗️ Build und Deployment

### Lokale Entwicklung

```bash
npm start
```

Die App läuft dann unter `http://localhost:3000`.

### Production Build

```bash
npm run build
```

### Hosting-Optionen

Da die App vollständig clientseitig läuft, können Sie sie auf jedem statischen Hosting-Service bereitstellen:

#### Option 1: Azure Static Web Apps (Kostenlos)
1. Erstellen Sie eine Azure Static Web App
2. Verknüpfen Sie Ihr Repository
3. Build-Ordner: `build`
4. Notieren Sie sich die generierte URL

#### Option 2: SharePoint Hosting
1. Laden Sie die Build-Dateien in eine SharePoint-Dokumentbibliothek hoch
2. Verwenden Sie die SharePoint-URL für das Teams Manifest

#### Option 3: GitHub Pages
1. Aktivieren Sie GitHub Pages für Ihr Repository
2. Wählen Sie den `gh-pages` Branch oder `/docs` Ordner

### HTTPS erforderlich
⚠️ **Wichtig**: Teams-Apps erfordern HTTPS. Localhost funktioniert nur für die Entwicklung.

## 📱 Teams App Installation

### 1. App Package erstellen

1. Komprimieren Sie den Inhalt des `teams-manifest/` Ordners zu einer ZIP-Datei
2. Stellen Sie sicher, dass `manifest.json`, `color.png` und `outline.png` im Root der ZIP-Datei sind

### 2. In Teams installieren

#### Methode A: Direkt in Teams
1. Öffnen Sie Microsoft Teams
2. Gehen Sie zu "Apps" in der linken Seitenleiste
3. Klicken Sie auf "App hochladen" > "Benutzerdefinierte App hochladen"
4. Wählen Sie Ihre ZIP-Datei aus
5. Klicken Sie auf "Hinzufügen"

#### Methode B: Teams Admin Center (für Organisation)
1. Gehen Sie zum [Teams Admin Center](https://admin.teams.microsoft.com)
2. Navigieren Sie zu "Teams-Apps" > "Apps verwalten"
3. Klicken Sie auf "Hochladen"
4. Laden Sie Ihre ZIP-Datei hoch
5. Genehmigen Sie die App für Ihre Organisation

### 3. App verwenden

Nach der Installation können Benutzer:
1. Die App zu einem Team oder Chat hinzufügen
2. Die App als persönliche App verwenden
3. Die App als Tab in einem Kanal hinzufügen

## 🔧 Entwicklung und Anpassung

### Projekt-Struktur

```
filialplaner/
├── public/                 # Statische Dateien
├── src/
│   ├── components/        # React Komponenten
│   ├── config/           # Konfigurationsdateien
│   ├── hooks/            # Custom React Hooks
│   ├── services/         # API Services
│   └── ...
├── teams-manifest/       # Teams App Manifest
└── ...
```

### Neue SharePoint Listen hinzufügen

1. Erweitern Sie die Interfaces in `src/services/graphService.ts`
2. Fügen Sie neue Methoden zur `GraphService` Klasse hinzu
3. Aktualisieren Sie die UI-Komponenten entsprechend

### Styling anpassen

Das Projekt verwendet Tailwind CSS. Anpassungen können in `tailwind.config.js` vorgenommen werden.

## 🐛 Troubleshooting

### Häufige Probleme

1. **"App kann nicht geladen werden"**
   - Überprüfen Sie die HTTPS-URL
   - Stellen Sie sicher, dass die Azure AD App korrekt konfiguriert ist

2. **"Berechtigung verweigert" bei SharePoint-Zugriff**
   - Überprüfen Sie die Graph API Berechtigungen
   - Stellen Sie sicher, dass der Benutzer Zugriff auf die SharePoint Site hat

3. **"Listen nicht gefunden"**
   - Überprüfen Sie die SharePoint Site URL
   - Stellen Sie sicher, dass die Listen existieren und die richtigen Namen haben

4. **CORS-Fehler**
   - Fügen Sie Ihre Domain zu den `validDomains` im Teams Manifest hinzu
   - Überprüfen Sie die Azure AD Redirect URIs

### Debug-Tipps

1. Verwenden Sie die Browser-Entwicklertools
2. Aktivieren Sie detailliertes Logging in der Azure AD App
3. Testen Sie die Graph API Calls direkt im [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)

## 📚 Weitere Ressourcen

- [Microsoft Teams App Entwicklung](https://docs.microsoft.com/en-us/microsoftteams/platform/)
- [Microsoft Graph API Dokumentation](https://docs.microsoft.com/en-us/graph/)
- [MSAL.js Dokumentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

## 📄 Lizenz

Dieses Projekt ist für die interne Nutzung bei Pfandos Cash and Drive GmbH bestimmt.