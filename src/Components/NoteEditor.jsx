import React, { useState, useRef, useEffect } from 'react';
import './NoteEditor.css';
import { Save, X, Download, Mic, MicOff, BotIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

function NoteEditor({ note, onSave, onCancel }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [language, setLanguage] = useState('pl');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  //==============================================================================
  useEffect(() => {
  window.electron.loadJSON('settings').then(data => {
    if (data.apiKey) setApiKey(data.apiKey);
    if (data.language) setLanguage(data.language);
  });
  }, []);
    
  const startRecording = async () => {

    if (!apiKey) {
      console.warn('❌ Brak klucza API!');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('🎤 Mikrofon niedostępny:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    //formData.append('language', i18n.language || 'pl');
    const langCode = (language || 'pl').split('-')[0];
    formData.append('language', langCode);

    setIsTranscribing(true); 

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: formData,
    });

    const data = await response.json();
    if (data.text) {
      setContent(prev => prev + '\n' + data.text);
    } else {
      console.warn('Brak transkrypcji:', data);
    }
    } catch (error) {
      console.error('Błąd transkrypcji:', error);
    }
    finally {
      setIsTranscribing(false); 
    }
};

const toggleRecording = () => {
  isRecording ? stopRecording() : startRecording();
};


//==============================================================================

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

        <button className="mic-btn" onClick={toggleRecording}>
          {isRecording ? <MicOff size={16} style={{ marginRight: 6 }} /> : <Mic size={16} style={{ marginRight: 6 }} />}
          {isRecording ? t('noteEditor.stopRecording') : t('noteEditor.startRecording')} 
          {isTranscribing && <span className="spinner" />}
        </button>

      </div>
    </div>
  );
}

export default NoteEditor;
