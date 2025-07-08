import React from 'react';
import './ToolContainer.css';
import { Routes, Route } from 'react-router-dom';

import Home from '../Pages/Home';
import Pomodoro from '../Pages/Pomodoro';
import Calculator from '../Pages/Calculator';
import Notes from '../Pages/Notes'
import Clipboard from '../Pages/Clipboard';
import ChatGPT from '../Pages/ChatGPT';
import Settings from '../Pages/Settings';

function ToolContainer() {
  return (
    <div className="tool-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/clipboard" element={<Clipboard />} />
        <Route path="/chatgpt" element={<ChatGPT />} />
        <Route path="/settings" element={<Settings />} />
        {/* kolejne narzędzia */}
      </Routes>
    </div>
  );
}

export default ToolContainer;

