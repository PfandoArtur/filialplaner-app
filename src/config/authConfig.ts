import { Configuration, PopupRequest, RedirectRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: "f7cd8eaa-36ec-481a-9ab5-4ba531a38bcf", // Filialplaner App Registration Client ID
        authority: "https://login.microsoftonline.com/f29e081c-4b24-4fc6-970d-9319194a7af5", // Ihre spezifische Tenant ID
        redirectUri: window.location.origin, // Dynamische URI für Teams/Browser
    },
    cache: {
        cacheLocation: "sessionStorage", // Für Teams besser sessionStorage
        storeAuthStateInCookie: true, // Wichtig für Teams-Umgebung
    },
    system: {
        allowNativeBroker: false, // Deaktiviert für Teams
    }
};

// Graph API Scopes für SharePoint Listen
export const loginRequest: RedirectRequest | PopupRequest = {
    scopes: [
        "User.Read",
        "Sites.Read.All", // Für SharePoint Sites
        "Sites.ReadWrite.All" // Falls Sie auch schreiben möchten
    ]
};

export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    // SharePoint Site ID wird später dynamisch ermittelt
    sharePointSiteUrl: "https://pfandoscashanddrivegmbh.sharepoint.com/sites/MyPfando",
};