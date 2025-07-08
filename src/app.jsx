import * as React from 'react';
import './App.css';
import { HashRouter as Router } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import ToolContainer from './Components/ToolContainer';
import { createRoot } from 'react-dom/client';

function App() {
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
