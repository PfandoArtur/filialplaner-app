import { Configuration, PopupRequest, RedirectRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: "f7cd8eaa-36ec-481a-9ab5-4ba531a38bcf", // Filialplaner App Registration Client ID
        authority: "https://login.microsoftonline.com/f29e081c-4b24-4fc6-970d-9319194a7af5", // Ihre spezifische Tenant ID
        redirectUri: "https://pfandoartur.github.io/filialplaner-app", // GitHub Pages URL
    },
    cache: {
        cacheLocation: "sessionStorage", // Kann auch "localStorage" sein
        storeAuthStateInCookie: false, // Bei IE/Edge auf true setzen
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