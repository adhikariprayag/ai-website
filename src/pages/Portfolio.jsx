import React from 'react';
import Calculator from '../components/Calculator';
import TicTacToe from '../components/TicTacToe';
import '../components/Calculator.css'; // Ensure CSS is loaded
import '../components/TicTacToe.css'; // Ensure CSS is loaded

const Portfolio = () => {
    return (
        <div className="page-content animate-fade-in">
            <h1>My Work</h1>
            <div className="projects-grid" style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap' }}>
                <div className="project-card" style={{ background: 'transparent', boxShadow: 'none' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Calculator</h3>
                    <Calculator />
                </div>
                <div className="project-card" style={{ background: 'transparent', boxShadow: 'none' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Tic Tac Toe</h3>
                    <TicTacToe />
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
