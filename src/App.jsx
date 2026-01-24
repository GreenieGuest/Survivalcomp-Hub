import { useState } from 'react'
import PlayerCard from "./components/PlayerCard.jsx";
import ProfileParser from "./components/ProfileParser.jsx";
import StillInTheRunning from "./components/StillInTheRunning.jsx";
import SimulationSelector from "./components/SimulationSelector.jsx";
import BanRouletteEvent from "./simulators/BanRouletteEvent.jsx";

import { startGame, nextTurn } from "./simulators/banroulette";
import {Accordion, Icon, Span, Text, Container, Flex, Heading, Button, VStack, Tabs, Link, createListCollection} from "@chakra-ui/react";
import { MdOutlinePeople } from "react-icons/md";
import { GrConfigure } from "react-icons/gr";
import { FaChartSimple } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu"
import './App.css'

function App() {
  const [playerList, setPlayerList] = useState([]);
  const [simulation, setSimulation] = useState("br");
  const [gameState, setGameState] = useState(null);

  const handleStartGame = () => {
    const initialState = startGame(playerList);
    setGameState(initialState);
  };

  const handleNextTurn = () => {
    setGameState(prev => nextTurn(prev));
  };

  const items = [
  { value: "players", title: `Player Profiles (${playerList.length})`, text: 
  <Container>
              <ProfileParser playerList={playerList} setPlayerList={setPlayerList} />
              <PlayerCard playerList={playerList} setPlayerList={setPlayerList} />
  </Container>
  , icon: <MdOutlinePeople /> },
  { value: "configuration", title: "Configuration", text: "To Be Implemented", icon: <GrConfigure /> },
  { value: "simulation", title: "Simulation", text:<Container>
    <SimulationSelector simulation={simulation} setSimulation={setSimulation} />
    <Text>This is a hub for managing survival competition simulations.</Text>
    <Text>You can add players, import profiles from JSON files, and simulate game turns to see who gets eliminated.</Text>
    <Text>The only simulation at the moment right now is Ban Roulette.</Text>
    </Container>, icon: <FaChartSimple /> },
  ]


  return (
    <Container pt={5} width={'auto'}>
      <Heading fontSize={'5xl'} padding="40px" color={'green'}>Survivalcomp Hub</Heading>
      <Text>A web app dedicated to the simulation of various competitions. Inspired by Brantsteele.</Text>
      <Link href="https://github.com/GreenieGuest/Survivalcomp-Hub">
        <FaGithub /> Github Repository <LuExternalLink />
      </Link>
      <Accordion.Root lazyMount unmountOnExit collapsible>
        {items.map((item, index) => (
          <Accordion.Item key={index} value={item.value}>
            <Accordion.ItemTrigger>
              <Icon fontSize="lg" color="fg.subtle">
                {item.icon}
              </Icon>
              <Span flex="1">{item.title}</Span>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>{item.text}</Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      
        <Flex mt={5} justifyContent={'center'}>
        <div>

        <Button variant={'outline'} colorPalette={'red'} onClick={() => setPlayerList([])}>Clear Players</Button>
        <Button variant={'outline'} colorPalette={'green'} onClick={handleStartGame}>Start Game</Button>
        <Button variant={'outline'} colorPalette={'yellow'} onClick={handleNextTurn} disabled={!gameState || gameState.winner}>Next Turn</Button>
        {gameState && <Tabs.Root lazyMount unmountOnExit defaultValue="tab-1" justify="center">
            <Tabs.List>
                <Tabs.Trigger value="tab-1">Description</Tabs.Trigger>
                <Tabs.Trigger value="tab-2">Still In The Running</Tabs.Trigger>
                <Tabs.Trigger value="tab-3">Elimination Order</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="tab-1">
               <Container>
                <Text>Each round, one player has a limited chance of remaining in the game, otherwise they are banned.</Text>
                </Container>
            </Tabs.Content>
            <Tabs.Content value="tab-2">
              <StillInTheRunning playerList={gameState.alivePlayers} />
            </Tabs.Content>
            <Tabs.Content value="tab-3">
                <VStack>
                  {[...gameState.bannedPlayers].reverse().map((player, index) => (
                    <div key={player.id}>
                      {gameState.alivePlayers.length + index + 1}. <span style={{color: player.color || "white"}}>{player.name}</span>
                    </div>
                  ))}
                </VStack>
            </Tabs.Content>
        </Tabs.Root>}
        
        {gameState && <Heading>Events</Heading>}
        {gameState && <BanRouletteEvent events={gameState.events} />}
        </div>
      </Flex>
    </Container>
  );
}

export default App;
