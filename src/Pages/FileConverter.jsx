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

  const handlePickImage = async () => {
    const selectedPath = await window.electron.pickFile();
    if (!selectedPath) return;

    setImagePath(selectedPath);
    const extMatch = selectedPath.match(/\.(\w+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';

    setImageSourceFormat(ext);
    setImageFormat(''); 
    setImageLog(<><Camera size={14} style={{ marginRight: 6 }} />Selected: ${selectedPath} (.${ext}) </>); 
  };

  const handlePickAudio = async () => {
    const selectedPath = await window.electron.pickFile();
    if (!selectedPath) return;
    const extMatch = selectedPath.match(/\.(\w+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    setAudioPath(selectedPath);
    setAudioSourceFormat(ext);
    setAudioFormat('');
    setAudioLog(<><Music size={14} style={{ marginRight: 6 }} />Selected: ${selectedPath} (.${ext})</>);
  };


  const handlePickFile = async (type) => {
    const selectedPath = await window.electron.pickFile();
    if (!selectedPath) return;

    switch (type) {
      case 'image':
        setImagePath(selectedPath);
        setImageLog(`📷 Selected: ${selectedPath}`);
        break;
      case 'document':
        setDocPath(selectedPath);
        setDocLog(`📄 Selected: ${selectedPath}`);
        break;
      case 'audio':
        setAudioPath(selectedPath);
        setAudioLog(`🎵 Selected: ${selectedPath}`);
        break;
      default:
        break;
    }
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

  const handleConvertDummy = (type) => {
    switch (type) {
      case 'document':
        setDocLog("🛠 Document conversion not implemented yet.");
        break;
      case 'audio':
        setAudioLog("🛠 Audio conversion not implemented yet.");
        break;
      default:
        break;
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
          <button onClick={() => handlePickFile('document')}>Pick File</button>
          <select value={docFormat} onChange={e => setDocFormat(e.target.value)}>
            <option value="">Select format</option>
            <option value="docx-from-pdf">PDF → DOCX</option>
            <option value="txt-from-pdf">PDF → TXT</option>
          </select>
          <button onClick={() => handleConvertDummy('document')} disabled={!docPath || !docFormat}>
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
