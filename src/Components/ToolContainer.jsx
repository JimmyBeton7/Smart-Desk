import React from 'react';
import './ToolContainer.css';
import { Routes, Route } from 'react-router-dom';

import Home from '../Pages/Home';
import Pomodoro from '../Pages/Pomodoro';
import Calculator from '../Pages/Calculator';

function ToolContainer() {
  return (
    <div className="tool-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/calculator" element={<Calculator />} />
        {/* kolejne narzędzia */}
      </Routes>
    </div>
  );
}

export default ToolContainer;

