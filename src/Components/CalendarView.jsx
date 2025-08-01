// src/Pages/CalendarView.jsx
import React, { useEffect, useState } from 'react';
import './CalendarView.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {EventPopup} from '../Components/EventPopup';
import {EventCreatePopup} from '../Components/EventCreatePopup';

export function CalendarView() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentView, setCurrentView] = useState('week');
    const [events, setEvents] = useState([]);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [editEvent, setEditEvent] = useState(null);

    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const weekInfo = getWeekDates(currentWeekStart);
    const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8);

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

    const handleEditEvent = (event) => {
        setEditEvent(event);
        setSelectedEvent(null);      // zamknij popup
        setShowCreatePopup(true);    // otwórz formularz edycji
    };

    const calculateEventStyle = (start, end) => {
        const s = parseInt(start.split(':')[0], 10) + parseInt(start.split(':')[1], 10) / 60;
        const e = parseInt(end.split(':')[0], 10) + parseInt(end.split(':')[1], 10) / 60;
        const top = Math.floor((s - 8) * 80) + 1;
        const height = Math.floor((e - s) * 80) - 10;
        return { top: `${top}px`, height: `${height}px` };
    };

    const deleteEvent = (id) => {
        setEvents(events.filter(e => e.id !== id));
        setSelectedEvent(null);
    };

    const updateEvent = (updated) => {
        const normalized = {
            ...updated,
            attendees: typeof updated.attendees === 'string'
                ? updated.attendees.split(',').map(a => a.trim()).filter(Boolean)
                : updated.attendees || [],
        };
        setEvents(events.map(e => e.id === updated.id ? normalized : e));
        setSelectedEvent(null);
        setEditEvent(null);
        setShowCreatePopup(false);
    };

    const addEvent = (newEvent) => {
        const normalized = {
            ...newEvent,
            attendees: typeof newEvent.attendees === 'string'
                ? newEvent.attendees.split(',').map(a => a.trim()).filter(Boolean)
                : newEvent.attendees || [],
        };
        setEvents([...events, normalized]);
        setShowCreatePopup(false);
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
                <EventPopup
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onDelete={deleteEvent}
                    onEdit={handleEditEvent}
                />
            )}

            {showCreatePopup && (
                <EventCreatePopup
                    onClose={() => {
                        setShowCreatePopup(false);
                        setEditEvent(null);
                    }}
                    onSave={(data) => {
                        if (editEvent) {
                            updateEvent({ ...editEvent, ...data });
                        } else {
                            const newId = crypto.randomUUID(); // lub Date.now()
                            const date = weekInfo[data.day - 1]?.iso;
                            addEvent({ id: newId, date, ...data });
                        }
                    }}
                    defaultValues={editEvent}
                    weekInfo={weekInfo}
                />
            )}

        </div>
    );
}
