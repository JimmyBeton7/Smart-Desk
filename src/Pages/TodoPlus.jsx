// src/Pages/TodoPlus.jsx
import React, { useEffect, useState } from 'react';
import './TodoPlus.css';
import { Calendar,  } from 'lucide-react';

function TodoPlus() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);


  useEffect(() => {
    const saved = localStorage.getItem('todo-plus');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('todo-plus', JSON.stringify(tasks));
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
    <div className="todo-container">
      <h2>TODO+</h2>
      <div className="todo-input">
        <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a new task…"
        />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="high">🔥High</option>
            <option value="medium">⚖️ Medium</option>
            <option value="low">🧊 Low</option>
        </select>
        <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
        />
        <button onClick={saveTask}>{editTaskId ? 'Save' : 'Add'}</button>
     </div>

      <ul className="todo-list">
        {tasks.map(task => (
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
                <button onClick={() => editTask(task)}>✏️</button>
                <button onClick={() => removeTask(task.id)}>🗑</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoPlus;
