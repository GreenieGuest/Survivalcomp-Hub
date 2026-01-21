import { randomItem, randomInt } from "./utils";

export function startGame(players) {
  // initialize game: all players added, random barrel position, # players printed
  return {
    turn: 0,
    castSize: players.length,
    barrel: randomInt(1,6),
    chance: 1,
    alivePlayers: [...players],
    bannedPlayers: [],
    events: [
      {
        type: "system",
        message: "Game started with " + players.length + " players."
      }
    ]
  };
}

export function nextTurn(state) {
  if (state.alivePlayers.length <= 1) {
    return {
      ...state,
      events: [
        ...state.events,
        {
          type: "system",
          message: "Winner: " + ((state.alivePlayers[0] ? state.alivePlayers[0].name : "No one") + "! Press 'Start Game' to simulate again")
        }
      ]
    };
  }

  // Every round... pick one random player to be eliminated.
  // (The most simple of survivalcomps)
  const chosen = randomItem(state.alivePlayers);
  var roulette = randomInt(1,state.barrel);

  if (roulette == 1) {
    return {
      ...state,
      turn: state.turn + 1,
      barrel: randomInt(1,6),
      chance: 1,
      alivePlayers: state.alivePlayers.filter(p => p.id !== chosen.id),
      bannedPlayers: [...state.bannedPlayers, chosen],
      events: [
        ...state.events,
        {
          type: "ban",
          chosen: chosen,
          chance: state.chance,
          survived: false,
          remaining: state.alivePlayers.length - 1
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
          remaining: state.alivePlayers.length
        }
      ],
    };
  };

}