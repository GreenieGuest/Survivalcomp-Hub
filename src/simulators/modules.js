// For modules that are commonly used between different types of simulators, i.e. CHALLENGES, TEAM SWAPS, etc.
import { randomChoice, randomInt, rollPass } from "./utils";

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
        case "Obstacle Course":
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
        case "Maxing":
            var playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.str);
                earnedPoints += 1;
            }
            break;
        case "The FitnessGram Pacer Test":
            var playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.dex);
                earnedPoints += 1;
            }
            break;
        case "The ASCI Spelling Bee":
            var playerRoll = 1;
            while (playerRoll > 0) {
                playerRoll = randomInt(0, player.int);
                earnedPoints += 1;
            }
            break;
        // Multiplication category
        case "Pole Vault":
            var playerRoll1 = randomInt(1, player.str);
            var playerRoll2 = randomInt(1, player.dex);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        case "Juggling":
            var playerRoll1 = randomInt(1, player.dex);
            var playerRoll2 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        case "Robot Takedown":
            var playerRoll1 = randomInt(1, player.str);
            var playerRoll2 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2);
            break;
        case "Mechanical Bull":
            var playerRoll1 = randomInt(1, player.str);
            var playerRoll2 = randomInt(1, player.dex);
            var playerRoll3 = randomInt(1, player.int);
            earnedPoints = (playerRoll1 * playerRoll2 * playerRoll3);
            break;
        case "Shot Put": // Most complex challenge of IwS
            var strRoll1 = randomInt(1, player.str);
            var strRoll2 = randomInt(1, player.str);
            var dexRoll1 = randomInt(1, player.dex);
            var dexRoll2 = randomInt(1, player.dex);
            var intRoll = randomInt(1, player.int);
            var intPoints = 0;
            while (intRoll > 0) {
                intRoll = randomInt(0, player.int);
                intPoints += 1;
            }
            earnedPoints = (strRoll1 + strRoll2) + (dexRoll1 * dexRoll2) + intPoints;
            break;
        case "Dogfighting": // Multiplication of additions
            var strRoll1 = randomInt(1, player.str);
            var strRoll2 = randomInt(1, player.str);
            var dexRoll1 = randomInt(1, player.dex);
            var dexRoll2 = randomInt(1, player.dex);
            var intRoll1 = randomInt(1, player.int);
            var intRoll2 = randomInt(1, player.int);
            earnedPoints = (strRoll1 + strRoll2) * (dexRoll1 + dexRoll2) * (intRoll1 + intRoll2);
            break;
        case "Triathalon": // Addition of multiplications
            var strRoll1 = randomInt(1, player.str);
            var strRoll2 = randomInt(1, player.str);
            var dexRoll1 = randomInt(1, player.dex);
            var dexRoll2 = randomInt(1, player.dex);
            var intRoll1 = randomInt(1, player.int);
            var intRoll2 = randomInt(1, player.int);
            earnedPoints = (strRoll1 * strRoll2) + (dexRoll1 * dexRoll2) + (intRoll1 * intRoll2);
            break;
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

        // 64DITP Challenges, for when that day comes...
        default: // default to luck
            earnedPoints = randomInt(1, 20);
    }

    return earnedPoints;
}