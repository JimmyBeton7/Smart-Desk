import React from 'react';
import Calculator from '../Components/Calculator';
import UnitConverter from '../Components/UnitConverter';
import './Calc.css'; 

export default function Calc() {
  return (
    <main className="calculator-layout">
      <section className="top-row">
        <div className="left-column">
          <Calculator />
        </div>
        <div className="right-column">
          <UnitConverter />
        </div>
      </section>

      <section className="bottom-row">
        <div className="placeholder-box">Placeholder for future tools</div>
      </section>
    </main>
  );
}
