// UnitConverter.jsx
import React, { useState } from 'react';
import './UnitConverter.css';

const conversionData = {
  length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.34,
    yd: 0.9144,
    ft: 0.3048,
    in: 0.0254,
    nmi: 1852
  },
  area: {
    'm²': 1,
    'km²': 1e6,
    'cm²': 0.0001,
    'mm²': 1e-6,
    ha: 1e4,
    'ft²': 0.092903,
    'yd²': 0.836127,
    'in²': 0.00064516,
    acre: 4046.86
  },
  volume: {
    'm³': 1,
    l: 0.001,
    ml: 0.000001,
    'cm³': 1e-6,
    'mm³': 1e-9,
    'ft³': 0.0283168,
    'in³': 0.0000163871,
    gal: 0.00378541,
    pt: 0.000473176,
    floz: 0.0000295735
  },
  mass: {
    μg: 1e-6,
    mg: 0.001,
    gr: 0.06479891,
    ct: 0.2,
    g: 1,
    oz: 28.3495,
    kg: 1000,
    lb: 453.592,
    slug: 14593.9,
    ton: 907184.74,
    tonne: 1e6,
    tonUK: 1016046.91
  },
  time: {
    fs: 1e-15,
    ps: 1e-12,
    ns: 1e-9,
    μs: 1e-6,
    ms: 0.001,
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    tydz: 604800,
    mies: 2592000,
    r: 31556952
  },
  energy: {
    eV: 1.60218e-19,
    erg: 1e-7,
    J: 1,
    'ft-lb': 1.35582,
    cal: 4.184,
    kcal: 4184,
    Btu: 1055.06,
    quad: 1.055e+18,
    kWh: 3.6e6,
    therm: 1.055e8
  },
  light: {
    lx: 1,
    'lm/m2': 1,
    'f*cd': 10.7639,
    'lm/ft2': 10.7639,
    'lm/in2': 1550.003,
    'lm/cm2': 10000,
    ph: 10000,
    'W/cm2': 683000
  },
  temperature: {
    '°C': 'C',
    '°F': 'F',
    K: 'K',
    '°R': 'R',
    '°Ré': 'Re'
  },
  pressure: {
    Pa: 1,
    kPa: 1000,
    bar: 100000,
    atm: 101325,
    psi: 6894.76,
    mmHg: 133.322,
    inHg: 3386.39,
    mmH20: 9.80665,
    inH20: 249.089
  },
  power: {
    mW: 0.001,        // milliwat
    W: 1,             // wat
    kW: 1000,         // kilowat
    MW: 1_000_000,    // megawat
    KM: 735.49875,    // koń mechaniczny (metric horsepower)
    hp: 745.699872    // koń parowy (imperial horsepower)
  },
  speed: {
    'in/s': 0.0254,         // Cale na sekundę
    'cm/s': 0.01,           // Centymetry na sekundę
    'ft/s': 0.3048,         // Stopy na sekundę
    'km/h': 0.277777778,    // Kilometry na godzinę
    'mi/h': 0.44704,        // Mile na godzinę (mph)
    'kn': 0.514444,         // Węzeł (knot)
    'm/s': 1,               // Metry na sekundę (bazowa jednostka)
    'mach': 343,            // Mach (w temperaturze 20°C w powietrzu na poziomie morza)
    'km/s': 1000,           // Kilometry na sekundę
    'c': 299_792_458        // Prędkość światła w próżni
},
count: {
  szt: 1,
  tuzin: 12,
  mendel: 15,
  mendel_chlopski: 20,
  kopa: 60,
  gros: 144
},
data: {
  // Bity
  b: 1,
  kb: 1e3,
  mb: 1e6,
  gb: 1e9,

  // Bajty
  B: 8,
  kB: 8e3,
  MB: 8e6,
  GB: 8e9,
  TB: 8e12,
  PB: 8e15,
  EB: 8e18,
  ZB: 8e21,
  YB: 8e24,

  // Bajty binarne (IEC - 1024)
  KiB: 8192,
  MiB: 8_388_608,
  GiB: 8_589_934_592,
  TiB: 8_796_093_022_208,
  PiB: 9_007_199_254_740_992,
  EiB: 9_223_372_036_854_775_808,
  ZiB: 9.44473296573929e+21,
  YiB: 9.671406556917033e+24
}
};

const UnitConverter = () => {

  const [mode1, setMode1] = useState('length');
  const [value1, setValue1] = useState('');
  const [fromUnit1, setFromUnit1] = useState('m');
  const [toUnit1, setToUnit1] = useState('km');

  const [mode2, setMode2] = useState('energy');
  const [value2, setValue2] = useState('');
  const [fromUnit2, setFromUnit2] = useState('J');
  const [toUnit2, setToUnit2] = useState('kWh');

  const [mode3, setMode3] = useState('count');
  const [value3, setValue3] = useState('');
  const [fromUnit3, setFromUnit3] = useState('szt');
  const [toUnit3, setToUnit3] = useState('tuzin');
  
  const convert = (val, from, to, mode) => 
  {

    if (mode === 'temperature') return convertTemperature(val, from, to);

    if (!val || isNaN(val)) return '';
    const inBase = parseFloat(val) * conversionData[mode][from];
    return inBase / conversionData[mode][to];

  };

  const convertTemperature = (val, from, to) => 
  {
    let celsius;

    val = parseFloat(val);
    if (isNaN(val)) return '';

    // convert to Celsius first
    switch (from) 
    {
        case '°C': celsius = val; break;
        case '°F': celsius = (val - 32) * 5 / 9; break;
        case 'K':  celsius = val - 273.15; break;
        case '°R': celsius = (val - 491.67) * 5 / 9; break;
        case '°Ré': celsius = val * 1.25; break;
        default: return '';
    }

    // convert from Celsius to target
    switch (to) 
    {
        case '°C': return celsius;
        case '°F': return celsius * 9 / 5 + 32;
        case 'K':  return celsius + 273.15;
        case '°R': return (celsius + 273.15) * 9 / 5;
        case '°Ré': return celsius * 0.8;
        default: return '';
    }
  };

  const units1 = Object.keys(conversionData[mode1]);
  const result1 = convert(value1, fromUnit1, toUnit1, mode1);

  const units2 = Object.keys(conversionData[mode2]);
  const result2 = convert(value2, fromUnit2, toUnit2, mode2);

  const units3 = Object.keys(conversionData[mode3]);
  const result3 = convert(value3, fromUnit3, toUnit3, mode3);

  //const units = Object.keys(conversionData[mode]);
  //const result = convert(value, fromUnit, toUnit);

  return (

  <div className="unit-converter">

  {/* --- GŁÓWNY FORMULARZ: Length, Area, Volume, Mass, Time --- */}

  <div className="tabs">
    <button className={mode1 === 'length' ? 'active' : ''} onClick={() => {setMode1('length'); setFromUnit1('m'); setToUnit1('km')}}>Length</button>
    <button className={mode1 === 'area' ? 'active' : ''} onClick={() => {setMode1('area'); setFromUnit1('m²'); setToUnit1('km²')}}>Area</button>
    <button className={mode1 === 'volume' ? 'active' : ''} onClick={() => {setMode1('volume'); setFromUnit1('m³'); setToUnit1('l')}}>Volume</button>
    <button className={mode1 === 'mass' ? 'active' : ''} onClick={() => {setMode1('mass'); setFromUnit1('g'); setToUnit1('kg')}}>Mass</button>
    <button className={mode1 === 'time' ? 'active' : ''} onClick={() => {setMode1('time'); setFromUnit1('s'); setToUnit1('min')}}>Time</button>
    <button className={mode1 === 'velocity' ? 'active' : ''} onClick={() => {setMode1('velocity'); setFromUnit1('in/s'); setToUnit1('cm/s')}}>Velocity</button>
  </div>

  <div className="converter-form">
    <input type="number" value={value1} onChange={e => setValue1(e.target.value)} placeholder="Enter value" />
    <div className="unit-select">
      <select value={fromUnit1} onChange={e => setFromUnit1(e.target.value)}>
        {units1.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <span>&rarr;</span>
      <select value={toUnit1} onChange={e => setToUnit1(e.target.value)}>
        {units1.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
    </div>
    <div className="result">{parseFloat(result1).toFixed(6)}</div>
  </div>

  {/* --- DRUGI FORMULARZ: Energy, Light --- */}

  <div className="tabs" style={{ marginTop: '24px' }}>
    <button className={mode2 === 'energy' ? 'active' : ''} onClick={() => {setMode2('energy'); setFromUnit2('J'); setToUnit2('kWh')}}>Energy</button>
    <button className={mode2 === 'light' ? 'active' : ''} onClick={() => {setMode2('light'); setFromUnit2('lx'); setToUnit2('lm/m2')}}>Light</button>
    <button className={mode2 === 'temperature' ? 'active' : ''} onClick={() => {setMode2('temperature'); setFromUnit2('°C'); setToUnit2('K')}}>Temperature</button>
    <button className={mode2 === 'pressure' ? 'active' : ''} onClick={() => {setMode2('pressure'); setFromUnit2('Pa'); setToUnit2('psi')}}>Pressure</button>
    <button className={mode2 === 'power' ? 'active' : ''} onClick={() => {setMode2('power'); setFromUnit2('mW'); setToUnit2('hp')}}>Power</button>
  </div>

  <div className="converter-form">
    <input type="number" value={value2} onChange={e => setValue2(e.target.value)} placeholder="Enter value" />
    <div className="unit-select">
      <select value={fromUnit2} onChange={e => setFromUnit2(e.target.value)}>
        {units2.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <span>&rarr;</span>
      <select value={toUnit2} onChange={e => setToUnit2(e.target.value)}>
        {units2.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
    </div>
    <div className="result">{parseFloat(result2).toFixed(6)}</div>
  </div>

  {/* --- TRZECI FORMULARZ: COUNT, DATA --- */}

  <div className="tabs" style={{ marginTop: '24px' }}>
    <button className={mode3 === 'count' ? 'active' : ''} onClick={() => {setMode3('count'); setFromUnit3('szt'); setToUnit3('tuzin')}}>Count</button>
    <button className={mode3 === 'data' ? 'active' : ''} onClick={() => {setMode3('data'); setFromUnit3('b'); setToUnit3('B')}}>Data</button>
  </div>

  <div className="converter-form">
    <input type="number" value={value3} onChange={e => setValue3(e.target.value)} placeholder="Enter value" />
    <div className="unit-select">
      <select value={fromUnit3} onChange={e => setFromUnit3(e.target.value)}>
        {units3.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <span>&rarr;</span>
      <select value={toUnit3} onChange={e => setToUnit3(e.target.value)}>
        {units3.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
    </div>
    <div className="result">{parseFloat(result3).toFixed(6)}</div>
  </div>

</div>
);
};

export default UnitConverter;