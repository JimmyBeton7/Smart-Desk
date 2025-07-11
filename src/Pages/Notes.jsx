import React, { useEffect, useState } from 'react';
import NoteTile from '../Components/NoteTile';
import NoteEditor from '../Components/NoteEditor';
import './Notes.css';
import { Plus, StickyNote } from 'lucide-react';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  const loadNotes = async () => {
    const res = await window.electron.ipc.invoke('load-notes');
    setNotes(res);
  };

  const handleDelete = async (id) => {
  await window.electron.ipc.invoke('delete-note', id);
  loadNotes(); // re-render
  };

  const handleSave = async (note) => {
    await window.electron.ipc.invoke('save-note', note);
    setSelectedNote(null);
    loadNotes();
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return selectedNote ? (
    <NoteEditor note={selectedNote} onSave={handleSave} onCancel={() => setSelectedNote(null)} />
  ) : (
    <div>
      <div className="tab-content">
      <div className="notes-header">
        <h2><StickyNote size={20} style={{ marginRight: 8 }} /> Your notes</h2>
        <button onClick={() => setSelectedNote({ id: Date.now(), title: '', content: '' })}>
          <Plus size={16} style={{ marginRight: 8 }} />
          New note
        </button>
      </div>
      <div className="notes-grid">
        {notes.map(note => (
          <NoteTile key={note.id} note={note} onClick={() => setSelectedNote(note)} onDelete={handleDelete} />
        ))}
      </div>
    </div>
    </div>
  );
}

export default Notes;
