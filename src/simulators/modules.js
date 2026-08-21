// For modules that are commonly used between different types of simulators, i.e. CHALLENGES, TEAM SWAPS, etc.
import { randomInt, rollPass } from "./utils";
import { useSimStore } from "../store/simulationStore";

export function isGameOver(state) {
  return state.currentlyPlaying.length <= 1;
}

//Default Finale
//Input: Gamestate, Custom Ending Message
export function getDefaultWinner(state, customMessage) {
    const { logEvent } = useSimStore.getState();

    const soleSurvivor = state.currentlyPlaying.length === 0
    ? state.eliminated[state.eliminated.length - 1] // last eliminated player wins by default
    : state.currentlyPlaying[0];

    logEvent({ type: 'header', label: 'Winner' }, state.turn)
    logEvent({ type: 'system', message: customMessage ?? `${soleSurvivor?.name ?? 'No one'} wins! Press 'Start Game' to simulate again.` }, state.turn)

    return {
    ...state,
    turn: state.turn + 1, // Needs to always update even if there is a finale!!
    winner: soleSurvivor || null,
    currentlyPlaying: [],
    eliminated: (soleSurvivor ? [...state.eliminated, soleSurvivor] : state.eliminated), // Even winners must be eliminated... (for the leaderboards)
};
}

// Standardized Challenge Function: groups or individual players are represented in arrays
// Parameters: challenge name, competing group array
export function getChallengeResults(challengeName, groups) {
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

// Challenge FFA: all athletes compete, placements and scores returned
// Parameters: challenge name, competing player array
export function getIndvChallengeResults(challengeName, athletes) {
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

//Challenge: takes challenge name and player object, returns earned points based on player stats
export function challenge(challenge, player) {
    let earnedPoints = 0;

    // These are all based from my paper-based comic "Icosathlon with Stats"
    // which features short panel challenges based on different stat rolls

    switch (challenge) { // [ IwS Challenges ]
        case "Running (100yd)":
            for (let x = 0; x < 10; x++) {
                earnedPoints += randomInt(1, player.dex);
            }
            break;
        //Classic sum category
        case "Discus Throw":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.str);
            }
            break;
        case "Archery":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.dex);
            }
            break;
        case "PSaT":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.int);
            }
            break;
        // Sum combination category
        case "BMX Cycling":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.str);
            }
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.dex);
            }
            break;
        case "IWS Obstacle Course":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.dex);
            }
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.int);
            }
            break;
        case "Ninja Takedown":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.str);
            }
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.int);
            }
            break;
        case "The Ultimate Test of Your Sheer Willpower":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.str);
            }
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.dex);
            }
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.int);
            }
            break;
        // Endurance category
        case "Maxing": {
            let playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.str);
                earnedPoints += 1;
            }
            break;
        }
        case "The FitnessGram Pacer Test": {
            let playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.dex);
                earnedPoints += 1;
            }
            break;
        }
        case "The ASCI Spelling Bee": {
            let playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.int);
                earnedPoints += 1;
            }
            break;
        }
        // Multiplication category
        case "Pole Vault": {
            let playerRoll1 = randomInt(1, player.str);
            let playerRoll2 = randomInt(1, player.dex);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        }
        case "Juggling":
        {
            let playerRoll1 = randomInt(1, player.dex);
            let playerRoll2 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        }
        case "Robot Takedown":
        {
            let playerRoll1 = randomInt(1, player.str);
            let playerRoll2 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        }
        case "Mechanical Bull":
        {
            let playerRoll1 = randomInt(1, player.str);
            let playerRoll2 = randomInt(1, player.dex);
            let playerRoll3 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2 * playerRoll3);
            break;
        }
        case "Shot Put": // Most complex challenge of IwS
        {
            let strRoll1 = randomInt(1, player.str);
            let strRoll2 = randomInt(1, player.str);
            let dexRoll1 = randomInt(1, player.dex);
            let dexRoll2 = randomInt(1, player.dex);
            let intRoll = randomInt(1, player.int);
            let intPoints = 0;
            while (intRoll > 0) {
                intRoll = randomInt(0, player.int);
                intPoints += 1;
            }
            earnedPoints = (strRoll1 + strRoll2) + (dexRoll1 * dexRoll2) + intPoints;
            break;
        }
        case "Dogfighting": // Multiplication of additions
        {
            let strRoll1 = randomInt(1, player.str);
            let strRoll2 = randomInt(1, player.str);
            let dexRoll1 = randomInt(1, player.dex);
            let dexRoll2 = randomInt(1, player.dex);
            let intRoll1 = randomInt(1, player.int);
            let intRoll2 = randomInt(1, player.int);
            earnedPoints = (strRoll1 + strRoll2) * (dexRoll1 + dexRoll2) * (intRoll1 + intRoll2);
            break;
        }
        case "Triathalon": // Addition of multiplications
        {
            let strRoll1 = randomInt(1, player.str);
            let strRoll2 = randomInt(1, player.str);
            let dexRoll1 = randomInt(1, player.dex);
            let dexRoll2 = randomInt(1, player.dex);
            let intRoll1 = randomInt(1, player.int);
            let intRoll2 = randomInt(1, player.int);
            earnedPoints = (strRoll1 * strRoll2) + (dexRoll1 * dexRoll2) + (intRoll1 * intRoll2);
            break;
        }
        case "Beat the AI": // Versus
            for (let x = 0; x < 10; x++) {
                earnedPoints += rollPass(player.str, 6);
            }
            for (let x = 0; x < 10; x++) {
                earnedPoints += rollPass(player.dex, 6);
            }
            for (let x = 0; x < 10; x++) {
                earnedPoints += rollPass(player.int, 6);
            }
            break;

        // 64DITP (Generic) Challenges
        
        case "Strength":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.str);
            }
            break;
        case "Agility":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.dex);
            }
            break;
        case "Mental":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.int);
            }
            break;
        case "Teamwork":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.soc);
            }
            break;
        // Multiplication category
        case "Physical": {
            let playerRoll1 = randomInt(1, player.str);
            let playerRoll2 = randomInt(1, player.dex);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        }
        case "Puzzle":
        {
            let playerRoll1 = randomInt(1, player.soc);
            let playerRoll2 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        }
        case "Obstacle Course":
        {
            let playerRoll1 = randomInt(1, player.dex);
            let playerRoll2 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        }
        case "Coordination":
        {
            let playerRoll1 = randomInt(1, player.str);
            let playerRoll2 = randomInt(1, player.soc);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        }
        // Endurance category
        case "Endurance (Strength)": {
            let playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.str);
                earnedPoints += 1;
            }
            break;
        }
        case "Endurance (Dexterity)":
        {
            let playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.dex);
                earnedPoints += 1;
            }
            break;
        }
        case "Memory":
        {
            let playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.int);
                earnedPoints += 1;
            }
            break;
        }
        case "Elimination":
        {
            let playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.soc);
                earnedPoints += 1;
            }
            break;
        }
        // Sum combination
        case "Combination":
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.str);
            }
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.dex);
            }
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.int);
            }
            for (let x = 0; x < 4; x++) {
                earnedPoints += randomInt(1, player.soc);
            }
            break;

        default: // default to luck
            earnedPoints = randomInt(1, 20);
    }

    return earnedPoints;
}