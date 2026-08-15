import { randomChoice, randomSample } from "./utils";
import { getChallengeResults, isGameOver, getDefaultWinner } from "./modules";
import { useSimStore } from "../store/simulationStore";
import voteOut from "./votingLogic";
import default_teams from "../constants/defaultTeams";

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

function updatePhase(state) {
  const { logEvent } = useSimStore.getState();
  let { currentlyPlaying, castSize, teams } = state;
  let mergeThreshold = state.config.mergeThreshold ?? Math.floor(castSize / 2);

  // Initial team assignment
  if (currentlyPlaying.length === castSize) {
    return {
      ...state,
      teams: assignTeams(currentlyPlaying, +state.config.startingTeams),
      quarter: PHASES.THREE_TEAMS
    };
  }

  // Merge condition (Must be checked before swap or swap will override)
  if (currentlyPlaying.length === mergeThreshold) {
    logEvent({ type: 'header', label: 'Merge' });
    logEvent({ type: 'system', message: 'The tribes have merged! Individual immunity is now in play.' });
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
    logEvent({ type: 'header', label: 'Team Swap' });
    logEvent({ type: 'system', message: 'The teams have swapped, and the dynamic has shifted.' });
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
  const { logEvent } = useSimStore.getState();

  // Make things even by "sitting out" extra players if one team is bigger than another (Remove this in BOTS)
  let participatingTeamMembers = [...state.teams]
  const smallestTeamSize = Math.min(...participatingTeamMembers.map(a => a.length));
  console.log(smallestTeamSize)
  participatingTeamMembers = state.teams.map(team =>
    randomSample(team, smallestTeamSize)
  );

  const [placements] = getChallengeResults(challengeName, participatingTeamMembers);

  const losingTeamIndex = placements.at(-1);
  console.log(losingTeamIndex)
  console.log(participatingTeamMembers)
  const losingTeam = state.teams[losingTeamIndex];
  const losingTeamInfo = state.teamInfo[losingTeamIndex];

  logEvent({ type: 'header', label: 'Immunity Challenge' });
  logEvent({ type: 'system', message: `The challenge is ${challengeName}.` });
  logEvent({ type: 'system', message: `${losingTeamInfo.name} loses the challenge and will have to vote someone out tonight.` });

  const { eliminated: eliminatedPlayer, voteLog } = voteOut(losingTeam, losingTeam, state.currentlyPlaying.length)
  logEvent({ type: 'header', label: 'General Meeting' });
  logEvent({ type: 'system', message: `${eliminatedPlayer.name} has been voted out..` });

  return {
    ...state,
    turn: state.turn + 1,

    currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== eliminatedPlayer.id),
    teams: state.teams.map(team =>
      team.filter(p => p.id !== eliminatedPlayer.id)
    ),
    eliminated: [...state.eliminated, eliminatedPlayer],
  };
}

function mergeRound(state, challengeName) {
  const { logEvent } = useSimStore.getState();

  // each player is its own 'party'
  const [placements, scores] = getChallengeResults(challengeName, state.currentlyPlaying.map(p => [p]));
  
  const immunePlayer = state.currentlyPlaying[placements[0]];
  const updatedImmune = { ...immunePlayer, notoriety: (immunePlayer.notoriety ?? 0) + 1 };

  logEvent({ type: 'header', label: 'Immunity Challenge' });
  logEvent({ type: 'system', message: `The challenge is ${challengeName}.` });
  logEvent({ type: 'system', message: `${immunePlayer.name} wins immunity! Everyone else will be at risk for being voted out tonight.` });
  
  const nominated = state.currentlyPlaying.filter(p => p.id !== immunePlayer.id);
  const { eliminated: eliminatedPlayer, voteLog } = voteOut(nominated, state.currentlyPlaying, state.currentlyPlaying.length, [immunePlayer.id]);
  
  logEvent({ type: 'header', label: 'General Meeting' });
  logEvent({ type: 'system', message: `${eliminatedPlayer.name} has been voted out..` });

  return {
    ...state,
    turn: state.turn + 1,
    currentlyPlaying: state.currentlyPlaying
      .filter(p => p.id !== eliminatedPlayer.id)
      .map(p => p.id === immunePlayer.id ? updatedImmune : p),
    eliminated: [...state.eliminated, eliminatedPlayer],
  }
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

  let updatedState = updatePhase(state);

  const { name: challengeName, updatedState: withChallenge } =
    pickChallenge(updatedState);

  return withChallenge.quarter !== PHASES.MERGE
    ? teamRound(withChallenge, challengeName)
    : mergeRound(withChallenge, challengeName);
}