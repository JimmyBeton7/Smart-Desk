// src/Pages/CalendarView.jsx
import React, { useEffect, useState } from 'react';
import './CalendarView.css';
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Calendar, X } from 'lucide-react';

export default function CalendarView() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentDate] = useState('March 5');
    const [currentMonth] = useState('March 2025');
    const [currentView, setCurrentView] = useState('week');
    const [events, setEvents] = useState([]);
    const [showCreatePopup, setShowCreatePopup] = useState(false);

    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [day, setDay] = useState(1);
    const [organizer, setOrganizer] = useState('You');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const weekDates = [3, 4, 5, 6, 7, 8, 9];
    const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8); // 8–16

    useEffect(() => {
        window.electron.loadJSON('todo-calendar').then(setEvents);
    }, []);

    useEffect(() => {
        window.electron.saveJSON('todo-calendar', events);
    }, [events]);

    const calculateEventStyle = (startTime, endTime) => {
        const start = parseInt(startTime.split(':')[0], 10) + parseInt(startTime.split(':')[1], 10) / 60;
        const end = parseInt(endTime.split(':')[0], 10) + parseInt(endTime.split(':')[1], 10) / 60;
        const top = (start - 8) * 80;
        const height = (end - start) * 80;
        return { top: `${top}px`, height: `${height}px` };
    };

    const addEvent = () => {
        if (!title.trim()) return;
        const newEvent = {
            id: Date.now(),
            title,
            startTime,
            endTime,
            day,
            color: 'event-blue',
            description,
            location,
            attendees: [],
            organizer,
        };
        setEvents([...events, newEvent]);
        setTitle('');
        setLocation('');
        setDescription('');
        setOrganizer('You');
    };

    return (
        <div className="calendar-view-wrapper">
            <div className="calendar-header">
                <div className="left">
                    <button className="add-event-btn" onClick={() => setShowCreatePopup(true)}>+ Add Event</button>
                    <button className="today-btn">Today</button>
                    <button><ChevronLeft size={20} /></button>
                    <button><ChevronRight size={20} /></button>
                    <h2>{currentDate}</h2>
                </div>

                <div className="right">
                    {['day', 'week', 'month'].map(view => (
                        <button
                            key={view}
                            className={currentView === view ? 'active' : ''}
                            onClick={() => setCurrentView(view)}
                        >
                            {view[0].toUpperCase() + view.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {currentView === 'week' && (
                <div className="calendar-grid">
                    <div className="time-column">
                        {timeSlots.map(t => (
                            <div key={t} className="time-slot">{t > 12 ? `${t - 12} PM` : `${t} AM`}</div>
                        ))}
                    </div>

                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                        <div key={dayIndex} className="day-column">
                            {timeSlots.map((_, i) => (
                                <div key={i} className="hour-cell" />
                            ))}

                            {events
                                .filter(e => e.day === dayIndex + 1)
                                .map(e => {
                                    const style = calculateEventStyle(e.startTime, e.endTime);
                                    return (
                                        <div
                                            key={e.id}
                                            className={`calendar-event ${e.color}`}
                                            style={style}
                                            onClick={() => setSelectedEvent(e)}
                                        >
                                            <div className="title">{e.title}</div>
                                            <div className="time">{e.startTime} - {e.endTime}</div>
                                            <div className="event-hover">
                                                <p><strong>Organizer:</strong> {e.organizer}</p>
                                                <p><strong>Location:</strong> {e.location}</p>
                                                <p><strong>Description:</strong> {e.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ))}
                </div>
            )}

            {currentView !== 'week' && (
                <div style={{ padding: 20, color: 'gray' }}>
                    <p>{currentView.toUpperCase()} view is under construction.</p>
                </div>
            )}

            {selectedEvent && (
                <div className="event-popup">
                    <div className={`popup-content ${selectedEvent.color}`}>
                        <button className="close-btn" onClick={() => setSelectedEvent(null)}><X size={18} /></button>
                        <h3>{selectedEvent.title}</h3>
                        <p><Clock size={16} /> {selectedEvent.startTime} - {selectedEvent.endTime}</p>
                        <p><MapPin size={16} /> {selectedEvent.location}</p>
                        <p><Calendar size={16} /> {weekDays[selectedEvent.day - 1]}, {weekDates[selectedEvent.day - 1]} {currentMonth}</p>
                        <p><Users size={16} /> {selectedEvent.attendees.join(', ')}</p>
                        <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
                        <p><strong>Description:</strong> {selectedEvent.description}</p>
                    </div>
                </div>
            )}

            {showCreatePopup && (
                <div className="event-popup">
                    <div className="popup-content event-blue">
                        <button className="close-btn" onClick={() => setShowCreatePopup(false)}><X size={18} /></button>
                        <h3>Create New Event</h3>
                        <div className="popup-form">
                            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                            </div>
                            <select value={day} onChange={e => setDay(parseInt(e.target.value))}>
                                {weekDays.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
                            </select>
                            <input type="text" placeholder="Organizer" value={organizer} onChange={e => setOrganizer(e.target.value)} />
                            <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
                            <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

                            <button onClick={() => {
                                if (!title.trim()) return;
                                const newEvent = {
                                    id: Date.now(),
                                    title,
                                    startTime,
                                    endTime,
                                    day,
                                    color: 'event-blue',
                                    description,
                                    location,
                                    attendees: [],
                                    organizer
                                };
                                setEvents([...events, newEvent]);
                                setTitle('');
                                setLocation('');
                                setDescription('');
                                setOrganizer('You');
                                setShowCreatePopup(false);
                            }}>
                                Add Event
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
