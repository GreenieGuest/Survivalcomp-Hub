import { randomChoice, randomInt } from "./utils";
import { isGameOver, getDefaultWinner } from "./modules";
import { useSimStore } from "../store/simulationStore";

export function initialize_BR(players, config) {
  // initialize game: all players added, random barrel position, # players printed
  return {
    turn: 0,
    // Sim fundamentals
    points: false,
    teams_game: false,
    castSize: players.length,
    config: config,
    barrel: randomInt(1,6),
    chance: 1,
    winner: null,
    currentlyPlaying: [...players],
    eliminated: [],
  };
}

export function FF_BR(state, playerList, config) { // repeat banRoulette until winner
  if (!state || state.winner) {
    if (playerList.length === 0) {
      return state; // prevent game breaking
    }
    state = initialize_BR(playerList, config);
  }
  let nextState = state;
  while (!nextState.winner) {
    if (nextState.currentlyPlaying.length === 0) { // prevent game breaking
      break;
    }
    nextState = banRoulette(nextState);
  }
  return nextState;
}

export function banRoulette(state) {

  // Every round... pick one random player to be eliminated.
  // (The most simple of survivalcomps)

  const { logEvent } = useSimStore.getState();

  // Default Finale Block
  if (isGameOver(state)) {
    return getDefaultWinner(state);
  }

  const chosen = randomChoice(state.currentlyPlaying);
  let roulette = randomInt(1,state.barrel);

  if (roulette == 1) {
    logEvent({
          type: "ban",
          chosen: chosen,
          chance: state.chance,
          survived: false,
          remaining: state.currentlyPlaying.length - 1
        })

    return {
      ...state,
      turn: state.turn + 1,
      barrel: randomInt(1,6),
      chance: 1,
      currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== chosen.id),
      eliminated: [...state.eliminated, chosen], // add to banned players
    };
  } else {
    logEvent({
          type: "ban",
          chosen: chosen,
          chance: state.chance,
          survived: true,
          remaining: state.currentlyPlaying.length
        })

    return {
      ...state,
      turn: state.turn + 1,
      chance: state.chance + 1,
      barrel: state.barrel - 1,
    };
  };

}