import React, { useState } from 'react';
import { Camera, Music, File, XCircle, CheckCircle, FileWarning} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import './FileConverter.css';

function FileConverter() {
  const { t } = useTranslation();
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
    setDocLog(<><File size={14} style={{ marginRight: 6 }} />{t('converter.log.selected', { path: selectedPath, ext })}</>);
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
    setImageLog(<><Camera size={14} style={{ marginRight: 6 }} />{t('converter.log.selected', { path: selectedPath, ext })}</>);
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
    setAudioLog(<><Music size={14} style={{ marginRight: 6 }} />{t('converter.log.selected', { path: selectedPath, ext })}</>);
  };

//=================== CONVERT ============================================

const handleConvertImage = async () => {
  if (!imagePath || !imageFormat) {
    setImageLog(<><FileWarning size={14} style={{ marginRight: 6 }} />{t('converter.log.selectPrompt')}</>);
    return;
  }

  // wyciągnij format wyjściowy z "webp-from-png"
  const targetFormat = imageFormat.split('-from-')[0];

  const result = await window.electron.convertFile(imagePath, targetFormat);
  if (result.success) {
    setImageLog(<><CheckCircle size={14} style={{ marginRight: 6 }} />{t('converter.log.convertedTo', { output: result.output })}</>);
  } else {
    setImageLog(<><XCircle size={14} style={{ marginRight: 6 }} />{t('converter.log.error', { error: result.error })}</>);
  }
};

const handleConvertAudio = async () => {
  if (!audioPath || !audioFormat) {
    setAudioLog(<><FileWarning size={14} style={{ marginRight: 6 }} />{t('converter.log.selectPrompt')}</>);
    return;
  }
  const targetFormat = audioFormat.split('-from-')[0];
  const result = await window.electron.convertAudio(audioPath, targetFormat);
  if (result.success) {
    setAudioLog(<><CheckCircle size={14} style={{ marginRight: 6 }} />{t('converter.log.convertedTo', { output: result.output })}</>);
  } else {
    setAudioLog(<><XCircle size={14} style={{ marginRight: 6 }} />{t('converter.log.error', { error: result.error })}</>);
  }
};

const handleConvertDocument = async () => {
  if (!docPath || !docFormat) {
    setDocLog(<><FileWarning size={14} style={{ marginRight: 6 }} />{t('converter.log.selectPrompt')}</>);
    return;
  }

  const target = docFormat.split('-from-')[0];
  const source = docFormat.split('-from-')[1];

  if (source === 'docx' && target === 'pdf') {
    const result = await window.electron.convertDocToPdf(docPath);
    if (result.success) {
      setDocLog(<><CheckCircle size={14} style={{ marginRight: 6 }} />{t('converter.log.convertedTo', { output: result.output })}</>);
    } else {
      setDocLog(<><XCircle size={14} style={{ marginRight: 6 }} />{t('converter.log.error', { error: result.error })}</>);
    }
  }

  if (source === 'pdf' && target === 'docx') {
    await window.electron.openPdfInWord(docPath);
    setDocLog(<><CheckCircle size={14} style={{ marginRight: 6 }} />{t('converter.log.openedWord')}</>);
  }
};



  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'var(--tile-bg)',
      borderColor: 'var(--accent)',
      borderRadius: 8,
      padding: '2px',
      boxShadow: state.isFocused ? `0 0 0 2px var(--accent)` : 'none',
      '&:hover': {
        borderColor: 'var(--hover)'
      }
    }),
    menu: base => ({
      ...base,
      backgroundColor: 'var(--tile-bg)',
      borderRadius: 8,
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
          ? 'var(--bg-main)'
          : 'transparent',
      color: 'var(--text)',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--active)'
      }
    }),
    singleValue: base => ({
      ...base,
      color: 'var(--text)'
    }),
    placeholder: base => ({
      ...base,
      color: 'var(--text)'
    }),
    input: base => ({
      ...base,
      color: 'var(--text)'
    })
  };



  //=============================================================================

  return (
    <div className="file-converter-container">
      <h2>{t('converter.title')}</h2>

      {/* Document Section */}
      <div className="converter-section disabled">
        <h3>{t('converter.document')} <span className="coming-soon">{t('converter.comingSoon')}</span></h3>
          <div className="file-converter-controls">
            <button disabled>{t('converter.pickFile')}</button>

            <Select
                className="select"
                value={
                  docFormat
                      ? {
                        value: docFormat,
                        label: docFormat === 'docx-from-pdf' ? 'PDF → DOCX' : 'DOCX → PDF'
                      }
                      : null
                }
                onChange={option => setDocFormat(option?.value || '')}
                options={[
                  { value: 'docx-from-pdf', label: 'PDF → DOCX' },
                  { value: 'pdf-from-docx', label: 'DOCX → PDF' }
                ]}
                placeholder={t('converter.selectFormat')}
                styles={customSelectStyles}
                isDisabled={true}
            />


            <button disabled>{t('converter.convert')}</button>
          </div>
       <div className="file-converter-log">{docLog}</div>
    </div>


      {/* Image Section */}
      <div className="converter-section">
        <h3>{t('converter.image')}</h3>
          <div className="file-converter-controls">
            <button onClick={handlePickImage}>{t('converter.pickFile')}</button>

            <Select
                className="select"
                value={
                  imageFormat
                      ? {
                        value: imageFormat,
                        label: `${imageSourceFormat.toUpperCase()} → ${imageFormat.split('-from-')[0].toUpperCase()}`
                      }
                      : null
                }
                onChange={option => setImageFormat(option?.value || '')}
                options={allImageFormats
                    .filter(fmt => fmt !== imageSourceFormat)
                    .map(fmt => ({
                      value: `${fmt}-from-${imageSourceFormat}`,
                      label: `${imageSourceFormat.toUpperCase()} → ${fmt.toUpperCase()}`
                    }))
                }
                placeholder={t('converter.convertTo')}
                styles={customSelectStyles}
            />


            <button onClick={handleConvertImage} disabled={!imagePath || !imageFormat}>
              {t('converter.convert')}
            </button>
        </div>
        <div className="file-converter-log">{imageLog}</div>
      </div>

      {/* Audio Section */}
      <div className="converter-section">
        <h3>{t('converter.audio')}</h3>
          <div className="file-converter-controls">
            <button onClick={handlePickAudio}>{t('converter.pickFile')}</button>

            <Select
                className="select"
                value={
                  audioFormat
                      ? {
                        value: audioFormat,
                        label: `${audioSourceFormat.toUpperCase()} → ${audioFormat.split('-from-')[0].toUpperCase()}`
                      }
                      : null
                }
                onChange={option => setAudioFormat(option?.value || '')}
                options={allAudioFormats
                    .filter(fmt => fmt !== audioSourceFormat)
                    .map(fmt => ({
                      value: `${fmt}-from-${audioSourceFormat}`,
                      label: `${audioSourceFormat.toUpperCase()} → ${fmt.toUpperCase()}`
                    }))
                }
                placeholder={t('converter.convertTo')}
                styles={customSelectStyles}
            />


            <button onClick={handleConvertAudio} disabled={!audioPath || !audioFormat}>
              {t('converter.convert')}
            </button>
          </div>
         <div className="file-converter-log">{audioLog}</div>
      </div>

    </div>
  );
}

export default FileConverter;
