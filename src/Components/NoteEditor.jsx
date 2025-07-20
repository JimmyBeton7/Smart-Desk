import React, { useState } from 'react';
import './NoteEditor.css';
import { Save, X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function NoteEditor({ note, onSave, onCancel }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  return (
    <div className="editor">
      <input
        className="editor-title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder={t('noteEditor.titlePlaceholder')}
      />
      <textarea
        className="editor-content"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={t('noteEditor.contentPlaceholder')}
      />
      <div className="editor-actions">
        <button
          className="save-btn"
          onClick={() => onSave({ ...note, title, content })}
        >
          <Save size={16} style={{ marginRight: 6 }} />
          {t('noteEditor.save')}
        </button>

        <button className="cancel-btn" onClick={onCancel}>
          <X size={16} style={{ marginRight: 6 }} />
          {t('noteEditor.cancel')}
        </button>

        <button className="export-btn" onClick={() => window.electron.exportNote(title, content)}>
          <Download size={16} style={{marginRight: 6}} />
          {t('noteEditor.export')}
        </button>

      </div>
    </div>
  );
}

export default NoteEditor;
