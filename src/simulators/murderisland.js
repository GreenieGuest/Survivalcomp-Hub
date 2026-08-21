import { randomChoice } from "./utils";
import { isGameOver, getDefaultWinner } from "./modules";
import { useSimStore } from "../store/simulationStore";

const clues = ["Black","Blonde","Brunette","Ginger",
    "Blue","Gray","Green","Khaki","Matte","Purple","Red","White","Yellow",
    "Fabric","Glasses",
    "Card","Paper","Phone"
]

export function initialize_MI(players, config) {
  const { logEvent } = useSimStore.getState();
  
  // initialize game: all players added, random barrel position, # players printed
  const playerProfiles = players.map(p => (
        {...p,
        kills: 0,
        votes: 0,
        votedFor: null,
        causeOfDeath: null,
        correctVotes: 0,
        // No duplicate clues
        clues: p.clues || [randomChoice(clues), randomChoice(clues), randomChoice(clues), randomChoice(clues)]
    }));

    logEvent({
        type: "murderIslandStart",
        players: playerProfiles,
        message: players.length + " players are trapped on Murder Island..."
    }, 0)

  return {
    turn: 0,
    // Sim fundamentals
    points: false,
    teams_game: false,
    // Game fundamentals
    castSize: players.length,
    config: config,
    winner: null,
    currentlyPlaying: playerProfiles,
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
    if (nextState.currentlyPlaying.length === 0) { // prevent game breaking
      break;
    }
    nextState = murderIsland(nextState);
  }
  return nextState;
}

export function murderIsland(state) {
  const { logEvent } = useSimStore.getState();

    // Default Finale Block
    if (isGameOver(state)) {
      const soleSurvivor = state.currentlyPlaying.length === 0
        ? state.eliminated[state.eliminated.length - 1] // last eliminated player wins by default
        : state.currentlyPlaying[0];
      return getDefaultWinner(state, `${soleSurvivor?.name ?? 'No one'} is the sole survivor of Murder Island.`);
    }

    const murderer = randomChoice(state.currentlyPlaying);
    const victim = randomChoice(state.currentlyPlaying.filter(p => p.id !== murderer.id))

    if (state.currentlyPlaying.filter(p => p.id !== victim.id).length <= 1) { // murderer victory
        logEvent({ type: 'system', message: `${murderer.name} eliminates ${victim.name} and becomes the sole survivor of Murder Island.` }, state.turn)
        return {
        ...state,
        winner: murderer || null,
        currentlyPlaying: [],
        eliminated: [...state.eliminated, victim, murderer], // add to banned players
        };
    }

    // Clue Stomp
    const realClue1 = randomChoice(murderer.clues);
    const realClue2 = randomChoice(murderer.clues.filter(c => c !== realClue1));
    const fakeClue1 = randomChoice(clues.filter(c => !murderer.clues.includes(c)));
    const fakeClue2 = randomChoice(clues.filter(c => !murderer.clues.includes(c) && c !== fakeClue1));

    const potentialSuspects = state.currentlyPlaying.filter(p => p.id !== victim.id && p.clues.includes(realClue1) && (p.clues.includes(realClue2) || p.clues.includes(fakeClue1) || p.clues.includes(fakeClue2)))
    // const voters = state.currentlyPlaying.filter(p =>  p.id !== victim.id && !potentialSuspects.includes(p));

    const executed = randomChoice(potentialSuspects);

    logEvent({
          type: "murder",
          victim: victim,
          murderer: murderer,
          executed: executed,
          potentialSus: potentialSuspects,
          realClue1: realClue1,
          realClue2: realClue2,
          fakeClue1: fakeClue1,
          fakeClue2: fakeClue2,
          remaining: state.currentlyPlaying.length - 2
        }, state.turn)
    return {
        ...state,
        currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== victim.id && p.id !== executed.id),
        eliminated: [...state.eliminated, victim, executed], // add to banned players
        turn: state.turn + 1,
    };

}