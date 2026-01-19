import { useState } from 'react'
import PlayerCard from "./components/PlayerCard.jsx";
import ProfileParser from "./components/ProfileParser.jsx";
import { startGame, nextTurn } from "./simulators/banroulette";
import './App.css'

function App() {
  const [playerList, setPlayerList] = useState([]);
  const [gameState, setGameState] = useState(null);

  const handleStartGame = () => {
    const initialState = startGame(playerList);
    setGameState(initialState);
  };

  const handleNextTurn = () => {
    setGameState(prev => nextTurn(prev));
  };

  return (
    <div>
      <h1>Survivalcomp Hub (Only Ban Roulette for now)</h1>

      <PlayerCard playerList={playerList} setPlayerList={setPlayerList} />
      <ProfileParser playerList={playerList} setPlayerList={setPlayerList} />

      <button onClick={handleStartGame}>Start Game</button>
      <button onClick={handleNextTurn} disabled={!gameState}>
        Next Turn
      </button>

      {gameState && <p>{gameState.lastEvent}</p>}
    </div>
  );
}

export default App;
