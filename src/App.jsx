import { useState, useEffect } from 'react'
import PlayerCard from "./components/PlayerCard.jsx";
import ProfileParser from "./components/ProfileParser.jsx";
import StillInTheRunning from "./components/StillInTheRunning.jsx";
import SimulationSelector from "./components/SimulationSelector.jsx";
import PointsLeaderboard from "./components/PointsLeaderboard.jsx";
import PlacementGains from "./components/PlacementGains.jsx";
import StatsTable from "./components/StatsTable.jsx";
import EventLog from "./simulators/EventLog.jsx";

import { FF_BR, initialize_BR, banRoulette } from "./simulators/banroulette";
import { FF_AS, initialize_AS, algicosathlon } from "./simulators/algicosathlon";

import {Accordion, Icon, Span, Text, Container, Flex, Heading, Button, VStack, Tabs, Link} from "@chakra-ui/react";

// Icons
import { MdOutlinePeople } from "react-icons/md";
import { GrConfigure } from "react-icons/gr";
import { FaChartSimple } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu"
import { FaFastForward } from "react-icons/fa";
import './App.css'

function App() {
  const [playerList, setPlayerList] = useState([]);
  const [playerStats, setPlayerStats] = useState({}); // Future use for storing player stats across simulations
  const [simCount, setSimCount] = useState(0);

  const [simulation, setSimulation] = useState(null);
  const [runningSim, setRunningSim] = useState(null); // running sim may be different if user messes around
  const [gameState, setGameState] = useState(null);

  const simulations = { // Each function for each simulation
  br: { // Ban Roulette
    initialize: initialize_BR,
    nextTurn: banRoulette,
    fastForward: FF_BR,
  },
  as: { // Algicosathlon
    initialize: initialize_AS,
    nextTurn: algicosathlon,
    fastForward: FF_AS,
  },
  // Board Game Insanity
  // Survivor
  // etc
};

  //Initialize every sim based on needs and types (points, teams, etc)
  const handleStartGame = () => {
    const sim = simulations[simulation];
    if (!sim) return;

    setRunningSim(simulation);
    setGameState(sim.initialize(playerList));
  };

  //Handles next turn based on running simulation
  const handleNextTurn = () => {
    const sim = simulations[runningSim];
    if (!sim) return;

    setGameState(sim.nextTurn(gameState));
  };

  //Handles fast forward based on running simulation
  const handleFastForward = () => {
    const sim = simulations[simulation];
    if (!sim) return;

    setGameState(sim.fastForward(gameState, playerList));
  };

  function applyGameResults(prevStats) {
    console.log("Provoked to apply game results to stats.");
    const newStats = { ...prevStats };
    // Update stats based on gameState
    gameState.eliminated.forEach((player, index) => {
      const prev = newStats[player.id] ?? {
        object: player,
        wins: 0,
        placements: [],
      };

      newStats[player.id] = {
        ...prev,
        placements: [...prev.placements, gameState.castSize - index],
      };
    });

    if (gameState.winner) {
      const winnerId = gameState.winner.id;
      const prev = newStats[winnerId] ?? {
        object: gameState.winner,
        wins: 0,
        placements: [],
      };

      newStats[winnerId] = {
        ...prev,
        placements: [...prev.placements, 1],
        wins: prev.wins + 1,
      };
    }
    const sims = simCount + 1;
    setSimCount(sims);

    return newStats;
  }

  function clearStats() {
    setPlayerStats({});
    setSimCount(0);
  }

  useEffect(() => {
    if (!gameState) return;

    if (!gameState.winner) return;

    setPlayerStats(prev =>
      applyGameResults(prev)
    );
  }, [gameState]);


  //Collapsible sections for main app
  const items = [
  { value: "players", title: `Player Profiles (${playerList.length})`, text: 
  <Container>
              <ProfileParser playerList={playerList} setPlayerList={setPlayerList} />
              <PlayerCard playerList={playerList} setPlayerList={setPlayerList} />
  </Container>
  , icon: <MdOutlinePeople /> },
  { value: "configuration", title: "Configuration", text: "To Be Implemented", icon: <GrConfigure /> },
  { value: "stats", title: `Stats (from ${simCount} sims)`, text:<Container>
              <StatsTable playerStatsList={playerStats} />
    </Container>, icon: <FaChartSimple /> },
  ]


  return (
    <Container pt={5} width={'auto'}>
      <Heading fontSize={'4xl'} padding="40px" color={'green'}>Survivalcomp Hub</Heading>
      <Text>A web app dedicated to the simulation of various survival competitions.</Text>
      <Text>You can add players, import profiles from JSON files, and simulate game turns to see who gets eliminated.</Text>
      <Text>Created by GreenieGuest, Inspired by BrantSteele</Text>
      <Link href="https://github.com/GreenieGuest/Survivalcomp-Hub">
        <FaGithub /> Github Repository <LuExternalLink />
      </Link>
      <Accordion.Root pb={5} lazyMount unmountOnExit collapsible>
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

        <SimulationSelector simulation={simulation} setSimulation={setSimulation} />
        <Flex mt={5} gap={1} justifyContent={'center'}>

        <Button variant={'outline'} colorPalette={'red'} onClick={clearStats}>Clear Data</Button>
        <Button variant={'outline'} colorPalette={'green'} onClick={handleStartGame} disabled={!simulation}>Start Game</Button>
        <Button variant={'outline'} colorPalette={'yellow'} onClick={handleNextTurn} disabled={!gameState || gameState.winner}>Next Turn</Button>
        <Button variant={'outline'} colorPalette={'purple'} onClick={handleFastForward} disabled={!simulation}><FaFastForward /></Button>
      </Flex>
              {gameState && <Tabs.Root lazyMount unmountOnExit defaultValue="tab-1" justify="center">
            <Tabs.List>
                <Tabs.Trigger value="tab-1">Description</Tabs.Trigger>
                <Tabs.Trigger value="tab-2">Still In The Running</Tabs.Trigger>
                {gameState && gameState.points == false && <Tabs.Trigger value="tab-3">Elimination Order</Tabs.Trigger>}
                {gameState && gameState.points == true && <Tabs.Trigger value="tab-4">Placements/Gains</Tabs.Trigger>}
                {gameState && gameState.points == true && <Tabs.Trigger value="tab-5">Leaderboard</Tabs.Trigger>}
            </Tabs.List>
            <Tabs.Content value="tab-1">
               <Container>
                <Text>Day {gameState.turn}</Text>
                </Container>
            </Tabs.Content>
            <Tabs.Content value="tab-2">
              <StillInTheRunning playerList={gameState.currentlyPlaying} />
            </Tabs.Content>
            <Tabs.Content value="tab-3">
                <VStack>
                  {[...gameState.eliminated].reverse().map((player, index) => (
                    <div key={player.id}>
                      {gameState.currentlyPlaying.length + index + 1}. <span style={{color: player.color || "white"}}>{player.name}</span>
                    </div>
                  ))}
                </VStack>
            </Tabs.Content>
            <Tabs.Content value="tab-4">
              <PlacementGains playerList={gameState.currentlyPlaying} lastEliminatedPlayer={gameState.eliminated[gameState.eliminated.length - 1]} />
            </Tabs.Content>
            <Tabs.Content value="tab-5">
              <PointsLeaderboard playerList={gameState.currentlyPlaying} eliminatedList={gameState.eliminated} />
            </Tabs.Content>
        </Tabs.Root>}
        
        {gameState && <Heading>Events</Heading>}
        {gameState && <EventLog events={gameState.events} />}
    </Container>
  );
}

export default App;
