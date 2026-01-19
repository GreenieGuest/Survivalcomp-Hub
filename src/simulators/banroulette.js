import { randomItem } from "./utils";

export function startGame(players) {
  return {
    turn: 0,
    alivePlayers: [...players],
    bannedPlayers: [],
    lastEvent: "Game Started!"
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
  const banned = randomItem(state.alivePlayers);

  return {
    ...state,
    turn: state.turn + 1,
    alivePlayers: state.alivePlayers.filter(p => p.id !== banned.id),
    bannedPlayers: [...state.bannedPlayers, banned],
    // List all remaining players
    lastEvent: `${banned.name} was banned. Remaining players: ${state.alivePlayers.filter(p => p.id !== banned.id).map(p => p.name).join(", ")}`
  };
}