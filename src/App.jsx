import { useState } from 'react'
import PlayerCard from "./components/PlayerCard.jsx";
import ProfileParser from "./components/ProfileParser.jsx";
import { startGame, nextTurn } from "./simulators/banroulette";
import {Container, Flex, Heading, Button, VStack} from "@chakra-ui/react";
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
    <Container pt={5} width={'auto'}>
      <Flex pb={5} justifyContent={"center"}>
        <Heading fontSize={'5xl'} color={'green'}>Survivalcomp Hub</Heading>
        </Flex>
        <VStack>
        </VStack>
        <Flex mt={5} justifyContent={'center'}>
        <div>

        <PlayerCard playerList={playerList} setPlayerList={setPlayerList} />
        <ProfileParser playerList={playerList} setPlayerList={setPlayerList} />
        <Button variant={'outline'} colorPalette={'red'} onClick={() => setPlayerList([])}>Clear</Button>

        <Button variant={'outline'} colorPalette={'green'} onClick={handleStartGame}>Start Game</Button>
        <Button variant={'outline'} colorPalette={'yellow'} onClick={handleNextTurn} disabled={!gameState}>Next Turn</Button>

        {gameState && <p>{gameState.lastEvent}</p>}
        </div>
      </Flex>
    </Container>
  );
}

export default App;
