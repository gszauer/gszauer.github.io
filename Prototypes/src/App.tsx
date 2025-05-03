import React from 'react';
import { DesktopProvider } from './context/DesktopContext';
import Desktop from './components/windows98/Desktop';
import './styles/windows98.css';

function App() {
  return (
    <div className="App">
      <DesktopProvider>
        <Desktop />
      </DesktopProvider>
    </div>
  );
}

export default App;