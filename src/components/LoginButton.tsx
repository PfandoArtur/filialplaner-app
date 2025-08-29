import React from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";

interface LoginButtonProps {
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ className = "" }) => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error("Login failed:", e);
    });
  };

  return (
    <button
      onClick={handleLogin}
      className={`bg-teams-purple hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 ${className}`}
    >
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.035 5.257c.91 1.092 1.465 2.47 1.465 3.943 0 3.314-2.686 6-6 6h-1v3h4v2h-16v-2h4v-3h-1c-3.314 0-6-2.686-6-6 0-1.473.555-2.851 1.465-3.943-.95-1.093-1.465-2.471-1.465-3.943 0-3.314 2.686-6 6-6s6 2.686 6 6c0 1.472-.515 2.85-1.465 3.943z"/>
        </svg>
        <span>Mit Microsoft anmelden</span>
      </div>
    </button>
  );
};