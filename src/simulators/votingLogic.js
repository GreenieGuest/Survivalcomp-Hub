import { randomInt, randomChoice } from "./utils";

export function physScope(player) {
    return randomInt(1, player.str);
}

export function stratScope(player) {
    return randomInt(1, player.int);
}

export function socScope(player) {
    return randomInt(1, player.soc);
}

export function notorietyScope(player) {
    return randomInt(0, player.notoriety ?? 0);
}

// Vote Weight Calculation for individual voters
// Input: Votee, Voter
// Output: Vote Weight

function getVoteWeight(candidate, voter) {
    let weight = candidate.notoriety ?? 0;
    // NEGATIVE CHECKS
    // Voting For Self
    if (candidate.id === voter.id) return -1000;
    // Voting For Allies
    if (
        voter.faction &&
        candidate.faction &&
        voter.faction === candidate.faction
    ) {
        weight -= 1000;
    }
    // Fear of Idol Play
    if (stratScope(candidate) > 3 && stratScope(voter) > 3) {
        weight -= 5;
    }

    // POSITIVE CHECKS
    // Alliance Targeting Votee
    if (voter.faction?.target?.id === candidate.id) {
        weight += 5;
    }

    return weight;
}

// Modular Voting Pass
// nominated: players who can be voted out
// votingPool: players who are voting
function castVotes(nominated, votingPool) {
    const votes = new Array(nominated.length).fill(0);
    for (const voter of votingPool) {
        const weights = nominated.map(candidate => getVoteWeight(candidate, voter));

        // Voter chooses what looks like the best move
        const maxWeight = Math.max(...weights)

        // see how many people are tied
        const topCandidates = nominated.filter((_, i) => weights[i] === maxWeight);
        // if multiple people have the same weight, decide based on random social roll
        topCandidates.sort((a, b) => socScope(a) - socScope(b));
        const votedFor = topCandidates[0];

        // Finally, cast the vote
        votes[nominated.indexOf(votedFor)] += 1;
    }

    return votes;
}

// Rock Draw Tiebreaker
// (Happens for all deadlocked ties with the exception of F4)
// Since votes tied twice, players go to rocks
// players immune but in the voting pool are spared, along with tied players

function drawRocks(tiedPlayers, votingPool, safeIds) {
    // Remove all safe players to only get valid rock drawers
    const eligible = votingPool.filter(p =>
        !safeIds.includes(p.id) &&
        !tiedPlayers.find(t => t.id === p.id)
    );

    // All Players Immune due to two idols being played, causing a deadlock
    if (eligible.length === 0) {
        const fallback = tiedPlayers.filter(p => !safeIds.includes(p.id));
        return randomChoice(fallback.length > 0 ? fallback : tiedPlayers);
    }

    return randomChoice(eligible);
}

function fireMakingChallenge(player1, player2) { // The ultimate test.
    // Mostly ripped from the spaghetti 64DITP F4FMC
    let p1Fire = 0;
    let p2Fire = 0;

    // Keep rolling stats until a player reaches 100 or both players reached 100 and one broke the tie
    while ((p1Fire < 100 && p2Fire < 100) || p1Fire === p2Fire) {
        p1Fire += physScope(player1) + stratScope(player1) + socScope(player1);
        p2Fire += physScope(player2) + stratScope(player2) + socScope(player2);
    }

    const winner = p1Fire > p2Fire ? player1 : player2;
    const loser = p1Fire > p2Fire ? player2 : player1;

    // Notoriety in this case is being used to "build credibility" for the winner due to them winning F4FM
    winner.notoriety = (winner.notoriety ?? 0) + 3;

    return loser; // returns the eliminated player
}

export function voteOut(nominated, votingPool, playersRemaining, immuneIds = []) {
    const safeIds = [...immuneIds];
    let currentNominated = [...nominated];
    let currentVotingPool = [...votingPool];
    const voteLog = []; // To be used in the future for The Voting Notation

    // First Voting Pass
    let votes = castVotes(currentNominated, currentVotingPool);
    voteLog.push({ round: 'vote', tally: currentNominated.map((p, i) => ({ player: { ...p }, votes: votes[i] })) });

    const maxVotes = Math.max(...votes);
    const tiedIndices = votes.map((v, i) => v === maxVotes ? i : -1).filter(i => i !== -1);

    // If the votes don't tie, continue as normal
    if (tiedIndices.length === 1) {
        return { eliminated: currentNominated[tiedIndices[0]], voteLog };
    }

    // If they do, re-vote - tied people are removed from the voting pool and are the only choices available to vote for
    const tiedPlayers = tiedIndices.map(i => currentNominated[i]);
    if (playersRemaining === 4 && tiedPlayers.length === 2) {
        const F4FM_result = fireMakingChallenge(tiedPlayers[0], tiedPlayers[1])
        return { eliminated: F4FM_result, voteLog };
    }

    // Second Voting Pass
    currentNominated = tiedPlayers;
    currentVotingPool = votingPool.filter(p => !tiedPlayers.find(t => t.id === p.id));

    let revotes = castVotes(currentNominated, currentVotingPool);
    voteLog.push({ round: 'revote', tally: currentNominated.map((p, i) => ({ player: { ...p }, votes: revotes[i] })) });

    const maxRevotes = Math.max(...revotes);
    const revoteTiedIndices = revotes.map((v, i) => v === maxRevotes ? i : -1).filter(i => i !== -1);

    if (revoteTiedIndices.length === 1) {
        return { eliminated: currentNominated[revoteTiedIndices[0]], voteLog };
    }

    // If votes tied twice, players go to rocks - players immune but in the voting pool are spared, along with tied players
    const eliminated = drawRocks(tiedPlayers, votingPool, safeIds);
    voteLog.push({ round: 'rocks', eliminated: { ...eliminated } });

    return { eliminated, voteLog };
}

export function juryVote(finalists, jury) {
    const votes = new Array(finalists.length).fill(0);

    for (const juror of jury) {
        const weights = finalists.map(f => {
            // Placeholder
            let w = socScope(f) + (f.notoriety ?? 0);
            return w;
        });

        const maxWeight = Math.max(...weights);
        const topCandidates = finalists.filter((_, i) => weights[i] === maxWeight);
        const votedFor = randomChoice(topCandidates);
        votes[finalists.indexOf(votedFor)] += 1;
    }

    const maxVotes = Math.max(...votes);
    const winner = finalists[votes.indexOf(maxVotes)];

    return {
        winner,
        voteLog: finalists.map((f, i) => ({ player: { ...f }, votes: votes[i] }))
    };
}