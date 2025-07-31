// src/Pages/CalendarView.jsx
import React, { useEffect, useState } from 'react';
import './CalendarView.css';
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Calendar, X } from 'lucide-react';

export function CalendarView() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentView, setCurrentView] = useState('week');
    const [events, setEvents] = useState([]);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));

    // Form fields
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [day, setDay] = useState(1);
    const [organizer, setOrganizer] = useState('You');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const weekInfo = getWeekDates(currentWeekStart);
    const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8); // 8–16

    useEffect(() => {
        window.electron.loadJSON('todo-calendar').then(setEvents);
    }, []);

    useEffect(() => {
        window.electron.saveJSON('todo-calendar', events);
    }, [events]);

    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - ((day + 6) % 7);
        return new Date(d.setDate(diff));
    }

    function getWeekDates(startDate) {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            return {
                label: weekDays[i],
                date: d.getDate(),
                fullDate: d,
                iso: d.toISOString().split('T')[0],
            };
        });
    }

    const calculateEventStyle = (start, end) => {
        const s = parseInt(start.split(':')[0], 10) + parseInt(start.split(':')[1], 10) / 60;
        const e = parseInt(end.split(':')[0], 10) + parseInt(end.split(':')[1], 10) / 60;
        const top = Math.floor((s - 8) * 80) + 1;
        const height = Math.floor((e - s) * 80) - 10;
        return { top: `${top}px`, height: `${height}px` };
    };

    const addEvent = () => {
        if (!title.trim()) return;
        const selectedDate = weekInfo[day - 1].iso;
        const newEvent = {
            id: Date.now(),
            title,
            startTime,
            endTime,
            date: selectedDate,
            color: 'event-blue',
            description,
            location,
            attendees: [],
            organizer
        };
        setEvents([...events, newEvent]);
        setShowCreatePopup(false);
        setTitle(''); setStartTime('09:00'); setEndTime('10:00'); setLocation(''); setDescription(''); setOrganizer('You');
    };

    return (
        <div className="calendar-view-wrapper">
            <div className="calendar-header">
                <div className="left">
                    <button className="add-event-btn" onClick={() => setShowCreatePopup(true)}>+ Add Event</button>
                    <button className="today-btn" onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))}>Today</button>
                    <button onClick={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7)))}><ChevronLeft size={20} /></button>
                    <button onClick={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7)))}><ChevronRight size={20} /></button>
                    <h2>{weekInfo[0].fullDate.toLocaleDateString()} – {weekInfo[6].fullDate.toLocaleDateString()}</h2>
                </div>
                <div className="right">
                    {['day', 'week', 'month'].map(view => (
                        <button key={view} className={currentView === view ? 'active' : ''} onClick={() => setCurrentView(view)}>{view}</button>
                    ))}
                </div>
            </div>

            {currentView === 'week' && (
                <>
                    <div className="calendar-week-labels">
                        <div className="day-label empty-slot" />
                        {weekInfo.map((d, i) => (
                            <div key={i} className="day-label">{d.label} {d.date}</div>
                        ))}
                    </div>

                    <div className="calendar-grid">
                        <div className="time-column">
                            {timeSlots.map(t => <div key={t} className="time-slot">{t > 12 ? `${t - 12} PM` : `${t} AM`}</div>)}
                        </div>
                        {weekInfo.map((dayInfo, dayIndex) => (
                            <div key={dayIndex} className="day-column">
                                {timeSlots.map((_, i) => <div key={i} className="hour-cell" />)}
                                {events.filter(e => e.date === dayInfo.iso).map(e => (
                                    <div key={e.id} className={`calendar-event ${e.color}`} style={calculateEventStyle(e.startTime, e.endTime)} onClick={() => setSelectedEvent(e)}>
                                        <div className="title">{e.title}</div>
                                        <div className="time">{e.startTime} - {e.endTime}</div>
                                        <div className="event-hover">
                                            <p><strong>Organizer:</strong> {e.organizer}</p>
                                            <p><strong>Location:</strong> {e.location}</p>
                                            <p><strong>Description:</strong> {e.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </>
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
                        <p><Calendar size={16} /> {new Date(selectedEvent.date).toLocaleDateString()}</p>
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
                            <button onClick={addEvent}>Add Event</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
