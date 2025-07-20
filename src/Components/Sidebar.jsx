import React from 'react';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Timer, ClipboardList, Lock, Bot, Home, Calculator, Settings, MoveLeft, Droplet, ToolCase, Check, HardDrive } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

    const tools = [
    { path: '/', label: t('sidebar.home'), icon: <Home size={20} /> },
    { path: '/pomodoro', label: t('sidebar.pomodoro'), icon: <Timer size={20} /> },
    { path: '/calc', label: t('sidebar.calc'), icon: <Calculator size={20} /> },
    { path: '/clipboard', label: t('sidebar.clipboard'), icon: <ClipboardList size={20} /> },
    { path: '/notes', label: t('sidebar.notes'), icon: <Lock size={20} /> },
    { path: '/colorpicker', label: t('sidebar.colorpicker'), icon: <Droplet size={20} /> },
    { path: '/fileconventer', label: t('sidebar.converter'), icon: <ToolCase size={20} /> },
    { path: '/todoplus', label: t('sidebar.todo'), icon: <Check size={20} /> },
    { path: '/hardwareinfo', label: t('sidebar.hardware'), icon: <HardDrive size={20} /> },
    { path: '/chatgpt', label: t('sidebar.chatgpt'), icon: <Bot size={20} /> },
    { path: '/settings', label: t('sidebar.settings'), icon: <Settings size={20} /> }
  ];

  return (
    <div className="sidebar">
      <h2 className="title">{t('sidebar.title')}</h2>
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
         <span>{t('sidebar.exit')}</span>
      </div>

    </div>
  );
}

export default Sidebar;
