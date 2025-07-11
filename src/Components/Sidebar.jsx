import React from 'react';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Timer, ClipboardList, Lock, Bot, Home, Calculator, Settings, MoveLeft, Droplet, ToolCase, Check, HardDrive } from 'lucide-react';

const tools = [
  { path: '/', label: 'Home', icon: <Home size={20} /> },
  { path: '/pomodoro', label: 'Pomodoro', icon: <Timer size={20} /> },
  { path: '/calculator', label: 'Calculator', icon: <Calculator size={20}/>},
  { path: '/clipboard', label: 'Clipboard', icon: <ClipboardList size={20} /> },
  { path: '/notes', label: 'Notes', icon: <Lock size={20} /> },
  { path: '/colorpicker', label: 'Color Picker', icon: <Droplet size={20} /> },
  { path: '/fileconventer', label: 'File Converter', icon: <ToolCase size={20} /> },
  { path: '/todoplus', label: 'TODO+', icon: <Check size={20} /> },
  { path: '/hardwareinfo', label: 'Hardware info', icon: <HardDrive size={20} /> },
  { path: '/chatgpt', label: 'ChatGPT', icon: <Bot size={20} /> },
  { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2 className="title">Smart Tools</h2>
      {tools.map(({ path, label, icon }) => (
        <div
          key={path}
          className={`sidebar-item ${location.pathname === path ? 'active' : ''}`}
          onClick={() => navigate(path)}
        >
          {icon}
          <span>{label}</span>
        </div>
      ))}

      <div className="sidebar-item" onClick={() => window.electron.exitApp()}>
        <MoveLeft size={16} style={{marginRight: 6}} />
        <span>Exit</span>
      </div>

    </div>
  );
}

export default Sidebar;
