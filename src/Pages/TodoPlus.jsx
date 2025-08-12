// src/Pages/TodoPlus.jsx

import React, { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import './TodoPlus.css';
import { Calendar, Trash, Pen, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import DatePicker from "react-datepicker";



function TodoPlus() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadlineYMD, setDeadlineYMD] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(null);
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
            ? { ...t, text, tags, priority, deadline: deadlineYMD }
            : t
        ));
        setEditTaskId(null);
    } else {
        const newTask = {
        id: Date.now(),
        text,
        status: 'todo',
        tags,
            deadline: deadlineYMD,
        priority
        };
        setTasks([newTask, ...tasks]);
    }

    setInput('');
    setPriority('medium');
    setDeadlineYMD('');
    setDeadlineDate(null);
    };

const editTask = (task) => {
  setInput(task.text);
  setPriority(task.priority);
    setDeadlineYMD(task.deadline || '');
    setDeadlineDate(task.deadline ? new Date(
        Number(task.deadline.slice(0,4)),
        Number(task.deadline.slice(5,7)) - 1,
        Number(task.deadline.slice(8,10)),
        12,0,0,0
    ) : null);
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

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'var(--tile-bg)',
            borderColor: 'var(--accent)',
            borderRadius: 8,
            padding: '2px',
            boxShadow: state.isFocused ? `0 0 0 2px var(--accent)` : 'none',
            '&:hover': {
                borderColor: 'var(--hover)'
            }
        }),
        menu: base => ({
            ...base,
            backgroundColor: 'var(--tile-bg)',
            borderRadius: 8,
            zIndex: 100
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? 'var(--bg-main)'
                : 'transparent',
            color: 'var(--text)',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: 'var(--active)'
            }
        }),
        singleValue: base => ({
            ...base,
            color: 'var(--text)'
        }),
        placeholder: base => ({
            ...base,
            color: 'var(--text)'
        }),
        input: base => ({
            ...base,
            color: 'var(--text)'
        })
    };

    const pad = (n) => String(n).padStart(2, '0');
    const toLocalNoon = (d) => {
        const nd = new Date(d);
        nd.setHours(12, 0, 0, 0);
        return nd;
    };
    const dateToYMDLocal = (date) => {
        const d = toLocalNoon(date);
        const y = d.getFullYear();
        const m = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        return `${y}-${m}-${day}`;
    };


    const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
        <div
            onClick={onClick}
            ref={ref}
            style={{
                backgroundColor: 'var(--tile-bg)',
                border: `1px solid var(--accent)`,
                borderRadius: 8,
                padding: '6px 12px',
                color: 'var(--text)',
                cursor: 'pointer',
                minWidth: '140px',
                height: 35,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                lineHeight: 'normal',
                fontSize: '13px',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.border = `1px solid var(--text)`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.border = `1px solid var(--accent)`;
            }}
        >
            {value || t('todo.deadlinePlaceholder')}
        </div>
    ));


    return (
    <div className="tab-content">
    <div className="todo-container">
      <h2>{t('todo.title')}</h2>

      <div className="todo-sort">
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: 'bold' }}>{t('todo.sortBy')}</label>

            <Select
                className="select"
                value={{ value: sortMode, label: t(`todo.${sortMode}`) }}
                onChange={option => setSortMode(option.value)}
                options={[
                    { value: 'created', label: t('todo.created') },
                    { value: 'priority', label: t('todo.priority') },
                    { value: 'deadline', label: t('todo.deadline') }
                ]}
                styles={customSelectStyles}
                isSearchable={false}
            />

        </div>
      </div>

      <div className="todo-input">
        <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('todo.addPlaceholder')}
        />

          <Select
              className="select"
              value={{ value: priority, label: t(`todo.${priority}`) }}
              onChange={option => setPriority(option.value)}
              options={[
                  { value: 'high', label: t('todo.high') },
                  { value: 'medium', label: t('todo.medium') },
                  { value: 'low', label: t('todo.low') }
              ]}
              isSearchable={false}
              styles={customSelectStyles}
          />


          <DatePicker
              selected={deadlineDate}
              onChange={(date) => {
                  if (!date) {
                      setDeadlineDate(null);
                      setDeadlineYMD('');
                      return;
                  }
                  const noon = toLocalNoon(date);
                  setDeadlineDate(noon);                 // dla DatePickera
                  setDeadlineYMD(dateToYMDLocal(noon));  // zapis do JSON i UI listy
              }}
              dateFormat="yyyy-MM-dd"
              customInput={<CustomDateInput />}
              calendarClassName="sd-datepicker"   // <— NOWE
              popperClassName="sd-datepicker-popper" // <— NOWE
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

