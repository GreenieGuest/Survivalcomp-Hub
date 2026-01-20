import { randomItem, randomInt } from "./utils";

export function startGame(players) {
  return {
    turn: 0,
    barrel: randomInt(1,6),
    alivePlayers: [...players],
    bannedPlayers: [],
    lastEvent: "Game started with " + players.length + " players."
  };
}

export function nextTurn(state) {
  if (state.alivePlayers.length <= 1) {
    return {
      ...state,
      lastEvent: "Winner: " + ((state.alivePlayers[0] ? state.alivePlayers[0].name : "No one") + "! Press 'Start Game' to simulate again")
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
      alivePlayers: state.alivePlayers.filter(p => p.id !== chosen.id),
      bannedPlayers: [...state.bannedPlayers, chosen],
      // List all remaining players
      lastEvent: `${chosen.name} is chosen for Ban Roulette... and is BANNED. ` + state.alivePlayers.length + ` players remain: ${state.alivePlayers.filter(p => p.id !== chosen.id).map(p => p.name).join(", ")}`
    };
  } else {
    return {
      ...state,
      turn: state.turn + 1,
      barrel: state.barrel - 1,
      alivePlayers: state.alivePlayers,
      bannedPlayers: state.bannedPlayers,
      // List all remaining players
      lastEvent: `${chosen.name} is chosen for Ban Roulette... and SURVIVES. ` + state.alivePlayers.length + ` players remain: ${state.alivePlayers.map(p => p.name).join(", ")}`
    };
  };

}