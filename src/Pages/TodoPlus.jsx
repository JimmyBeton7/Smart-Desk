// src/Pages/TodoPlus.jsx
/*
import React, { useEffect, useState } from 'react';
import './TodoPlus.css';
import { Calendar, Trash, Pen, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function TodoPlus() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [sortMode, setSortMode] = useState('created');

  const getSortedTasks = () => {
  const priorityValue = { high: 3, medium: 2, low: 1 };

  return [...tasks].sort((a, b) => {
    if (sortMode === 'priority') {
      return (priorityValue[b.priority] || 0) - (priorityValue[a.priority] || 0);
    }
    if (sortMode === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return b.id - a.id; // sort by created (most recent first)
  });
};

  useEffect(() => {
    window.electron.loadJSON('todo').then(setTasks);
    window.electron.loadJSON('todo-sort').then(setSortMode);
  }, []);

  useEffect(() => {
    window.electron.saveJSON('todo-sort', sortMode);
  }, [sortMode]);

  useEffect(() => {
    window.electron.saveJSON('todo', tasks);
  }, [tasks]);

  const saveTask = () => {
    if (!input.trim()) return;

    const text = input.trim();
    const tagMatches = text.match(/#\w+/g) || [];
    const tags = tagMatches.map(t => t.replace('#', ''));

    if (editTaskId) {
        setTasks(tasks.map(t =>
        t.id === editTaskId
            ? { ...t, text, tags, priority, deadline }
            : t
        ));
        setEditTaskId(null);
    } else {
        const newTask = {
        id: Date.now(),
        text,
        status: 'todo',
        tags,
        deadline,
        priority
        };
        setTasks([newTask, ...tasks]);
    }

    setInput('');
    setPriority('medium');
    setDeadline('');
    };

const editTask = (task) => {
  setInput(task.text);
  setPriority(task.priority);
  setDeadline(task.deadline || '');
  setEditTaskId(task.id);
};


  const toggleStatus = (id) => {
    setTasks(tasks.map(t =>
      t.id === id
        ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
        : t
    ));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="tab-content">
    <div className="todo-container">
      <h2>{t('todo.title')}</h2>

      <div className="todo-sort">
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: 'bold' }}>{t('todo.sortBy')}</label>
          <select value={sortMode} onChange={e => setSortMode(e.target.value)}>
            <option value="created">{t('todo.created')}</option>
            <option value="priority">{t('todo.priority')}</option>
            <option value="deadline">{t('todo.deadline')}</option>
          </select>
        </div>
      </div>

      <div className="todo-input">
        <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('todo.addPlaceholder')}
        />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="high">{t('todo.high')}</option>
            <option value="medium">{t('todo.medium')}</option>
            <option value="low">{t('todo.low')}</option>
        </select>
        <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
        />
        <button onClick={saveTask}>{editTaskId ? t('todo.save') : t('todo.add')}</button>

     </div>

      <ul className="todo-list">
        {getSortedTasks().map(task => (
          <li key={task.id} className={`task ${task.status}`}>
            <span onClick={() => toggleStatus(task.id)}>
                {task.text}
                {task.tags.length > 0 && (
                <small className="tags">
                    {task.tags.map(t => <span key={t} className="tag">#{t}</span>)}
                </small>
            )}
            {task.priority && (
                <small className={`priority ${task.priority}`}>{task.priority.toUpperCase()}</small>
            )}
            {task.deadline && (
                <small className="deadline"> <Calendar size={16} style={{ marginRight: 8 }} /> {task.deadline}</small>
            )}
            </span>

            <div className="task-actions">
              <div className="task-actions-edit">
                <button onClick={() => editTask(task)}> <Pen size={16} style={{ marginRight: 8 }} /> </button>
              </div>
              <div className="task-actions-delete">
                <button onClick={() => removeTask(task.id)}> <Trash size={16} style={{ marginRight: 8 }} /> </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export default TodoPlus;
*/
// src/Pages/TodoPlus.jsx
import React, { useState } from 'react';
import TaskListView from '../Components/TaskListView';
import {CalendarView} from '../Components/CalendarView';
import { useTranslation } from 'react-i18next';

function TodoPlus() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('list'); // 'list' | 'calendar'

  return (
      <div className="tab-content">
        <div className="tabs">
          <button
              className={tab === 'list' ? 'active' : ''}
              onClick={() => setTab('list')}
          >
            {t('todo.tabList')}
          </button>
          <button
              className={tab === 'calendar' ? 'active' : ''}
              onClick={() => setTab('calendar')}
          >
            {t('todo.tabCalendar')}
          </button>
        </div>

        {tab === 'list' && <TaskListView />}
        {tab === 'calendar' && <CalendarView />}
      </div>
  );
}

export default TodoPlus;

