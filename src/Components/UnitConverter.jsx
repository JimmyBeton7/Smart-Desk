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

const unitLabels = {
  length: {
    m: "meters",
    km: "kilometers",
    cm: "centimeters",
    mm: "millimeters",
    mi: "miles",
    yd: "yards",
    ft: "feet",
    in: "inches",
    nmi: "nautical miles"
  },
  area: {
    "m²": "square meters",
    "km²": "square kilometers",
    "cm²": "square centimeters",
    "mm²": "square millimeters",
    ha: "hectares",
    "ft²": "square feet",
    "yd²": "square yards",
    "in²": "square inches",
    acre: "acres"
  },
  volume: {
    "m³": "cubic meters",
    l: "liters",
    ml: "milliliters",
    "cm³": "cubic centimeters",
    "mm³": "cubic millimeters",
    "ft³": "cubic feet",
    "in³": "cubic inches",
    gal: "gallons",
    pt: "pints",
    floz: "fluid ounces"
  },
  mass: {
    μg: "micrograms",
    mg: "milligrams",
    gr: "grains",
    ct: "carats",
    g: "grams",
    oz: "ounces",
    kg: "kilograms",
    lb: "pounds",
    slug: "slugs",
    ton: "US tons",
    tonne: "metric tons",
    tonUK: "UK tons"
  },
  time: {
    fs: "femtoseconds",
    ps: "picoseconds",
    ns: "nanoseconds",
    μs: "microseconds",
    ms: "milliseconds",
    s: "seconds",
    min: "minutes",
    h: "hours",
    d: "days",
    tydz: "weeks",
    mies: "months",
    r: "years"
  },
  energy: {
    eV: "electronvolts",
    erg: "ergs",
    J: "joules",
    "ft-lb": "foot-pounds",
    cal: "calories",
    kcal: "kilocalories",
    Btu: "British thermal units",
    quad: "quads",
    kWh: "kilowatt-hours",
    therm: "therms"
  },
  light: {
    lx: "lux",
    "lm/m2": "lumens per square meter",
    "f*cd": "foot-candles",
    "lm/ft2": "lumens per square foot",
    "lm/in2": "lumens per square inch",
    "lm/cm2": "lumens per square centimeter",
    ph: "phot",
    "W/cm2": "watts per square centimeter"
  },
  temperature: {
    "°C": "degrees Celsius",
    "°F": "degrees Fahrenheit",
    K: "kelvin",
    "°R": "degrees Rankine",
    "°Ré": "degrees Réaumur"
  },
  pressure: {
    Pa: "pascals",
    kPa: "kilopascals",
    bar: "bars",
    atm: "atmospheres",
    psi: "pounds per square inch",
    mmHg: "millimeters of mercury",
    inHg: "inches of mercury",
    mmH20: "millimeters of water",
    inH20: "inches of water"
  },
  power: {
    mW: "milliwatts",
    W: "watts",
    kW: "kilowatts",
    MW: "megawatts",
    KM: "metric horsepower",
    hp: "imperial horsepower"
  },
  speed: {
    "in/s": "inches per second",
    "cm/s": "centimeters per second",
    "ft/s": "feet per second",
    "km/h": "kilometers per hour",
    "mi/h": "miles per hour",
    kn: "knots",
    "m/s": "meters per second",
    mach: "Mach (at sea level, 20°C)",
    "km/s": "kilometers per second",
    c: "speed of light in vacuum"
  },
  count: {
    szt: "pieces",
    tuzin: "dozens",
    mendel: "mendels",
    mendel_chlopski: "peasant mendels",
    kopa: "sixties",
    gros: "gross"
  },
  data: {
    b: "bits",
    kb: "kilobits",
    mb: "megabits",
    gb: "gigabits",
    B: "bytes",
    kB: "kilobytes",
    MB: "megabytes",
    GB: "gigabytes",
    TB: "terabytes",
    PB: "petabytes",
    EB: "exabytes",
    ZB: "zettabytes",
    YB: "yottabytes",
    KiB: "kibibytes",
    MiB: "mebibytes",
    GiB: "gibibytes",
    TiB: "tebibytes",
    PiB: "pebibytes",
    EiB: "exbibytes",
    ZiB: "zebibytes",
    YiB: "yobibytes"
  }
};


const UnitConverter = () => {
  const [selectedMode, setSelectedMode] = useState('length');
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');

  const handleModeChange = (mode, defaultFrom, defaultTo) => {
    setSelectedMode(mode);
    setFromUnit(defaultFrom);
    setToUnit(defaultTo);
    setValue('');
  };

  const convert = (val, from, to, mode) => {
    if (mode === 'temperature') return convertTemperature(val, from, to);
    if (!val || isNaN(val)) return '';
    const inBase = parseFloat(val) * conversionData[mode][from];
    return inBase / conversionData[mode][to];
  };

  const convertTemperature = (val, from, to) => {
    let celsius;
    val = parseFloat(val);
    if (isNaN(val)) return '';
    switch (from) {
      case '°C': celsius = val; break;
      case '°F': celsius = (val - 32) * 5 / 9; break;
      case 'K': celsius = val - 273.15; break;
      case '°R': celsius = (val - 491.67) * 5 / 9; break;
      case '°Ré': celsius = val * 1.25; break;
      default: return '';
    }
    switch (to) {
      case '°C': return celsius;
      case '°F': return celsius * 9 / 5 + 32;
      case 'K': return celsius + 273.15;
      case '°R': return (celsius + 273.15) * 9 / 5;
      case '°Ré': return celsius * 0.8;
      default: return '';
    }
  };

  const units = Object.keys(conversionData[selectedMode] || {});
  const result = convert(value, fromUnit, toUnit, selectedMode);

  return (
    <div className="unit-converter">
      {/* Row 1: Physical dimensions */}
      <div className="tabs">
        <button onClick={() => handleModeChange('length', 'm', 'km')} className={selectedMode === 'length' ? 'active' : ''}>Length</button>
        <button onClick={() => handleModeChange('area', 'm²', 'km²')} className={selectedMode === 'area' ? 'active' : ''}>Area</button>
        <button onClick={() => handleModeChange('volume', 'm³', 'l')} className={selectedMode === 'volume' ? 'active' : ''}>Volume</button>
        <button onClick={() => handleModeChange('mass', 'g', 'kg')} className={selectedMode === 'mass' ? 'active' : ''}>Mass</button>
        <button onClick={() => handleModeChange('time', 's', 'min')} className={selectedMode === 'time' ? 'active' : ''}>Time</button>
        <button onClick={() => handleModeChange('speed', 'm/s', 'km/h')} className={selectedMode === 'speed' ? 'active' : ''}>Speed</button>
      </div>

      {/* Row 2: Abstract/scientific */}
      <div className="tabs">
        <button onClick={() => handleModeChange('energy', 'J', 'kWh')} className={selectedMode === 'energy' ? 'active' : ''}>Energy</button>
        <button onClick={() => handleModeChange('light', 'lx', 'lm/m2')} className={selectedMode === 'light' ? 'active' : ''}>Light</button>
        <button onClick={() => handleModeChange('temperature', '°C', 'K')} className={selectedMode === 'temperature' ? 'active' : ''}>Temperature</button>
        <button onClick={() => handleModeChange('pressure', 'Pa', 'psi')} className={selectedMode === 'pressure' ? 'active' : ''}>Pressure</button>
        <button onClick={() => handleModeChange('power', 'W', 'hp')} className={selectedMode === 'power' ? 'active' : ''}>Power</button>
      </div>

      {/* Row 3: Logical/data/count */}
      <div className="tabs">
        <button onClick={() => handleModeChange('count', 'szt', 'tuzin')} className={selectedMode === 'count' ? 'active' : ''}>Count</button>
        <button onClick={() => handleModeChange('data', 'b', 'B')} className={selectedMode === 'data' ? 'active' : ''}>Data</button>
      </div>

      {/* Shared converter form */}
      <div className="converter-form">
        <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter value" />
        <div className="unit-select">

          <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}>
            {units.map(u => (
              <option key={u} value={u} title={`${u} – ${unitLabels[selectedMode]?.[u] || ''}`}>
                {u} – {unitLabels[selectedMode]?.[u] || ''}
              </option>
            ))}
          </select>

          <span>&rarr;</span>

          <select value={toUnit} onChange={e => setToUnit(e.target.value)}>
            {units.map(u => (
              <option key={u} value={u} title={`${u} – ${unitLabels[selectedMode]?.[u] || ''}`}>
                {u} – {unitLabels[selectedMode]?.[u] || ''}
              </option>
            ))}
          </select>

        </div>
        <div className="result">{parseFloat(result || 0).toFixed(6)}</div>
      </div>
    </div>
  );
};

export default UnitConverter;