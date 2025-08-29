import React from 'react';
import { useMsal } from "@azure/msal-react";

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className = "" }) => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: "/",
      mainWindowRedirectUri: "/"
    }).catch(e => {
      console.error("Logout failed:", e);
    });
  };

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 ${className}`}
    >
      Abmelden
    </button>
  );
};