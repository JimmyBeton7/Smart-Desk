import React from 'react';
import { Trash } from 'lucide-react';
import './NoteTile.css'; // jeśli chcesz wyrzucić przycisk do rogu

function NoteTile({ note, onClick, onDelete }) {
  return (
    <div className="note-tile">
      <div className="note-header">
        <h3 onClick={onClick}>{note.title}</h3>
        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}>
          <Trash size={16} />
        </button>
      </div>
      <div onClick={onClick} dangerouslySetInnerHTML={{ __html: note.content.slice(0, 100) + '...' }} />
    </div>
  );
}

export default NoteTile;
