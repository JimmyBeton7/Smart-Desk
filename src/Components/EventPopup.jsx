import React from 'react';
import { Clock, MapPin, Users, Calendar, X } from 'lucide-react';
import './EventPopup.css';

export function EventPopup({ event, onClose, onDelete, onEdit }) {
    return (
        <div className="event-popup">
            <div className="popup-content">
                <button className="close-btn" onClick={onClose}><X size={18} /></button>
                <h3>{event.title || 'Untitled Event'}</h3>

                <p><Clock size={16} /> {event.startTime} – {event.endTime}</p>

                {event.location && (
                    <p><MapPin size={16} /> {event.location}</p>
                )}

                {event.date && (
                    <p><Calendar size={16} /> {new Date(event.date).toLocaleDateString()}</p>
                )}

                {event.attendees?.length > 0 && (
                    <p><Users size={16} /> {Array.isArray(event.attendees) ? event.attendees.join(', ') : event.attendees}</p>
                )}

                {event.organizer && (
                    <p><strong>Organizer:</strong> {event.organizer}</p>
                )}

                {event.description && (
                    <p><strong>Description:</strong> {event.description}</p>
                )}

                <div className="popup-buttons">
                    <button className="popup-form-button" onClick={() => onEdit(event)}>Edit</button>
                    <button className="popup-form-button" onClick={() => onDelete(event.id)}>Delete</button>
                </div>
            </div>
        </div>
    );
}
