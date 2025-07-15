import React, { useState, useEffect } from 'react';
import './Calculator.css';

function infixToRPN(expr) {
  const out = [];
  const ops = [];
  const precedence = { '+':1, '-':1, '*':2, '/':2 };
  expr.match(/(\d+(\.\d+)?)|[+\-*/()]|\s+/g).forEach(token => {
    if (/^\s+$/.test(token)) return;
    if (!isNaN(token)) out.push(token);
    else if (/[+\-*/]/.test(token)) {
      while (ops.length && /[+\-*/]/.test(ops.at(-1)) &&
             precedence[ops.at(-1)] >= precedence[token]) {
        out.push(ops.pop());
      }
      ops.push(token);
    } else if (token === '(') ops.push(token);
    else if (token === ')') {
      while (ops.length && ops.at(-1) !== '(') out.push(ops.pop());
      ops.pop();
    }
  });
  while (ops.length) out.push(ops.pop());
  return out;
}


function evalRPN(tokens) {
  const st = [];
  tokens.forEach(tok => {
    if (!isNaN(tok)) st.push(parseFloat(tok));
    else {
      const b = st.pop(), a = st.pop();
      switch (tok) {
        case '+': st.push(a + b); break;
        case '-': st.push(a - b); break;
        case '*': st.push(a * b); break;
        case '/': st.push(a / b); break;
      }
    }
  });
  return st.at(-1) ?? 0;
}


export default function Calculator() {
  const [expr, setExpr] = useState('');
  const [rpn, setRpn] = useState([]);
  const [result, setResult] = useState(0);

  const handleClick = v => setExpr(prev => prev + v);
  const handleDelete = () => setExpr(e => e.slice(0, -1));
  const handleClear = () => { setExpr(''); setRpn([]); setResult(0); };

  useEffect(() => {
    try {
      const tokens = infixToRPN(expr);
      setRpn(tokens);
      setResult(evalRPN(tokens));
    } catch {
      setResult(NaN);
    }
  }, [expr]);

  return (
    <div className="calculator-container">
      <div className="display history-display">{expr || '0'}</div>
      <div className="display result-display">{isNaN(result) ? ' ' : result}</div>
      <div className="keypad">
        <button onClick={handleDelete}>⌫</button><button onClick={handleClear}>AC</button>
        <button onClick={() => handleClick('(')}>(</button><button onClick={() => handleClick(')')}>)</button>

        {'789/'.split('').map(v => <button key={v} onClick={() => handleClick(v)}>{v}</button>)}
        {'456*'.split('').map(v => <button key={v} onClick={() => handleClick(v)}>{v}</button>)}
        {'123-'.split('').map(v => <button key={v} onClick={() => handleClick(v)}>{v}</button>)}
        <button className="wide" onClick={() => handleClick('0')}>0</button>
        <button onClick={() => handleClick('.')}>.</button>
        <button onClick={() => handleClick('+')}>+</button>
      </div>
    </div>
  );
}
