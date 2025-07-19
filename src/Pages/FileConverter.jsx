import React, { useState } from 'react';
import { Camera, Music, File, XCircle, CheckCircle, FileWarning} from 'lucide-react';
import './FileConverter.css';

function FileConverter() {
  // Image
  const [imagePath, setImagePath] = useState('');
  const [imageFormat, setImageFormat] = useState('');
  const [imageSourceFormat, setImageSourceFormat] = useState('');
  const [imageLog, setImageLog] = useState('');
  const allImageFormats = ['jpg', 'png', 'ico', 'webp'];

  // Document (dummy)
  const [docPath, setDocPath] = useState('');
  const [docFormat, setDocFormat] = useState('');
  const [docLog, setDocLog] = useState('');

  // Audio (dummy)
  const [audioPath, setAudioPath] = useState('');
  const [audioFormat, setAudioFormat] = useState('');
  const [audioSourceFormat, setAudioSourceFormat] = useState('');
  const [audioLog, setAudioLog] = useState('');
  const allAudioFormats = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];

  //=============== PICK ==========================================

  const handlePickDocument = async () => {
    const selectedPath = await window.electron.pickFileByType([
      { name: 'Documents', extensions: ['pdf', 'docx'] }
    ]);
    if (!selectedPath) return;

    setDocPath(selectedPath);
    const extMatch = selectedPath.match(/\.(\w+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    setDocFormat('');
    setDocLog(<><File size={14} style={{ marginRight: 6 }} />Selected: ${selectedPath} (.${ext})</>);
  };


  const handlePickImage = async () => {
    //const selectedPath = await window.electron.pickFile();
    const selectedPath = await window.electron.pickFileByType([
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'ico', 'webp'] }
    ]);

    if (!selectedPath) return;

    setImagePath(selectedPath);
    const extMatch = selectedPath.match(/\.(\w+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';

    setImageSourceFormat(ext);
    setImageFormat(''); 
    setImageLog(<><Camera size={14} style={{ marginRight: 6 }} />Selected: ${selectedPath} (.${ext}) </>); 
  };

  const handlePickAudio = async () => {
    //const selectedPath = await window.electron.pickFile();
    const selectedPath = await window.electron.pickFileByType([
      { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'] }
    ]);
    if (!selectedPath) return;
    const extMatch = selectedPath.match(/\.(\w+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    setAudioPath(selectedPath);
    setAudioSourceFormat(ext);
    setAudioFormat('');
    setAudioLog(<><Music size={14} style={{ marginRight: 6 }} />Selected: ${selectedPath} (.${ext})</>);
  };

//=================== CONVERT ============================================

const handleConvertImage = async () => {
  if (!imagePath || !imageFormat) {
    setImageLog(<><FileWarning size={14} style={{ marginRight: 6 }} />Select file and format.</>);
    return;
  }

  // wyciągnij format wyjściowy z "webp-from-png"
  const targetFormat = imageFormat.split('-from-')[0];

  const result = await window.electron.convertFile(imagePath, targetFormat);
  if (result.success) {
    setImageLog(<><CheckCircle size={14} style={{ marginRight: 6 }} />Converted to ${result.output}</>);
  } else {
    setImageLog(<><XCircle size={14} style={{ marginRight: 6 }} />Error: ${result.error}</>);
  }
};

const handleConvertAudio = async () => {
  if (!audioPath || !audioFormat) {
    setAudioLog(<><FileWarning size={14} style={{ marginRight: 6 }} />Select file and format.</>);
    return;
  }
  const targetFormat = audioFormat.split('-from-')[0];
  const result = await window.electron.convertAudio(audioPath, targetFormat);
  if (result.success) {
    setAudioLog(<><CheckCircle size={14} style={{ marginRight: 6 }} />Converted to ${result.output}</>);
  } else {
    setAudioLog(<><XCircle size={14} style={{ marginRight: 6 }} />Error: ${result.error}</>);
  }
};

const handleConvertDocument = async () => {
  if (!docPath || !docFormat) {
    setDocLog(<><FileWarning size={14} style={{ marginRight: 6 }} />Select file and format.</>);
    return;
  }

  const target = docFormat.split('-from-')[0];
  const source = docFormat.split('-from-')[1];

  if (source === 'docx' && target === 'pdf') {
    const result = await window.electron.convertDocToPdf(docPath);
    if (result.success) {
      setDocLog(<><CheckCircle size={14} style={{ marginRight: 6 }} />Converted to {result.output}</>);
    } else {
      setDocLog(<><XCircle size={14} style={{ marginRight: 6 }} />Error: {result.error}</>);
    }
  }

  if (source === 'pdf' && target === 'docx') {
    await window.electron.openPdfInWord(docPath);
    setDocLog(<><CheckCircle size={14} style={{ marginRight: 6 }} />Opened in Word. Use "Save as DOCX".</>);
  }
};


  //=============================================================================

  return (
    <div className="file-converter-container">
      <h2>File Converter</h2>

      {/* Document Section */}
      <div className="converter-section">
        <h3>Document</h3>
          <div className="file-converter-controls">
            <button onClick={handlePickDocument}>Pick File</button>
            <select value={docFormat} onChange={e => setDocFormat(e.target.value)}>
              <option value="">Select format</option>
              <option value="docx-from-pdf">PDF → DOCX</option>
                <option value="pdf-from-docx">DOCX → PDF</option>
            </select>
            <button onClick={handleConvertDocument} disabled={!docPath || !docFormat}>
              Convert
          </button>
          </div>
          <div className="file-converter-log">{docLog}</div>
      </div>

      {/* Image Section */}
      <div className="converter-section">
        <h3>Image</h3>
          <div className="file-converter-controls">
            <button onClick={handlePickImage}>Pick File</button>

            <select value={imageFormat} onChange={e => setImageFormat(e.target.value)}>
              <option value="">Convert to...</option>
              {allImageFormats
                .filter(fmt => fmt !== imageSourceFormat)
                .map(fmt => (
              <option key={fmt} value={`${fmt}-from-${imageSourceFormat}`}>
              {imageSourceFormat.toUpperCase()} → {fmt.toUpperCase()}
              </option>
              ))}
            </select>

            <button onClick={handleConvertImage} disabled={!imagePath || !imageFormat}>
              Convert
            </button>
        </div>
        <div className="file-converter-log">{imageLog}</div>
      </div>

      {/* Audio Section */}
      <div className="converter-section">
        <h3>Audio</h3>
          <div className="file-converter-controls">
            <button onClick={handlePickAudio}>Pick File</button>
            <select value={audioFormat} onChange={e => setAudioFormat(e.target.value)}>
              <option value="">Convert to...</option>
              {allAudioFormats
                .filter(fmt => fmt !== audioSourceFormat)
                .map(fmt => (
              <option key={fmt} value={`${fmt}-from-${audioSourceFormat}`}>
              {audioSourceFormat.toUpperCase()} → {fmt.toUpperCase()}
              </option>
              ))}
            </select>
            <button onClick={handleConvertAudio} disabled={!audioPath || !audioFormat}>
              Convert
            </button>
          </div>
         <div className="file-converter-log">{audioLog}</div>
      </div>

    </div>
  );
}

export default FileConverter;
