// For modules that are commonly used between different types of simulators, i.e. CHALLENGES, TEAM SWAPS, etc.
import { randomChoice, randomInt, rollPass } from "./utils";

//Challenge: takes challenge name and player object, returns earned points based on player stats
export function challenge(challenge, player) {
    let earnedPoints = 0;

    // These are all based from my paper-based comic "Icosathlon with Stats"
    // which features short panel challenges based on different stat rolls

    switch (challenge) { // [ IwS Challenges ]
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
        case "Physical":
            var playerRoll1 = randomInt(1, player.str);
            var playerRoll2 = randomInt(1, player.dex);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        case "Puzzle":
            var playerRoll1 = randomInt(1, player.soc);
            var playerRoll2 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        case "Obstacle Course":
            var playerRoll1 = randomInt(1, player.dex);
            var playerRoll2 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        case "Coordination":
            var playerRoll1 = randomInt(1, player.str);
            var playerRoll2 = randomInt(1, player.soc);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        // Endurance category
        case "Endurance (Strength)":
            var playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.str);
                earnedPoints += 1;
            }
            break;
        case "Endurance (Dexterity)":
            var playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.dex);
                earnedPoints += 1;
            }
            break;
        case "Memory":
            var playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.int);
                earnedPoints += 1;
            }
            break;
        case "Elimination":
            var playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.soc);
                earnedPoints += 1;
            }
            break;
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