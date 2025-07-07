import React from 'react';

function NoteTile({ note, onClick }) {
  return (
    <div className="note-tile" onClick={onClick}>
      <h3>{note.title}</h3>
      <div dangerouslySetInnerHTML={{ __html: note.content.slice(0, 100) + '...' }} />
    </div>
  );
}

export default NoteTile;