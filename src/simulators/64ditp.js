import { randomChoice, randomInt } from "./utils";
import { challenge } from "./modules";

function elimination(eligible) {
    console.log(eligible);
    
    var eliminated = randomChoice(eligible);

    return eliminated;
}

function challengeTeam(challengeName, teams) {
    let teamPoints = [0, 0];
    
    for (let team = 0; team < teams.length; team++) {
      var points = 0;
      for (let player = 0; player < teams[team].length; player++) {
        var performance = challenge(challengeName, teams[team][player]);
        points += performance;
      }
      teamPoints[team] = points;
    }

    // Calculate who has the most points and who has the least
    let placements = [...teamPoints]; // Place the SCORES in this array
    placements.sort((a, b) => b - a);
    let results = [...placements]; // Place the SORTED SCORES in this array

    // Convert placements from scores to team indices

    for (let x = 0; x < placements.length; x++) {
        let index = teamPoints.indexOf(placements[x]);
        placements[x] = index;
        teamPoints[index] = 0;
    }
    // Return to the main function an array with team placements based on index, and their scores in the challenge
    console.log([placements, results])
    return [placements, results];
}

// Challenge FFA: all athletes compete, placements and scores returned
// Parameters: challenge name, competing player array
// In the future: The Ultimate Showdown...
function challengeFFA(challengeName, athletes) {
    // For each athlete, they start out with 0 points
    let playerPoints = Array(athletes.length).fill(0);

    // Based on challenge (placeholder) they will perform based on stats
    for (let player = 0; player < athletes.length; player++) {
        playerPoints[player] = challenge(challengeName, athletes[player]);
    }

    // Calculate who has the most points and who has the least
    let placements = [...playerPoints]; // Place the SCORES in this array
    placements.sort((a, b) => b - a);
    let results = [...placements]; // Place the SORTED SCORES in this array

    // Convert placements from scores to player indices

    for (let x = 0; x < placements.length; x++) {
        let index = playerPoints.indexOf(placements[x]);
        placements[x] = index;
        playerPoints[index] = 0;
    }
    // Return to the main function an array with player placements based on index, and their scores in the challenge
    return [placements, results];
}

export function initialize_SV(players, config) {
  // Function called by the interface to create a simulation by importing player profiles (and in the future, configuration settings).
  // Contains fundamentals (turn, participants, winner)
  // Returns a state that will be modified as the simulation goes on.
  
  return {
    turn: 0,
    // Sim fundamentals
    points: false,
    teams: true,
    // Game fundamentals
    castSize: players.length,
    config: config,
    winner: null,
    quarter: 'S', // S: start, #: # of teams, H: have-gots vs. have-nots, M: merge
    currentlyPlaying: players.map(p => ({...p,
      faction: null,
      idols: []
    })),
    // team data
    teams: [[],[]],
    teamNames: ["Red Drums","Blue Jays"],
    teamColors: ["#FF0000", "#0000FF"],

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
  // Swap conditions
  if (state.currentlyPlaying.length == state.castSize) { // First assignment
    let shuffledPlayers = [...state.currentlyPlaying].sort(() => 0.5 - Math.random());
    state.teams[0] = shuffledPlayers.slice(0, Math.ceil(state.castSize / 2)).map(p => ({...p, faction: 0}));
    state.teams[1] = shuffledPlayers.slice(Math.ceil(state.castSize / 2)).map(p => ({...p, faction: 1}));
    state.quarter = '2'
  } else if (state.currentlyPlaying.length == Math.floor(state.castSize / 2)) { // Merge teams
    state.quarter = 'M';
    // teams are no longer relevant
    console.log("Merge");
  }

  if (state.currentlyPlaying.length <= 1) {
    return {
      ...state,
      winner: state.currentlyPlaying[0] || null,
      events: [
        ...state.events,
        {
          type: "system",
          message: ((state.currentlyPlaying[0] ? state.currentlyPlaying[0].name : "No one") + " is the sole survivor of Murder Island."),
        }
      ]
    };
  }

  console.log(state.teams);

  let challengeName;
      const challengeTypes = state.config.challenges;
      challengeName = randomChoice(challengeTypes);
      state.challenges.push(challengeName);

  if (state.quarter != 'M') {
	  let [placements, scores] = challengeTeam(challengeName, state.teams);
    console.log("Scores for each team: ", scores);
    let losingTeam = state.teams[placements.at(-1)];
    console.log(state.teamNames[placements.at(-1)], " loses and must vote someone out");
    console.log(losingTeam)
    let chosen = elimination(losingTeam);
    
    return {
      ...state,
      turn: state.turn + 1,
      currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== chosen.id),
      eliminated: [...state.eliminated, chosen], // add to banned players
      events: [
        ...state.events,
        [chosen, " was voted out"]
      ],
    };
  } else {
    let [placements, scores] = challengeFFA(challengeName, state.currentlyPlaying);
    console.log("Scores for each player: ", scores);
    console.log(currentlyPlaying[placements[0]], " wins immunity");
    const chosen = elimination(state.currentlyPlaying.filter(p => p.id !== currentlyPlaying[placements[0]].id));

    return {
      ...state,
      turn: state.turn + 1,
      currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== chosen.id),
      teams: state.teams.map(team =>
        team.filter(p => p.id !== chosen.id)
      ),
      eliminated: [...state.eliminated, chosen], // add to banned players
      events: [
        ...state.events,
        [chosen, " was voted out"]
      ],
    };
  }
}