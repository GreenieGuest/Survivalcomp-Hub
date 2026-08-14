import { randomChoice, randomInt } from "./utils";
import { useSimStore } from "../store/simulationStore";

export function initialize_MI(players, config) {
  // Function called by the interface to create a simulation by importing player profiles (and in the future, configuration settings).
  // Contains fundamentals (turn, participants, winner)
  // Returns a state that will be modified as the simulation goes on.
  
  return {
    turn: 0,
    // Sim fundamentals
    points: false,
    teams_game: false,
    // Game fundamentals
    castSize: players.length,
    config: config,
    winner: null,
    currentlyPlaying: [...players],
    eliminated: [],
    //Sim-specific
  };
}

export function FF_MI(state, playerList, config) { // repeat murderIsland until winner
  if (!state || state.winner) {
    if (playerList.length === 0) {
      return state; // prevent game breaking
    }
    state = initialize_MI(playerList, config);
  }
  let nextState = state;
  while (!nextState.winner) {
    nextState = murderIsland(nextState);
  }
  return nextState;
}

export function murderIsland(state) {
  // Game format / summary goes here
  const { logEvent, clearEvents } = useSimStore.getState();

  // Default Finale Block
  if (state.currentlyPlaying.length <= 1) {
      const soleSurvivor = state.currentlyPlaying.length === 0
        ? state.eliminated[state.eliminated.length - 1] // last eliminated player wins by default
        : state.currentlyPlaying[0];

      logEvent({ type: 'header', label: 'Winner' })
      logEvent({ type: 'system', message: `${soleSurvivor?.name ?? 'No one'} wins! Press 'Start Game' to simulate again.` })

      return {
      ...state,
      winner: soleSurvivor || null,
      currentlyPlaying: [],
      eliminated: (soleSurvivor ? [...state.eliminated, soleSurvivor] : state.eliminated), // Even winners must be eliminated... (for the leaderboards)
    };
  }

  return {
      ...state,
      turn: state.turn + 1,
  };

}