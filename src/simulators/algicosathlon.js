import { randomChoice } from "./utils";
import { challenge } from "./modules";

function getBasePoints(numPlayers) {
  // returns an array of base points for players based on number of players
  const basePoints = [];
  const maxValue = 100
  const minValue = 1 // to be configured later

  var ratio = maxValue ** (1/(numPlayers - 1));
  for (let i = 0; i < numPlayers; i++) {
    basePoints.push(maxValue / (ratio ** i)); // Don't round.... it makes things more fun with large casts
  }

  return basePoints;
}

function elimination(athletes) {
    console.log(athletes);
    // find eliminated player
    athletes.sort((a, b) => getPoints(a) - getPoints(b));
    let eliminated = athletes[0];
    // sort by reverse for the leaderboard
    athletes.sort((a, b) => getPoints(b) - getPoints(a));
    
    console.log(`${eliminated.name} has been ELIMINATED with ${eliminated.points} points. ${athletes.length - 1} remain. But where did I go wrong?\n`);
    return eliminated;
}

function getPoints(player) {
    return player.points;
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

export function FF_AS(state, playerList) { // repeat until winner
  if (!state || state.winner) {
    if (playerList.length === 0) {
      return state; // prevent game breaking
    }
    state = initialize_AS(playerList);
  }
  let nextState = state;
  while (!nextState.winner) {
    if (nextState.currentlyPlaying.length === 0) { // prevent game breaking
      break;
    }
    nextState = algicosathlon(nextState);
  }
  return nextState;
}

export function initialize_AS(players) {
  // initialize game: all players added, random barrel position, # players printed
  return {
    turn: 0,
    // Sim fundamentals
    points: true,
    teams: false,
    // Game fundamentals
    castSize: players.length,
    winner: null,
    base_points: getBasePoints(players.length),
    rate_of_change: 1.5,
    //Give each player a new points property
    // lastPlacement is for the leaderboard arrows
    // score and gains are for algicosathlon nerds and purists
    currentlyPlaying: players.map(p => ({...p, points: 0, lastPlacement: 3, score: 0, gains: 0})),
    eliminated: [],
    challenges: [], // For the Ultimate Showdown
    // Data collection
    placements: [],
    scores: [],

    events: [
      {
        type: "system",
        message: "Game started with " + players.length + " athletes."
      }
    ]
  };
}

export function algicosathlon(state) {
  // round format:
  // athletes compete in a challenge and are allocated points based on their scores
  // placements, gains and leaderboard are updated
  // athlete with the least points is eliminated
  // return state

  // win conditions (proper finale to be added later)
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
          message: "Winner: " + ((soleSurvivor ? soleSurvivor.name : "No one") + "! Press 'Start Game' to simulate again"),
        }
      ]
    };
  }

  let base_points = state.base_points;
  let rate_of_change = state.rate_of_change;

  console.log("Base Points this round: " + base_points);

  // Select a challenge
  let challengeName;
      const challengeTypes = ["Running (100yd)", "Discus Throw", "Archery", "PSaT", "BMX Cycling", "Obstacle Course",
        "Ninja Takedown", "The Ultimate Test of Your Sheer Willpower", "Maxing", "The FitnessGram Pacer Test",
        "The ASCI Spelling Bee", "Pole Vault", "Juggling", "Robot Takedown", "Mechanical Bull", "Shot Put",
        "Dogfighting", "Triathalon", "Beat the AI"];
      challengeName = randomChoice(challengeTypes);
      state.challenges.push(challengeName);
  // }

	let [placements, scores] = challengeFFA(challengeName, state.currentlyPlaying);

  for (let x = 0; x < placements.length; x++) {
    state.currentlyPlaying[placements[x]].points += Math.ceil(base_points[x] * Math.pow(rate_of_change, state.turn));
    state.currentlyPlaying[placements[x]].score = scores[x]; // 1 is best, etc.
    state.currentlyPlaying[placements[x]].gains = Math.ceil(base_points[x] * Math.pow(rate_of_change, state.turn));
    // Log each player's points this round
    console.log(`${state.currentlyPlaying[placements[x]].name} placed ${x + 1} and earned ${Math.ceil(base_points[x])} * ${Math.pow(rate_of_change, state.turn)} points, for a total of ${state.currentlyPlaying[placements[x]].points} points.`);
  }
  console.log(state.currentlyPlaying);

  // record last placement for the cool arrows on the leaderboard
  state.currentlyPlaying.forEach((player, index) => {
    player.lastPlacement = index;
  });
  const chosen = elimination(state.currentlyPlaying);
  console.log("This should only run once");

    return {
      ...state,
      turn: state.turn + 1,
      currentlyPlaying: state.currentlyPlaying.filter(p => p.id !== chosen.id),
      eliminated: [...state.eliminated, chosen], // add to banned players
      events: [
        ...state.events,
        {
          type: "algoElim",
          chosen: chosen,
          challenge: challengeName,
          remaining: state.currentlyPlaying.length - 1
        }
      ],
    };
}