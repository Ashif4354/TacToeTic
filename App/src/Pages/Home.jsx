import {useState, useEffect} from 'react';

const Home = () => {
    const [name, setName] = useState('');
    const [roomID, setRoomID] = useState('');

    return(
        <div className='main-container'>
            <div className='content-container'>
                <header>
                    <h1>Tic Tac toe</h1>
                </header>
            </div>

        </div>
    )
}

export default Home;