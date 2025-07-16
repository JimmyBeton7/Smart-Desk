import React, { useState, useEffect } from 'react';
import './Calculator.css';

export default function Calculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [angleMode, setAngleMode] = useState('DEG');

  const toRad = x => angleMode === 'DEG' ? x * Math.PI / 180 : x;
  const fromRad = x => angleMode === 'DEG' ? x * 180 / Math.PI : x;

  const factorial = n => {
    if (n < 0 || n % 1 !== 0) return NaN;
    return n <= 1 ? 1 : n * factorial(n - 1);
  };

  const getUnaryFunctions = () => ({
    '√': Math.sqrt,
    'x²': x => x ** 2,
    'exp': Math.exp,
    'ln': Math.log,
    'log': Math.log10,
    '10^': x => 10 ** x,
    'x!': factorial,
    'sin': x => Math.sin(toRad(x)),
    'cos': x => Math.cos(toRad(x)),
    'tan': x => Math.tan(toRad(x)),
    'asin': x => fromRad(Math.asin(x)),
    'acos': x => fromRad(Math.acos(x)),
    'atan': x => fromRad(Math.atan(x))
  });

  const operators = {
    '+': { precedence: 1, assoc: 'L', func: (a, b) => a + b },
    '-': { precedence: 1, assoc: 'L', func: (a, b) => a - b },
    '*': { precedence: 2, assoc: 'L', func: (a, b) => a * b },
    '/': { precedence: 2, assoc: 'L', func: (a, b) => a / b },
    '%': { precedence: 2, assoc: 'L', func: (a, b) => a % b },
    '^': { precedence: 3, assoc: 'R', func: (a, b) => Math.pow(a, b) }
  };

  const tokenize = expr =>
    expr.match(/π|e|\d+(\.\d+)?|[+\-*/^%()]|√|x²|log|ln|exp|x!|10\^|sin|cos|tan|asin|acos|atan|\w+/g) || [];

  const infixToRPN = (tokens) => {
    const output = [];
    const stack = [];
    const unary = getUnaryFunctions();

    for (const token of tokens) {
      if (!isNaN(token)) {
        output.push(token);
      } else if (token === 'π') {
        output.push(Math.PI);
      } else if (token === 'e') {
        output.push(Math.E);
      } else if (token in unary) {
        stack.push(token);
      } else if (token in operators) {
        while (
          stack.length &&
          stack.at(-1) in operators &&
          (
            (operators[token].assoc === 'L' && operators[token].precedence <= operators[stack.at(-1)].precedence) ||
            (operators[token].assoc === 'R' && operators[token].precedence < operators[stack.at(-1)].precedence)
          )
        ) {
          output.push(stack.pop());
        }
        stack.push(token);
      } else if (token === '(') {
        stack.push(token);
      } else if (token === ')') {
        while (stack.length && stack.at(-1) !== '(') {
          output.push(stack.pop());
        }
        stack.pop(); // remove '('
        if (stack.length && stack.at(-1) in unary) {
          output.push(stack.pop());
        }
      }
    }

    while (stack.length) {
      output.push(stack.pop());
    }

    return output;
  };

  const evalRPN = (tokens) => {
    const stack = [];
    const unary = getUnaryFunctions();

    for (const tok of tokens) {
      if (!isNaN(tok)) {
        stack.push(parseFloat(tok));
      } else if (tok in unary) {
        const val = stack.pop();
        stack.push(unary[tok](val));
      } else if (tok in operators) {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(operators[tok].func(a, b));
      }
    }

    return stack.length ? stack.at(-1) : 0;
  };

  const extractLastOperand = (str) => {
    const match = str.match(/(?:\([^)]+\)|\d+(\.\d+)?|π|e|[a-z]+(?:\([^)]+\))?)$/);
    return match ? match[0] : '';
  };

  const wrapLastExpressionWith = (func) => {
    const last = extractLastOperand(expr);
    if (!last) return;
    const before = expr.slice(0, expr.length - last.length);
    setExpr(before + func + '(' + last + ')');
  };

  const handleClick = (v) => {
    if (v === 'C') return setExpr('');
    if (v === '⌫') return setExpr(e => e.slice(0, -1));
    if (v === '=') return;

    if (v === 'π' || v === 'e') return setExpr(e => e + v);

    if (v === 'x²' || v === 'x!') return wrapLastExpressionWith(v);

    if (getUnaryFunctions()[v]) {
      setExpr(e => e + v + '(');
    } else {
      setExpr(e => e + v);
    }
  };

  useEffect(() => {
    try {
      const tokens = tokenize(expr);
      const rpn = infixToRPN(tokens);
      const val = evalRPN(rpn);
      setResult(isNaN(val) ? 'Error' : val.toString());
    } catch {
      setResult('Error');
    }
  }, [expr, angleMode]);

  const buttons = [
    ['⌫', 'π', 'e', 'C'],
    ['x²', '√', 'exp', 'x!'],
    ['sin', 'cos', 'tan', '/'],
    ['asin', 'acos', 'atan', '*'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '^'],
    ['0', '.', '(', ')'],
    ['10^', 'log', 'ln', '=']
  ];

  return (
    <div className="calculator-container">
      <div className="angle-mode">
        <button onClick={() => setAngleMode(m => m === 'DEG' ? 'RAD' : 'DEG')}>
          {angleMode}
        </button>
      </div>
      <div className="display history-display">{expr || '0'}</div>
      <div className="display result-display">{result}</div>
      <div className="keypad">
        {buttons.flat().map((b, i) => (
          <button key={i} onClick={() => handleClick(b)}>{b}</button>
        ))}
      </div>
    </div>
  );
}
