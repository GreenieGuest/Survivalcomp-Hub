import { useState, useEffect } from 'react'
import PlayerCard from "./components/PlayerCard.jsx";
import ProfileParser from "./components/ProfileParser.jsx";
import { SimulationSelector, MetricSelector } from "./components/Dropdowns.jsx";
import AppHeader from "./components/AppHeader.jsx";
import SimTabs from "./components/SimTabs.jsx";
import Config from "./components/Config.jsx";

import { StatsTable, StatsChart } from "./components/StatsComponents.jsx";
import EventLog from "./simulators/EventLog.jsx";

import { FF_BR, initialize_BR, banRoulette } from "./simulators/banroulette";
import { FF_AS, initialize_AS, algicosathlon } from "./simulators/algicosathlon";
import { FF_MI, initialize_MI, murderIsland } from "./simulators/murderisland";
import { FF_SV, initialize_SV, survivor } from "./simulators/64ditp";

import {Accordion, Icon, Span, Container, Flex, Heading, Button} from "@chakra-ui/react";

// Icons
import { MdOutlinePeople } from "react-icons/md";
import { GrConfigure } from "react-icons/gr";
import { FaChartSimple } from "react-icons/fa6";
import { FaFastForward } from "react-icons/fa";
import './App.css'
import { useSimStore } from "./store/simulationStore";

import default_config from "./constants/defaultConfig.js";

function App() {
  const { playerList = [], setPlayerList, playerStats, simCount, setConfig, clearStats, applyGameResults, clearEvents } = useSimStore()
  const storedConfig = useSimStore(state => state.config);

  const [simulation, setSimulation] = useState(null);
  const [runningSim, setRunningSim] = useState(null); // running sim may be different if user messes around
  const [gameState, setGameState] = useState(null);
  const config = storedConfig ?? default_config;
  
  const [statMetric, setStatMetric] = useState('avgPlacement');

  console.log("Current gameState:", gameState); // Debug log to check gameState

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
  mi: { // Murder Island
    initialize: initialize_MI,
    nextTurn: murderIsland,
    fastForward: FF_MI,
  },
  sv: { // Primitive Survivor
    initialize: initialize_SV,
    nextTurn: survivor,
    fastForward: FF_SV,
  },
  // Board Game Insanity
  // etc
};

  //Initialize every sim based on needs and types (points, teams, etc)
  const handleStartGame = () => {
    const sim = simulations[simulation];
    if (!sim) return;

    setRunningSim(simulation);
    setGameState(sim.initialize(playerList, config));
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

    setGameState(sim.fastForward(gameState, playerList, config));
  };

  useEffect(() => {
    console.log(gameState?.turn)
    if (!gameState?.winner) return;
    applyGameResults(gameState);
    clearEvents();
  }, [gameState, applyGameResults]);


  //Collapsible sections for main app
  const items = [
  { value: "players", title: `Player Profiles (${playerList.length})`, text: 
    <Container>
      <ProfileParser />
      <PlayerCard />
    </Container>
  , icon: <MdOutlinePeople /> },
  { value: "configuration", title: "Configuration", text: <Config config={config} setConfig={setConfig} />, icon: <GrConfigure /> },
  { value: "stats", title: `Stats (from ${simCount} sims)`, text:<Container>
      <MetricSelector statMetric={statMetric} setStatMetric={setStatMetric} />
      <StatsTable playerStatsList={playerStats} sortByMetric={statMetric} />
      <StatsChart playerStatsList={playerStats} sortByMetric={statMetric} />
    </Container>, icon: <FaChartSimple /> },
  ]

  return (
    <Container pt={5} width={'auto'}>
      <AppHeader />
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
        {gameState && <SimTabs gameState={gameState} />}
        
        {gameState && <Heading>Events</Heading>}
        {gameState && <EventLog gameState={gameState} />}
    </Container>
  );
}

export default App;
