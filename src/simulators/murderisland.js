import { randomChoice, randomInt } from "./utils";

const clues = ["Black","Blonde","Brunette","Ginger",
    "Blue","Gray","Green","Khaki","Matte","Purple","Red","White","Yellow",
    "Fabric","Glasses",
    "Card","Paper","Phone"
]

export function initialize_MI(players) {
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

  return {
    turn: 0,
    // Sim fundamentals
    points: false,
    teams: false,
    // Game fundamentals
    castSize: players.length,
    winner: null,
    currentlyPlaying: playerProfiles,
    eliminated: [],
    //Sim-specific

    events: [
      {
        type: "murderIslandStart",
        players: playerProfiles,
        message: players.length + " players are trapped on Murder Island..."
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
    if (nextState.currentlyPlaying.length === 0) { // prevent game breaking
      break;
    }
    nextState = murderIsland(nextState);
  }
  return nextState;
}

export function murderIsland(state) {
    if (state.currentlyPlaying.length <= 1) {
        var soleSurvivor = null;
        if (state.currentlyPlaying.length === 0 && state.eliminated.length > 0) {
          soleSurvivor = state.eliminated[state.eliminated.length - 1]; // last eliminated player wins by default
        } else {
          soleSurvivor = state.currentlyPlaying[0];
        }
        return {
        ...state,
        winner: soleSurvivor || null,
        currentlyPlaying: [],
        eliminated: (soleSurvivor ? [...state.eliminated, soleSurvivor] : state.eliminated), // Even winners must be eliminated... (for the leaderboards)
        events: [
            ...state.events,
            {
            type: "system",
            message: ((soleSurvivor ? soleSurvivor.name : "No one") + " is the sole survivor of Murder Island."),
            }
        ]
        };
    }

    const murderer = randomChoice(state.currentlyPlaying);
    const victim = randomChoice(state.currentlyPlaying.filter(p => p.id !== murderer.id))

    if (state.currentlyPlaying.filter(p => p.id !== victim.id).length <= 1) { // murderer victory
        return {
        ...state,
        winner: murderer || null,
        currentlyPlaying: [],
        eliminated: [...state.eliminated, victim, murderer], // add to banned players
        events: [
            ...state.events,
            {
            type: "system",
            message: murderer.name + " eliminates " + victim.name + " and becomes the sole survivor of Murder Island.",
            }
        ]
        };
    }

    // Clue Stomp
    const realClue1 = randomChoice(murderer.clues);
    const realClue2 = randomChoice(murderer.clues.filter(c => c !== realClue1));
    const fakeClue1 = randomChoice(clues.filter(c => !murderer.clues.includes(c)));
    const fakeClue2 = randomChoice(clues.filter(c => !murderer.clues.includes(c) && c !== fakeClue1));

    const potentialSuspects = state.currentlyPlaying.filter(p => p.id !== victim.id && p.clues.includes(realClue1) && (p.clues.includes(realClue2) || p.clues.includes(fakeClue1) || p.clues.includes(fakeClue2)))
    const voters = state.currentlyPlaying.filter(p =>  p.id !== victim.id && !potentialSuspects.includes(p));

    const executed = randomChoice(potentialSuspects);

    return {
        ...state,
        currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== victim.id && p.id !== executed.id),
        eliminated: [...state.eliminated, victim, executed], // add to banned players
        turn: state.turn + 1,
        events: [
            ...state.events,
            {
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
            }
        ],
    };

}