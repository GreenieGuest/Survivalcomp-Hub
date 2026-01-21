import { useState } from 'react'
import PlayerCard from "./components/PlayerCard.jsx";
import ProfileParser from "./components/ProfileParser.jsx";
import StillInTheRunning from "./components/StillInTheRunning.jsx";
import BanRouletteEvent from "./simulators/BanRouletteEvent.jsx";
import { startGame, nextTurn } from "./simulators/banroulette";
import {Container, Flex, Heading, Button, VStack, Tabs} from "@chakra-ui/react";
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

        <Tabs.Root lazyMount unmountOnExit defaultValue="tab-1" justify="center">
            <Tabs.List>
                <Tabs.Trigger value="tab-1">Description</Tabs.Trigger>
                <Tabs.Trigger value="tab-2">Players</Tabs.Trigger>
                <Tabs.Trigger value="tab-3">Still In The Running</Tabs.Trigger>
                <Tabs.Trigger value="tab-4">Elimination Order</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="tab-1">
                This is a hub for managing survival competition simulations. You can add players, import profiles from JSON files, and simulate game turns to see who gets eliminated.
                The only simulation at the moment right now is Ban Roulette.
            </Tabs.Content>
            <Tabs.Content value="tab-2">
              <ProfileParser playerList={playerList} setPlayerList={setPlayerList} />
              <PlayerCard playerList={playerList} setPlayerList={setPlayerList} />
            </Tabs.Content>
            <Tabs.Content value="tab-3">
              {gameState && <StillInTheRunning playerList={gameState.alivePlayers} />}
            </Tabs.Content>
            <Tabs.Content value="tab-4">
              {gameState && 
                <VStack>
                  {[...gameState.bannedPlayers].reverse().map((player, index) => (
                    <div key={player.id}>
                      {gameState.alivePlayers.length + index + 1}. <span style={{color: player.color || "white"}}>{player.name}</span>
                    </div>
                  ))}
                </VStack>
              }
            </Tabs.Content>
        </Tabs.Root>

              <Button variant={'outline'} colorPalette={'red'} onClick={() => setPlayerList([])}>Clear Players</Button>
        <Button variant={'outline'} colorPalette={'green'} onClick={handleStartGame}>Start Game</Button>
        <Button variant={'outline'} colorPalette={'yellow'} onClick={handleNextTurn} disabled={!gameState}>Next Turn</Button>

        {gameState && <p>{gameState.lastEvent}</p>}
        {gameState && <BanRouletteEvent events={gameState.events} />}
        </div>
      </Flex>
    </Container>
  );
}

export default App;
