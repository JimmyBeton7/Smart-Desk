import React, { useState } from 'react';
import './FileConverter.css';

function FileConverter() {
  const [filePath, setFilePath] = useState('');
  const [targetFormat, setTargetFormat] = useState('');
  const [sourceFormat, setSourceFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [log, setLog] = useState('');

  const handlePickFile = async () => {
    const selectedPath = await window.electron.pickFile();
    if (selectedPath) {
      setFilePath(selectedPath);
      setTargetFormat('');
      setSourceFormat('');
      setOutputFormat('');
      setLog(`Picked file: ${selectedPath}`);
    }
  };

  const handleFormatChange = (value) => {
    const [to, from] = value.split('-from-');
    setSourceFormat(from);
    setOutputFormat(to);
    setTargetFormat(value);
  };

  const handleConvert = async () => {
    if (!filePath || !outputFormat) {
      setLog("❗ Please select file and format.");
      return;
    }

    if (targetFormat === 'docx-from-pdf') {
        const res = await window.electron.convertPdfToDocx(filePath);
        setLog(res.success ? `✅ PDF→DOCX: ${res.output}` : `❌ Error: ${res.error}`);
        return;
        }

    const result = await window.electron.convertFile(filePath, outputFormat);
    if (result.success) {
      setLog(`✅ File converted to ${result.output}`);
    } else {
      setLog(`❌ Error: ${result.error}`);
    }
  };

  return (
    <div className="file-converter-container">
      <h2>File Converter</h2>
      <div className="file-converter-controls">
        <button onClick={handlePickFile}>Pick File</button>
        <select value={targetFormat} onChange={e => handleFormatChange(e.target.value)}>
          <option value="">Select format</option>
          <option value="docx-from-pdf">PDF → DOCX</option>
          <option value="jpg-from-png">PNG → JPG</option>
          <option value="png-from-jpg">JPG → PNG</option>
          <option value="ico-from-png">PNG → ICO</option>
          <option value="webp-from-png">PNG → WEBP</option>
          <option value="png-from-webp">WEBP → PNG</option>
          <option value="jpg-from-webp">WEBP → JPG</option>
        </select>
        <button onClick={handleConvert} disabled={!filePath || !outputFormat}>Convert</button>
      </div>
      <div className="file-converter-log">{log}</div>
    </div>
  );
}

export default FileConverter;
