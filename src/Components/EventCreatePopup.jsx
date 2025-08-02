// src/Components/EventCreatePopup.jsx
import React, { useState } from 'react';
import './EventPopup.css';

export function EventCreatePopup({ onClose, onSave, defaultValues, weekInfo }) {
    const [form, setForm] = useState(() => {
        if (defaultValues) {
            // znajdź indeks dnia tygodnia na podstawie event.date
            const index = weekInfo.findIndex(d => d.iso === defaultValues.date);
            return {
                ...defaultValues,
                day: index !== -1 ? index + 1 : 1, // jeśli nie znajdzie, da 1 (poniedziałek)
            };
        }
        return {
            title: '',
            startTime: '09:00',
            endTime: '10:00',
            day: 1,
            organizer: 'You',
            attendees: '',
            location: '',
            description: '',
            color: 'event-blue',
        };
    });


    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <div className="event-popup">
            <div className="popup-content">
                <button className="close-btn" onClick={onClose}>×</button>
                <h3>{defaultValues?.id ? 'Edit Event' : 'Create New Event'}</h3>
                <div className="popup-form">
                    <input name="title" type="text" placeholder="Title" value={form.title} onChange={handleChange} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input name="startTime" type="time" value={form.startTime} onChange={handleChange} />
                        <input name="endTime" type="time" value={form.endTime} onChange={handleChange} />
                    </div>
                    <select name="day" value={form.day} onChange={handleChange}>
                        {weekInfo.map((d, i) =>
                            <option key={i} value={i + 1}>
                                {d.label} ({d.fullDate.toLocaleDateString()})
                            </option>)}
                    </select>
                    <input name="organizer" type="text" placeholder="Organizer" value={form.organizer} onChange={handleChange} />
                    <input
                        name="attendees"
                        type="text"
                        placeholder="Attendees (comma-separated)"
                        value={form.attendees || ''}
                        onChange={handleChange}
                    />

                    <input name="location" type="text" placeholder="Location" value={form.location} onChange={handleChange} />
                    <input name="description" type="text" placeholder="Description" value={form.description} onChange={handleChange} />
                    <select name="color" value={form.color || 'event-blue'} onChange={handleChange}>
                        <option value="event-blue">🔵 Blue</option>
                        <option value="event-green">🟢 Green</option>
                        <option value="event-yellow">🟡 Yellow</option>
                        <option value="event-purple">🟣 Purple</option>
                        <option value="event-pink">💗 Pink</option>
                    </select>
                    <button
                        className="popup-form-button"
                        onClick={() => {
                            if (!form.title.trim()) {
                                alert("Title is required");
                                return;
                            }

                            const fullForm = {
                                ...form,
                                id: form.id || Date.now(), // zachowaj ID jeśli edytujemy
                                color: form.color || 'event-blue',
                                date: weekInfo[form.day - 1].iso
                            };

                            onSave(fullForm);
                        }}
                    >
                        Save Event
                    </button>

                </div>
            </div>
        </div>
    );
}