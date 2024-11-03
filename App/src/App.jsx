import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const App = () => {
    const [name, setName] = useState('');
    const [roomID, setRoomID] = useState('');
    const [errorTextRoom, setErrorTextRoom] = useState('');
    const [errorTextLobby, setErrorTextLobby] = useState('');
    const [inRoom, setInRoom] = useState(false);
    const [results, setResults] = useState(false);
    const [won, setWon] = useState(false);
    const [mySymbol_, setMySymbol_] = useState('X');
    const [opponentJoined, setOpponentJoined] = useState(false);
    const [opponent, setOpponent] = useState('');
    const [values, setValues] = useState(Array(9).fill(''));
    const [gameSocket, setGameSocket] = useState(null);
    const [myTurn, setMyTurn] = useState(false);
    const [myScore, setMyScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const mySymbol = useRef('X');

    const onCellClick = (index) => {
        if (myTurn && values[index] === '') {
            setValues((prevValues) => prevValues.map((value, i) => i === index ? mySymbol.current : value));

            gameSocket.emit('move', { room_id: roomID, position: index, player: name });
            setMyTurn(false);
        }

    }

    const onCreateRoom = async () => {
        fetch(import.meta.env.VITE_SERVER_URL + '/create_room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setRoomID(data.room_id);
                    onJoinRoom(data.room_id);
                }
            })

    }

    const onJoinRoom = async (room_id) => {
        gameSocket.emit('join_room', { room_id: room_id, name });
        setErrorTextLobby('');
        setErrorTextRoom('');
    }

    const checkWinner = () => {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        winConditions.forEach(element => {
            const [a, b, c] = element;
            if (values[a] && values[a] === values[b] && values[a] === values[c]) {
                setResults(true);
                if (values[a] === mySymbol.current) {
                    setWon(true);
                } else {
                    setWon(false);
                }
                setMyTurn(false);
            }
        });
    }


    const onLeaveRoom = () => {
        gameSocket.emit('leave_room', { room_id: roomID });
        setInRoom(false);
        setOpponentJoined(false);
        setOpponent('');
        setValues(Array(9).fill(''));
    }

    const onPlayAgain = () => {
        gameSocket.emit('play_again', { room_id: roomID });
    }

    useEffect(() => {
        const socket = io(import.meta.env.VITE_SERVER_URL + '/game');
        setGameSocket(socket);

        socket.on('joined_room', (data) => {
            setInRoom(true);
            if (data.players.length != 0) {
                setOpponentJoined(true);
                setOpponent(data["players"][0]);
            }

        })

        socket.on('player_joined', (data) => {
            setOpponentJoined(true);
            setOpponent(data.name);
        })

        socket.on('no_room', () => {
            setErrorTextLobby('Room not found');
        })

        socket.on('room_full', () => {
            setErrorTextLobby('Room is full');
        })

        socket.on('opponent_left', () => {
            setOpponentJoined(false);
            setOpponent('');
        })

        socket.on('game_start', (data) => {
            console.log(data)
            mySymbol.current = data.role
            setMySymbol_(data.role);
            setMyTurn(data.role === 'X');
        })

        socket.on('move_made', (data) => {
            setValues((prevValues) => prevValues.map((value, i) => i === data.position ? (mySymbol.current === 'X' ? 'O' : 'X') : value));

            setMyTurn(true);
        })

        

        socket.on('reset', () => {
            setResults(false);
            setValues(Array(9).fill(''));

            if (mySymbol.current === 'X') {
                mySymbol.current = 'O';
                setMySymbol_('O');
                setMyTurn(false);
            } else {
                mySymbol.current = 'X';
                setMySymbol_('X');
                setMyTurn(true);
            }
        })

        return () => {
            socket.disconnect();
        }
    }, [])

    useEffect(() => {
        if (inRoom) {
            gameSocket.on('game_over', (data) => {
                setResults(true);
                if (data.winner === name) {
                    setWon(true);
                    setMyScore(prevState => prevState + 1);
                } else {
                    setWon(false);
                    setOpponentScore(prevState => prevState + 1);
                }
            })
            
        }
    }, [inRoom])

    useEffect(() => {
        checkWinner(values);
    }, [values])






    return (
        <div className='main-container'>
            <div className='content-container'>
                <div className='heading-container'>
                    <h1>Tac Toe Tic</h1>
                </div>
                <div className='data-container'>
                    {
                        !inRoom ? (
                            <div className='not-in-room-container'>
                                <input type='text' className='name-input' placeholder='Enter your name' value={name} onChange={(e) => setName(e.target.value.trim())} />
                                <div className='join-room-container'>
                                    <input type='text' className='room-id-input' placeholder='Enter room ID' value={roomID} onChange={(e) => setRoomID(e.target.value.toUpperCase())} />
                                    <button
                                        disabled={!name || !roomID}
                                        className='btns join-btn'
                                        onClick={() => onJoinRoom(roomID)}
                                    >Join</button>
                                </div>
                                <span className='or-text'>- or -</span>

                                <button
                                    disabled={!name}
                                    className='btns create-btn'
                                    onClick={onCreateRoom}>Create Room
                                </button>

                                <span className='error-text'>{errorTextLobby}</span>

                            </div>
                        ) : (
                            <div className='in-room-container'>
                                <h3 className='player-detail'>Room ID: {roomID}</h3>
                                <h3 className='player-detail'>You: {name} ({myScore} Points)</h3>
                                {
                                    opponentJoined ? (
                                        <h3 className='player-detail'>Opponent: {opponent} ({opponentScore} Points)</h3>
                                    ) : (
                                        <h4 className='opponent-detail'>Waiting for opponent...</h4>
                                    )
                                }


                                <button
                                    className='btns leave-btn'
                                    onClick={onLeaveRoom}
                                >
                                    Leave Room
                                </button>
                                <h3>You are {mySymbol_}</h3>

                                {
                                    opponentJoined ? (

                                        myTurn ? (
                                            <h3 className='player-detail' style={{ color: 'green' }}>Your Turn</h3>
                                        ) : (
                                            <h3 className='player-detail' style={{ color: 'red' }}>Opponent's Turn</h3>
                                        )

                                    ) : (
                                        <div />
                                    )
                                }
                            </div>
                        )

                    }

                </div>
                <span className='error-text'>{errorTextRoom}</span>

                {
                    inRoom && (
                        <>
                            <div className='game-container'>
                                <table border={1} cellSpacing={0}>
                                    <tr>
                                        <td className='cell'>
                                            <button
                                                disabled={!myTurn}
                                                className='cell-btn'
                                                onClick={() => onCellClick(0)}
                                            >
                                                {values[0]}
                                            </button>
                                        </td>
                                        <td className='cell'>
                                            <button
                                                disabled={!myTurn}
                                                className='cell-btn'
                                                onClick={() => onCellClick(1)}
                                            >
                                                {values[1]}
                                            </button>
                                        </td>
                                        <td className='cell'>
                                            <button
                                                disabled={!myTurn}
                                                className='cell-btn'
                                                onClick={() => onCellClick(2)}
                                            >
                                                {values[2]}
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='cell'>
                                            <button
                                                disabled={!myTurn}
                                                className='cell-btn'
                                                onClick={() => onCellClick(3)}
                                            >
                                                {values[3]}
                                            </button>
                                        </td>
                                        <td className='cell'>
                                            <button
                                                disabled={!myTurn}
                                                className='cell-btn'
                                                onClick={() => onCellClick(4)}
                                            >
                                                {values[4]}
                                            </button>
                                        </td>
                                        <td className='cell'>
                                            <button
                                                disabled={!myTurn}
                                                className='cell-btn'
                                                onClick={() => onCellClick(5)}
                                            >
                                                {values[5]}
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='cell'>
                                            <button
                                                disabled={!myTurn}
                                                className='cell-btn'
                                                onClick={() => onCellClick(6)}
                                            >
                                                {values[6]}
                                            </button>
                                        </td>
                                        <td className='cell'>
                                            <button
                                                disabled={!myTurn}
                                                className='cell-btn'
                                                onClick={() => onCellClick(7)}
                                            >
                                                {values[7]}
                                            </button>
                                        </td>
                                        <td className='cell'>
                                            <button
                                                disabled={!myTurn}
                                                className='cell-btn'
                                                onClick={() => onCellClick(8)}
                                            >
                                                {values[8]}
                                            </button>
                                        </td>
                                    </tr>
                                </table>

                            </div>
                            <div className='results-container'>
                                {
                                    results && (
                                        <div className='results'>
                                            {
                                                won ? (
                                                    <h3 className='result-text won'>You Won!</h3>
                                                ) : (
                                                    <h3 className='result-text lost'>You Lost!</h3>
                                                )
                                            }
                                            <button
                                                className='btns play-again-btn'
                                                onClick={onPlayAgain}
                                            >
                                                Play Again
                                            </button>

                                        </div>
                                    )
                                }
                            </div>
                        </>

                    )
                }


            </div>

        </div>
    )
}

export default App;