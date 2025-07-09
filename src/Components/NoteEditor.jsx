import React, { useState } from 'react';
import './NoteEditor.css';
import { Save, X, Download } from 'lucide-react';

function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  return (
    <div className="editor">
      <input
        className="editor-title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Note title"
      />
      <textarea
        className="editor-content"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write your note here..."
      />
      <div className="editor-actions">
        <button
          className="save-btn"
          onClick={() => onSave({ ...note, title, content })}
        >
          <Save size={16} style={{ marginRight: 6 }} />
          Save
        </button>

        <button className="cancel-btn" onClick={onCancel}>
          <X size={16} style={{ marginRight: 6 }} />
          Cancel
        </button>

        <button className="export-btn" onClick={() => window.electron.exportNote(title, content)}>
          <Download size={16} style={{marginRight: 6}} />
          Export
        </button>

      </div>
    </div>
  );
}

export default NoteEditor;
