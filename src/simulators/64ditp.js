import { randomChoice, randomSample } from "./utils";
import { challenge } from "./modules";

// constants

const PHASES = {
  START: 'S',
  TWO_TEAMS: '2',
  THREE_TEAMS: '3',
  FOUR_TEAMS: '4',
  MERGATORY: 'H',
  MERGE: 'M'
};

// helpers

function assignTeams(players, numTeams) {
  // Shuffle players (Fisher-Yates)
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const teams = Array.from({ length: numTeams }, () => []);

  // Distribute players one by one
  shuffled.forEach((player, index) => {
    teams[index % numTeams].push(player);
  });

  return teams;
}

function getChallengeResults(challengeName, groups) {
    const scores = groups.map(group =>
      group.reduce((sum, player) => sum +
    challenge(challengeName, player), 0)
    );

    // Calculate who has the most points and who has the least
    const ranking = scores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score);

    const placements = ranking.map(r => r.index);
    const results = ranking.map(r => r.score);

    // Return to the main function an array with team placements based on index, and their scores in the challenge
    console.log([placements, results])
    return [placements, results];
}

function elimination(players, immuneId = null) {
  const eligible = immuneId
    ? players.filter(p => p.id !== immuneId)
    : players;

  return randomChoice(eligible);
}

function isGameOver(state) {
  return state.currentlyPlaying.length <= 1;
}

function finale(state) {
  let winner = null;

  if (state.currentlyPlaying.length === 0 && state.eliminated.length > 0) {
    winner = state.eliminated.at(-1);
  } else {
    winner = state.currentlyPlaying[0] || null;
  }

  return {
    ...state,
    winner,
    currentlyPlaying: [],
    eliminated: winner
      ? [...state.eliminated, winner]
      : state.eliminated,
    events: [
      ...state.events,
      ["Winner: ", (winner ? winner.name : "No one"), "! Press 'Start Game' to simulate again"]
    ]
  };
}

function updatePhase(state) {
  let { currentlyPlaying, castSize, quarter, startingTeams, teams } = state;
  let mergeThreshold = (state.config.mergeThreshold ? state.config.mergeThreshold : Math.floor(castSize / 2))

  // Initial team assignment
  if (currentlyPlaying.length === castSize) {
    return {
      ...state,
      teams: assignTeams(currentlyPlaying, +state.config.startingTeams),
      quarter: PHASES.THREE_TEAMS
    };
  }

  // Merge condition (Must be checked before swap or swap will override)
  if (currentlyPlaying.length == mergeThreshold) {
    console.log("An Merge is occured!");
    return {
      ...state,
      quarter: PHASES.MERGE
    };
  }

  // Swap condition
  if (state.quarter != PHASES.MERGE && state.quarter != PHASES.MERGATORY &&
    (state.config.swapThresholds.includes(currentlyPlaying.length) || Math.min(...teams.map(a => a.length)) === 1)
  )
    {
    console.log("An Swap is occured!");
    return {
      ...state,
      teams: assignTeams(teams.flat(), teams.length - 1),
      quarter: PHASES.TWO_TEAMS
    };
  }

  return state;
}

function pickChallenge(state) {
  const challengeName = randomChoice(state.config.challenges);

  return {
    name: challengeName,
    updatedState: {
      ...state,
      challenges: [...state.challenges, challengeName]
    }
  };
}

// LOGIC

function teamRound(state, challengeName) {
  // Make things even by "sitting out" extra players if one team is bigger than another (Remove this in BOTS)
  let participatingTeamMembers = [...state.teams]
  const smallestTeamSize = Math.min(...participatingTeamMembers.map(a => a.length));
  console.log(smallestTeamSize)
  participatingTeamMembers = state.teams.map(team =>
    randomSample(team, smallestTeamSize)
  );

  const [placements, scores] = getChallengeResults(challengeName, participatingTeamMembers);

  const losingTeamIndex = placements.at(-1);
  console.log(losingTeamIndex)
  console.log(participatingTeamMembers)
  const losingTeam = state.teams[losingTeamIndex];

  console.log(losingTeam, "lost")

  const eliminatedPlayer = elimination(losingTeam);
  console.log(eliminatedPlayer, "is eliminated")

  return {
    ...state,
    turn: state.turn + 1,

    currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== eliminatedPlayer.id),
    teams: state.teams.map(team =>
      team.filter(p => p.id !== eliminatedPlayer.id)
    ),
    eliminated: [...state.eliminated, eliminatedPlayer],
    events: [
      ...state.events,
      [state.teamInfo[losingTeamIndex], " lost the challenge. ", eliminatedPlayer, " was voted out"]
    ]
  };
}

function mergeRound(state, challengeName) {
  // each player is its own 'party'
  const [placements, scores] = getChallengeResults(challengeName, state.currentlyPlaying.map(p => [p]));
  
  const immunePlayer = state.currentlyPlaying[placements[0]];
  const eliminatedPlayer = elimination(state.currentlyPlaying.filter(p => p.id !== immunePlayer.id));

  return {
    ...state,
    turn: state.turn + 1,
    currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== eliminatedPlayer.id),
    eliminated: [...state.eliminated, eliminatedPlayer],
    events: [
      ...state.events,
      [immunePlayer.name," won immunity. ", eliminatedPlayer.name, " was voted out"]
    ]
  }
}

export function initialize_SV(players, config) {
  // Function called by the interface to create a simulation by importing player profiles (and in the future, configuration settings).
  // Contains fundamentals (turn, participants, winner)
  // Returns a state that will be modified as the simulation goes on.
  
  const startingTeams = Array.from({ length: config.startingTeams }, (_, i) =>
    config.teamInfo?.[i] ? {...config.teamInfo[i]} : {
      name: `Team ${i+1}`,
      color: "#FFFFFF"
    }
  );
  
  return {
    turn: 0,
    // Sim fundamentals
    points: false,
    teams_game: true,
    // Game fundamentals
    castSize: players.length,
    config: config,
    winner: null,
    quarter: PHASES.START,
    currentlyPlaying: players.map(p => ({...p,
      faction: null,
      idols: []
    })),
    // team data
    teams: [],
    teamInfo: startingTeams,

    eliminated: [],
    challenges: [], // For the Ultimate Showdown
    //Sim-specific

    events: [
      {
        type: "system",
        message: "Game started with " + players.length + " players."
      }
    ]
  };
}

export function FF_SV(state, playerList, config) { // repeat teams vote game until winner
  if (!state || state.winner) {
    if (playerList.length === 0) {
      return state; // prevent game breaking
    }
    state = initialize_SV(playerList, config);
  }
  let nextState = state;
  while (!nextState.winner) {
    nextState = survivor(nextState);
  }
  return nextState;
}

export function survivor(state) {
  if (isGameOver(state)) {
    return finale(state);
  }

  let updatedState = updatePhase(state);

  const { name: challengeName, updatedState: withChallenge } =
    pickChallenge(updatedState);

  return withChallenge.quarter !== PHASES.MERGE
    ? teamRound(withChallenge, challengeName)
    : mergeRound(withChallenge, challengeName);
}