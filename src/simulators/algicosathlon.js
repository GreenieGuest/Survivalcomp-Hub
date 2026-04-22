import { randomChoice } from "./utils";
import { challenge } from "./modules";

function getBasePoints(numPlayers, distribution) {
  // returns an array of base points for players based on number of players
  const basePoints = [];

  if (distribution === "linear") {
    for (let i = 0; i < numPlayers; i++) {
      basePoints.push(numPlayers - i); // 1st place gets numPlayers points, 2nd gets numPlayers - 1, etc.
    }
    return basePoints;
  }
  // otherwise do exponential method (most algicosathlons do this)
  const maxValue = 100
  const minValue = 1 // to be configured later

  var ratio = maxValue ** (1/(numPlayers - 1));
  for (let i = 0; i < numPlayers; i++) {
    basePoints.push(maxValue / (ratio ** i)); // Don't round.... it makes things more fun with large casts
  }

  return basePoints;
}

function elimination(athletes, challengeName) {
    console.log(athletes);
    // find eliminated player
    athletes.sort((a, b) => getPoints(a) - getPoints(b));

    // check if there is a tie
    let lowestScorer = athletes[0];
    if (athletes.length > 1) {
      let tiebreaker_group = athletes.filter(p => p.points === lowestScorer.points);

      // run a tiebreaker challenge if there is a tie ( Duel mechanic for future BOTS )
      while (tiebreaker_group.length > 1) {
          console.log("Tiebreaker between " + tiebreaker_group.map(p => p.name).join(", ") + " with " + lowestScorer.points + " points.");

          // Run the tiebreaker challenge
          let [placements, scores] = getChallengeResults(challengeName, tiebreaker_group);
          var worst_score = Math.min(...scores);
          // If a tie happened within the Duel/3Duel, do another tiebreaker with the contestants who got the worst score
          tiebreaker_group = tiebreaker_group.filter((p, index) => scores[index] === worst_score);
      }
      var eliminated = tiebreaker_group[0];
    } else {
      var eliminated = lowestScorer;
    }

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
function getChallengeResults(challengeName, athletes) {
    const scores = athletes.map(p => challenge(challengeName, p));

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

export function FF_AS(state, playerList, config) { // repeat until winner
  if (!state || state.winner) {
    if (playerList.length === 0) {
      return state; // prevent game breaking
    }
    state = initialize_AS(playerList, config);
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

export function initialize_AS(players, config) {
  // initialize game: all players added, random barrel position, # players printed
  return {
    turn: 0,
    // Sim fundamentals
    points: true,
    teams_game: false,
    // Game fundamentals
    castSize: players.length,
    config: config,
    winner: null,
    base_points: getBasePoints(players.length, config.pointDistribution),
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
  let rate_of_change = state.config.rateOfChange;

  console.log("Base Points this round: " + base_points);

  // Select a challenge
  let challengeName;
      const challengeTypes = state.config.challenges;
      challengeName = randomChoice(challengeTypes);
      state.challenges.push(challengeName);
  // }

  // Placements: Players sorted by score, value is their ID
  // Scores: Players sorted by ID, value is their score
	let [placements, scores] = getChallengeResults(challengeName, state.currentlyPlaying);

  let runningTiedPlacement = 0; // for handling ties in placements (if 1st and 2nd are tied, they should both get 1st place points, etc.)
  for (let x = 0; x < placements.length; x++) {
    let placement = x;
    let playerScore = scores[x];
    // HOLD IT! If the 1st and 2nd placers are tied, they should get the same points and placement. Same for 2nd and 3rd.
    // Walk back to find the first player in the tie group
    while (placement > 0 && scores[[placement - 1]] === playerScore) {
      placement--;
    }

    state.currentlyPlaying[placements[x]].points += Math.ceil(base_points[placement] * Math.pow(rate_of_change, state.turn));
    state.currentlyPlaying[placements[x]].score = scores[x]; // 1 is best, etc.
    state.currentlyPlaying[placements[x]].gains = Math.ceil(base_points[placement] * Math.pow(rate_of_change, state.turn));
    // Log each player's points this round
    console.log(`${state.currentlyPlaying[placements[x]].name} placed ${x + 1} and earned ${Math.ceil(base_points[placement])} * ${Math.pow(rate_of_change, state.turn)} points, for a total of ${state.currentlyPlaying[placements[x]].points} points.`);
  }
  console.log(state.currentlyPlaying);

  // record last placement for the cool arrows on the leaderboard
  state.currentlyPlaying.forEach((player, index) => {
    player.lastPlacement = index;
  });
  const chosen = elimination(state.currentlyPlaying, challengeName);
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