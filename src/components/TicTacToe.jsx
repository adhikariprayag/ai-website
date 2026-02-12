import React, { useState } from 'react';
import './TicTacToe.css';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);

    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleClick = (i) => {
        if (calculateWinner(board) || board[i]) return;

        const newBoard = [...board];
        newBoard[i] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);
        setXIsNext(!xIsNext);
    };

    const winner = calculateWinner(board);
    const isDraw = !winner && board.every(Boolean);

    let status;
    if (winner) {
        status = `Winner: ${winner}`;
    } else if (isDraw) {
        status = "Draw!";
    } else {
        status = `Next player: ${xIsNext ? 'X' : 'O'}`;
    }

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
    };

    return (
        <div className="tictactoe">
            <div className="status">{status}</div>
            <div className="board">
                {board.map((square, i) => (
                    <button
                        key={i}
                        className={`square ${square ? square.toLowerCase() : ''}`}
                        onClick={() => handleClick(i)}
                    >
                        {square}
                    </button>
                ))}
            </div>
            <button className="reset-btn" onClick={resetGame}>Reset Game</button>
        </div>
    );
};

export default TicTacToe;
