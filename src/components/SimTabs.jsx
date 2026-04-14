import { Container, Text, VStack, Tabs } from "@chakra-ui/react";
import StillInTheRunning from "./StillInTheRunning.jsx";
import { LeaderboardsDisplay } from "./PointsLeaderboard.jsx";
import PlacementGains from "./PlacementGains.jsx";
import { FaHome } from "react-icons/fa";

const SimTabs = ({gameState}) => {
    return (
        <Tabs.Root lazyMount unmountOnExit defaultValue="tab-1" justify="center" size="sm" mt={5}>
            <Tabs.List>
                <Tabs.Trigger value="tab-1"><FaHome /></Tabs.Trigger>
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
              <LeaderboardsDisplay playerList={gameState.currentlyPlaying} eliminatedList={gameState.eliminated} />
            </Tabs.Content>
        </Tabs.Root>
    )
}
export default SimTabs;