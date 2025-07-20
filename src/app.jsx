import i18n from 'i18next';
import * as React from 'react';
import './App.css';
import { HashRouter as Router } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import ToolContainer from './Components/ToolContainer';
import { createRoot } from 'react-dom/client';

import './i18n';

window.electron.loadJSON('settings').then(data => {
  if (data?.language) {
    i18n.changeLanguage(data.language);
  }
});

function App() {

  React.useEffect(() => {
    const handler = () => {
      window.electron.loadJSON('settings').then(data => {
        if (data?.language) {
          i18n.changeLanguage(data.language);
        }
      });
    };
    window.addEventListener('language-changed', handler);
    return () => window.removeEventListener('language-changed', handler);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <ToolContainer />
      </div>
    </Router>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
export default App;
