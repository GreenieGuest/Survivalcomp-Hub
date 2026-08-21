import { randomChoice, randomSample } from "./utils";
import { getChallengeResults, isGameOver, getDefaultWinner } from "./modules";
import { useSimStore } from "../store/simulationStore";
import { voteOut, juryVote, runCampEvents, IDOL_TYPES } from "./votingLogic";
import default_teams from "../constants/defaultTeams";

// constants

const logEvent = (event, turn) => useSimStore.getState().logEvent(event, turn);

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

function updatePhase(state) {
  const { currentlyPlaying, castSize, teams } = state;
  const mergeThreshold = state.config.mergeThreshold ?? Math.floor(castSize / 2);

  // Initial team assignment
  if (currentlyPlaying.length === castSize) {
    const newTeams = assignTeams(currentlyPlaying, +state.config.startingTeams);

    logEvent({ type: 'header', label: 'Team Assignment' }, state.turn);
    newTeams.forEach((team, i) =>
      logEvent({ type: 'teamAssignment', team: state.teamInfo[i], players: team }, state.turn)
    );

    return {
      ...state,
      teams: newTeams,
      quarter: PHASES.THREE_TEAMS
    };
  }

  // Merge condition (Must be checked before swap or swap will override)
  if (currentlyPlaying.length === mergeThreshold) {
    logEvent({ type: 'header', label: 'Merge' }, state.turn);
    logEvent({ type: 'system', message: 'The tribes have merged! Individual immunity is now in play.' }, state.turn);
    return {
      ...state,
      quarter: PHASES.MERGE
    };
  }

  // Swap condition
  if (state.quarter !== PHASES.MERGE && state.quarter !== PHASES.MERGATORY &&
    (state.config.swapThresholds.includes(currentlyPlaying.length) || Math.min(...teams.map(a => a.length)) === 1)
  )
    {
    const newTeams = assignTeams(teams.flat(), teams.length - 1);
    logEvent({ type: 'header', label: 'Team Swap' }, state.turn);
    logEvent({ type: 'system', message: 'The teams have swapped, and the dynamic has shifted.' }, state.turn);

    newTeams.forEach((team, i) =>
      logEvent({ type: 'teamAssignment', team: state.teamInfo[i], players: team }, state.turn)
    );

    return {
      ...state,
      teams: newTeams,
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

function syncUpdatedNominated(currentlyPlaying, updatedNominated) {
  if (!updatedNominated) return currentlyPlaying;

  return currentlyPlaying.map(p => {
    const updated = updatedNominated.find(u => u.id === p.id);
    return updated ? { ...p, idols: updated.idols } : p;
  });
}

// Idol discovery: small chance each round for players (within the provided pool)
function attemptFindIdols(state, pool) {
  // probabilities
  const HII_CHANCE = state.config?.hiiChance ?? 0.06; // 6%
  const SUPER_CHANCE = state.config?.superChance ?? 0.01; // 1%

  const updatedPlayers = state.currentlyPlaying.map(p => ({ ...p }));

  for (const player of pool) {
    const idx = updatedPlayers.findIndex(u => u.id === player.id);
    if (idx === -1) continue;

    // ensure idols array exists
    updatedPlayers[idx].idols = updatedPlayers[idx].idols ?? [];

    // Super Idol
    if (Math.random() < SUPER_CHANCE) {
      updatedPlayers[idx] = {
        ...updatedPlayers[idx],
        idols: [...updatedPlayers[idx].idols, { type: IDOL_TYPES.SUPER }]
      };
      logEvent({ type: 'idolFind', player: { ...updatedPlayers[idx] }, idolType: IDOL_TYPES.SUPER }, state.turn);
      continue;
    }

    // Normal Idol
    if (Math.random() < HII_CHANCE) {
      updatedPlayers[idx] = {
        ...updatedPlayers[idx],
        idols: [...updatedPlayers[idx].idols, { type: IDOL_TYPES.HII }]
      };
      logEvent({ type: 'idolFind', player: { ...updatedPlayers[idx] }, idolType: IDOL_TYPES.HII }, state.turn);
    }

    // Yes... you can find both types in one turn. how do you think rigged players are rigged
  }

  return { ...state, currentlyPlaying: updatedPlayers };
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
  const losingTeamInfo = state.teamInfo[losingTeamIndex];

  logEvent({ type: 'header', label: 'Immunity Challenge' }, state.turn);
  logEvent({ type: 'system', message: `The challenge is ${challengeName}.` }, state.turn);
  logEvent({ type: 'system', message: `${losingTeamInfo.name} loses the challenge and will have to vote someone out tonight.` }, state.turn);
  logEvent({
    type: 'teamChallengeResults',
    results: placements.map((teamIndex, i) => ({
      team: state.teamInfo[teamIndex],
      score: scores[i],
      lost: teamIndex === losingTeamIndex
    }))
  }, state.turn);

  // Camp events
  logEvent({ type: 'header', label: 'Camp' }, state.turn);
  const afterCamp = runCampEvents(state.currentlyPlaying, state.turn);
  state = { ...state, currentlyPlaying: afterCamp };

  // Idol finding for losing team

  // Allow players a chance to find idols before the vote
  state = attemptFindIdols(state, losingTeam);
  const updatedLosingTeam = state.currentlyPlaying.filter(p => losingTeam.find(t => t.id === p.id));

  const { eliminated: eliminatedPlayer, voteLog, updatedNominated } = voteOut(updatedLosingTeam, updatedLosingTeam, state.currentlyPlaying.length, [], state.turn)
  logEvent({ type: 'header', label: 'General Meeting' }, state.turn);
  logEvent({ type: 'vote', voteLog }, state.turn);
  logEvent({ type: 'svElim', eliminated: eliminatedPlayer, team: losingTeamInfo, remaining: state.currentlyPlaying.length - 1 }, state.turn);

  const syncedPlaying = syncUpdatedNominated(state.currentlyPlaying, updatedNominated);

  return {
    ...state,
    turn: state.turn + 1,

    currentlyPlaying: syncedPlaying.filter(p => p.id !== eliminatedPlayer.id),
    teams: state.teams.map(team =>
      team.filter(p => p.id !== eliminatedPlayer.id)
    ),
    eliminated: [...state.eliminated, { ...eliminatedPlayer }],
  };
}

function mergeRound(state, challengeName) {
  // each player is its own 'party'
  const [placements, scores] = getChallengeResults(challengeName, state.currentlyPlaying.map(p => [p]));
  
  const immunePlayer = state.currentlyPlaying[placements[0]];
  const updatedImmune = { ...immunePlayer, notoriety: (immunePlayer.notoriety ?? 0) + 1 };

  logEvent({ type: 'header', label: 'Immunity Challenge' }, state.turn);
  logEvent({ type: 'system', message: `The challenge is ${challengeName}.` }, state.turn);
  logEvent({ type: 'immunity', player: updatedImmune }, state.turn);

  // Camp events
  logEvent({ type: 'header', label: 'Camp' }, state.turn);
  const afterCamp = runCampEvents(state.currentlyPlaying, state.turn);
  state = { ...state, currentlyPlaying: afterCamp };

  // Idol finding for non-immune players
  
  const vulnerable = state.currentlyPlaying.filter(p => p.id !== immunePlayer.id);

  // Allow players a chance to find idols before the vote
  state = attemptFindIdols(state, vulnerable);
  const updatedVulnerable = state.currentlyPlaying.filter(p => p.id !== immunePlayer.id);

  const { eliminated: eliminatedPlayer, voteLog, updatedNominated, updatedWinner } = voteOut(updatedVulnerable, state.currentlyPlaying, state.currentlyPlaying.length, [immunePlayer.id], state.turn);
  
  logEvent({ type: 'header', label: 'General Meeting' }, state.turn);
  logEvent({ type: 'vote', voteLog }, state.turn);
  logEvent({ type: 'svElim', eliminated: eliminatedPlayer, remaining: state.currentlyPlaying.length - 1 }, state.turn);

  let syncedPlaying = syncUpdatedNominated(state.currentlyPlaying, updatedNominated)
    .filter(p => p.id !== eliminatedPlayer.id)
    .map(p => {
      if (p.id === immunePlayer.id) return updatedImmune;
      if (updatedWinner && p.id === updatedWinner.id) return { ...p, notoriety: updatedWinner.notoriety };
      return p;
    });

  return {
    ...state,
    turn: state.turn + 1,
    currentlyPlaying: syncedPlaying,
    eliminated: [...state.eliminated, { ...eliminatedPlayer }],
    jury: [...state.jury, { ...eliminatedPlayer }],
  };
}

function juryFinale(state) {
    const { winner, voteLog } = juryVote(state.currentlyPlaying, state.jury);

    logEvent({ type: 'header', label: 'Final Tribal Council' }, state.turn);
    logEvent({ type: 'juryVote', finalists: state.currentlyPlaying, voteLog }, state.turn);
    logEvent({ type: 'header', label: 'Winner' }, state.turn);
    logEvent({ type: 'system', message: `${winner.name} wins the game!` }, state.turn);

    return {
        ...state,
        turn: state.turn + 1, // Needs to always update even if there is a finale!!
        winner,
        currentlyPlaying: [],
        eliminated: [...state.eliminated, ...state.currentlyPlaying],
    };
}

export function initialize_SV(players, config) {
  // Function called by the interface to create a simulation by importing player profiles (and in the future, configuration settings).
  // Contains fundamentals (turn, participants, winner)
  // Returns a state that will be modified as the simulation goes on.
  
  const startingTeams = Array.from({ length: config.startingTeams }, (_, i) =>
    config.teamInfo?.[i] ? {...config.teamInfo[i]} : randomChoice(default_teams)
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
      notoriety: 0,   // threat level
      faction: null,
      idols: []
    })),
    // team data
    teams: [],
    teamInfo: startingTeams,

    eliminated: [],
    challenges: [], // For the Ultimate Showdown
    jury: [],
    //Sim-specific
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
    return getDefaultWinner(state);
  }

  if (state.quarter === PHASES.MERGE && state.currentlyPlaying.length <= 3) {
    return juryFinale(state);
  }

  let updatedState = updatePhase(state);

  const { name: challengeName, updatedState: withChallenge } =
    pickChallenge(updatedState);

  return withChallenge.quarter !== PHASES.MERGE
    ? teamRound(withChallenge, challengeName)
    : mergeRound(withChallenge, challengeName);
}