import React from 'react';
import { Calendar } from './pages/Calendar';

// Für Teams-Umgebung: Kein Login erforderlich, da SSO automatisch funktioniert
function App() {
  return (
    <div className="App h-full">
      <Calendar />
    </div>
  );
}

export default App;