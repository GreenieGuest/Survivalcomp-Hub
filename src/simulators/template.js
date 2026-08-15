import { randomChoice, randomInt } from "./utils";
import { isGameOver, getDefaultWinner } from "./modules";
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

// Default Fast-Forward Function (it wasn't easy getting this to work)
// Replace "MI" with a 2-character code of your choice
export function FF_MI(state, playerList, config) {
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
  if (isGameOver(state)) {
    return getDefaultWinner(state);
  }

  // DoYaThing here

  return {
      ...state,
      turn: state.turn + 1,
  };

}