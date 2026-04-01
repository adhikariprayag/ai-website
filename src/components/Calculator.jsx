import React, { useState, useEffect } from 'react';
import './Calculator.css';

const Calculator = () => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const handleNumber = (number) => {
        if (display === '0') {
            setDisplay(number);
        } else {
            setDisplay(display + number);
        }
    };

    const handleOperator = (operator) => {
        setEquation(display + ' ' + operator + ' ');
        setDisplay('0');
    };

    const handleEqual = () => {
        try {
            // eslint-disable-next-line no-eval
            const result = eval(equation + display);
            setDisplay(String(result));
            setEquation('');
        } catch (error) {
            setDisplay('Error');
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
    };

    const handleDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const processExpression = (expr) => {
        try {
            // eslint-disable-next-line no-eval
            const res = eval(expr);
            setDisplay(String(res));
            setEquation(expr + ' = ');
        } catch(err) {
            setDisplay('Error');
        }
    };

    useEffect(() => {
        const pendingAction = sessionStorage.getItem('ai_action');
        if (pendingAction) {
            try {
                const action = JSON.parse(pendingAction);
                if (action.type === 'ai_calculate_math') {
                    sessionStorage.removeItem('ai_action');
                    setTimeout(() => processExpression(action.detail), 500);
                }
            } catch(e) {}
        }
    }, []);

    useEffect(() => {
        const handleAiCalc = (e) => processExpression(e.detail);
        window.addEventListener('ai_calculate_math', handleAiCalc);
        return () => window.removeEventListener('ai_calculate_math', handleAiCalc);
    });

    return (
        <div className="calculator">
            <div className="display">{display}</div>
            <div className="keypad">
                <button className="clear" onClick={handleClear}>C</button>
                <button onClick={() => handleOperator('/')} className="operator">÷</button>
                <button onClick={() => handleOperator('*')} className="operator">×</button>

                <button onClick={() => handleNumber('7')}>7</button>
                <button onClick={() => handleNumber('8')}>8</button>
                <button onClick={() => handleNumber('9')}>9</button>
                <button onClick={() => handleOperator('-')} className="operator">-</button>

                <button onClick={() => handleNumber('4')}>4</button>
                <button onClick={() => handleNumber('5')}>5</button>
                <button onClick={() => handleNumber('6')}>6</button>
                <button onClick={() => handleOperator('+')} className="operator">+</button>

                <button onClick={() => handleNumber('1')}>1</button>
                <button onClick={() => handleNumber('2')}>2</button>
                <button onClick={() => handleNumber('3')}>3</button>
                <button onClick={() => handleEqual()} className="equals">=</button>

                <button onClick={() => handleNumber('0')} style={{ gridColumn: 'span 2' }}>0</button>
                <button onClick={handleDecimal}>.</button>
            </div>
        </div>
    );
};

export default Calculator;
