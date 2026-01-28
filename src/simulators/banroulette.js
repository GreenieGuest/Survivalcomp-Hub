import { randomChoice, randomInt } from "./utils";

export function initialize_BR(players) {
  // initialize game: all players added, random barrel position, # players printed
  return {
    turn: 0,
    // Sim fundamentals
    points: false,
    teams: false,
    castSize: players.length,
    barrel: randomInt(1,6),
    chance: 1,
    winner: null,
    currentlyPlaying: [...players],
    eliminated: [],
    events: [
      {
        type: "system",
        message: "Game started with " + players.length + " players."
      }
    ]
  };
}

export function FF_BR(state, playerList) { // repeat banRoulette until winner
  if (!state || state.winner) {
    if (playerList.length === 0) {
      return state; // prevent game breaking
    }
    state = initialize_BR(playerList);
  }
  let nextState = state;
  while (!nextState.winner) {
    nextState = banRoulette(nextState);
  }
  return nextState;
}

export function banRoulette(state) {
  if (state.currentlyPlaying.length <= 1) {
    return {
      ...state,
      winner: state.currentlyPlaying[0] || null,
      events: [
        ...state.events,
        {
          type: "system",
          message: "Winner: " + ((state.currentlyPlaying[0] ? state.currentlyPlaying[0].name : "No one") + "! Press 'Start Game' to simulate again"),
        }
      ]
    };
  }

  // Every round... pick one random player to be eliminated.
  // (The most simple of survivalcomps)
  const chosen = randomChoice(state.currentlyPlaying);
  var roulette = randomInt(1,state.barrel);

  if (roulette == 1) {
    return {
      ...state,
      turn: state.turn + 1,
      barrel: randomInt(1,6),
      chance: 1,
      currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== chosen.id),
      eliminated: [...state.eliminated, chosen], // add to banned players
      events: [
        ...state.events,
        {
          type: "ban",
          chosen: chosen,
          chance: state.chance,
          survived: false,
          remaining: state.currentlyPlaying.length - 1
        }
      ],
    };
  } else {
    return {
      ...state,
      turn: state.turn + 1,
      chance: state.chance + 1,
      barrel: state.barrel - 1,
      events: [
        ...state.events,
        {
          type: "ban",
          chosen: chosen,
          chance: state.chance,
          survived: true,
          remaining: state.currentlyPlaying.length
        }
      ],
    };
  };

}