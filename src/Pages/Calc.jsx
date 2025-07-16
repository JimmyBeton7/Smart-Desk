import React from 'react';
import Calculator from '../Components/Calculator';
import UnitConverter from '../Components/UnitConverter';
import DrawChart from '../Components/DrawChart';
import './Calc.css';

export default function Calc() {
  return (
    <main className="calculator-layout">
      <section className="top-row">
        <div className="left-column">
          <Calculator />
        </div>
        <div className="right-column">
          <div className="top-half">
            <UnitConverter />
          </div>
          <div className="bottom-half">
            <DrawChart />
          </div>
        </div>
      </section>
    </main>
  );
}
