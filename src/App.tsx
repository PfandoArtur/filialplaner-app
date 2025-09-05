import React from 'react';
import { Calendar } from './pages/Calendar';

// Für Teams-Umgebung: Kein Login erforderlich, da SSO automatisch funktioniert
function App() {
  return (
    <div className="App h-full">
      <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'red', color: 'white', padding: '5px', zIndex: 9999 }}>
        v1.0.5 - Direct Calendar
      </div>
      <Calendar />
    </div>
  );
}

export default App;