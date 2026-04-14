import { randomChoice, randomInt } from "./utils";

export function initialize_MI(players) {
  // Function called by the interface to create a simulation by importing player profiles (and in the future, configuration settings).
  // Contains fundamentals (turn, participants, winner)
  // Returns a state that will be modified as the simulation goes on.
  
  return {
    turn: 0,
    // Sim fundamentals
    points: false,
    teams: false,
    // Game fundamentals
    castSize: players.length,
    winner: null,
    currentlyPlaying: [...players],
    eliminated: [],
    //Sim-specific

    events: [
      {
        type: "system",
        message: "Game started with " + players.length + " players."
      }
    ]
  };
}

export function FF_MI(state, playerList) { // repeat murderIsland until winner
  if (!state || state.winner) {
    if (playerList.length === 0) {
      return state; // prevent game breaking
    }
    state = initialize_MI(playerList);
  }
  let nextState = state;
  while (!nextState.winner) {
    nextState = murderIsland(nextState);
  }
  return nextState;
}

export function murderIsland(state) {
  if (state.currentlyPlaying.length <= 1) {
    return {
      ...state,
      winner: state.currentlyPlaying[0] || null,
      events: [
        ...state.events,
        {
          type: "system",
          message: ((state.currentlyPlaying[0] ? state.currentlyPlaying[0].name : "No one") + " is the sole survivor of Murder Island."),
        }
      ]
    };
  }

    return {
        ...state,
        turn: state.turn + 1,
    };

}