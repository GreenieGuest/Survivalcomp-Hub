import { randomInt, randomChoice } from "./utils";
import { useSimStore } from "../store/simulationStore";

// Idol types
export const IDOL_TYPES = {
    SAVIOR: 'savior', // Savior: Played before the votes are read. Nullifies all votes for the target.
    GUARDIAN_ANGEL: 'guardian', // Guardian Angel: Played AFTER the votes are read.
    HII: 'hii', // Hidden Immunity Idol: Played after votes are cast but before read. Nullifies votes against holder.
    SUPER: 'super', // Super Idol: Played after votes are read to nullify votes against holder and force re-evaluation.
}
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

// ############################################
// IDOL LOGIC
// ############################################

// ############################################
// VOTING LOGIC
// ############################################

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
    const { logEvent } = useSimStore.getState();
    let currentNominated = [...nominated];
    let currentVotingPool = [...votingPool];
    const voteLog = []; // To be used in the future for The Voting Notation

    // First Voting Pass
    let votes = castVotes(currentNominated, currentVotingPool);
    voteLog.push({ round: 'vote', tally: currentNominated.map((p, i) => ({ player: { ...p }, votes: votes[i] })) });

    // --- Idol plays: Hidden Immunity Idol (HII) ---
    // HII are played after votes are cast but BEFORE they're read. If a nominated player
    // holds an HII and has one or more votes, they will play it to nullify those votes.
    const idToIndex = Object.fromEntries(currentNominated.map((p, i) => [p.id, i]));
    for (const player of currentNominated) {
        if (!player.idols || player.idols.length === 0) continue;
        const hiiIndex = player.idols.findIndex(idol => idol && idol.type === IDOL_TYPES.HII);
        if (hiiIndex === -1) continue;
        const idx = idToIndex[player.id];
        if (votes[idx] > 0) {
            // Play HII: nullify votes against this player
            votes[idx] = 0;
            // consume the idol
            player.idols.splice(hiiIndex, 1);
            safeIds.push(player.id);
            voteLog.push({ round: 'idol_play', type: IDOL_TYPES.HII, player: { ...player } });
            logEvent({ type: 'system', message: `${player.name} played a Hidden Immunity Idol! Votes against them are nullified.` });
            console.log(`${player.name} played a Hidden Immunity Idol!`);
        }
    }

    const maxVotes = Math.max(...votes);
    const tiedIndices = votes.map((v, i) => v === maxVotes ? i : -1).filter(i => i !== -1);

    // --- Super Idol play: can be played AFTER votes are read to nullify votes for the top vote-getter ---
    if (tiedIndices.length === 1) {
        const topIdx = tiedIndices[0];
        const topPlayer = currentNominated[topIdx];
        if (topPlayer.idols && topPlayer.idols.length > 0) {
            const superIndex = topPlayer.idols.findIndex(idol => idol && idol.type === IDOL_TYPES.SUPER);
            if (superIndex !== -1) {
                // Play Super Idol: nullify all votes against topPlayer and force re-evaluation
                votes[topIdx] = 0;
                topPlayer.idols.splice(superIndex, 1);
                safeIds.push(topPlayer.id);
                voteLog.push({ round: 'idol_play', type: IDOL_TYPES.SUPER, player: { ...topPlayer } });
                logEvent({ type: 'system', message: `${topPlayer.name} played a Super Idol! Votes against them are nullified.` });
                console.log(`${topPlayer.name} played a Super Idol!`);

                // Recompute top after super idol is played
                const newMax = Math.max(...votes);
                const newTied = votes.map((v, i) => v === newMax ? i : -1).filter(i => i !== -1);
                // If new result is a single eliminated, return immediately
                if (newTied.length === 1) {
                    return { eliminated: currentNominated[newTied[0]], voteLog };
                }
                // Otherwise, fall through to the tied/revote logic below using the new ties
                // Update tiedIndices variable by overwriting (used later)
                // Note: we don't reassign tiedIndices const; instead set a new variable used below
                var postSuperTiedIndices = newTied;
                var postSuperVotes = votes;
            }
        }
    }

    // If the votes don't tie, continue as normal
    const effectiveTiedIndices = typeof postSuperTiedIndices !== 'undefined' ? postSuperTiedIndices : tiedIndices;
    if (effectiveTiedIndices.length === 1) {
        return { eliminated: currentNominated[effectiveTiedIndices[0]], voteLog };
    }

    // If they do, re-vote - tied people are removed from the voting pool and are the only choices available to vote for
    const tiedPlayers = effectiveTiedIndices.map(i => currentNominated[i]);
    if (playersRemaining === 4 && tiedPlayers.length === 2) {
        const F4FM_result = fireMakingChallenge(tiedPlayers[0], tiedPlayers[1])
        return { eliminated: F4FM_result, voteLog };
    }

    // Second Voting Pass
    currentNominated = tiedPlayers;
    currentVotingPool = votingPool.filter(p => !tiedPlayers.find(t => t.id === p.id));

    let revotes = castVotes(currentNominated, currentVotingPool);
    voteLog.push({ round: 'revote', tally: currentNominated.map((p, i) => ({ player: { ...p }, votes: revotes[i] })) });

    // Revote: allow Hidden Immunity Idol plays again (same behavior)
    const revIdToIndex = Object.fromEntries(currentNominated.map((p, i) => [p.id, i]));
    for (const player of currentNominated) {
        if (!player.idols || player.idols.length === 0) continue;
        const hiiIndex = player.idols.findIndex(idol => idol && idol.type === IDOL_TYPES.HII);
        if (hiiIndex === -1) continue;
        const idx = revIdToIndex[player.id];
        if (revotes[idx] > 0) {
            revotes[idx] = 0;
            player.idols.splice(hiiIndex, 1);
            safeIds.push(player.id);
            voteLog.push({ round: 'idol_play', type: IDOL_TYPES.HII, player: { ...player }, revote: true });
            logEvent({ type: 'system', message: `${player.name} played a Hidden Immunity Idol on revote! Votes against them are nullified.` });
            console.log(`${player.name} played a Hidden Immunity Idol on revote!`);
        }
    }

    const maxRevotes = Math.max(...revotes);
    const revoteTiedIndices = revotes.map((v, i) => v === maxRevotes ? i : -1).filter(i => i !== -1);

    // Super Idol can also be played after revote read
    if (revoteTiedIndices.length === 1) {
        const topIdx = revoteTiedIndices[0];
        const topPlayer = currentNominated[topIdx];
        if (topPlayer.idols && topPlayer.idols.length > 0) {
            const superIndex = topPlayer.idols.findIndex(idol => idol && idol.type === IDOL_TYPES.SUPER);
            if (superIndex !== -1) {
                revotes[topIdx] = 0;
                topPlayer.idols.splice(superIndex, 1);
                safeIds.push(topPlayer.id);
                voteLog.push({ round: 'idol_play', type: IDOL_TYPES.SUPER, player: { ...topPlayer }, revote: true });
                logEvent({ type: 'system', message: `${topPlayer.name} played a Super Idol on revote! Votes against them are nullified.` });
                console.log(`${topPlayer.name} played a Super Idol on revote!`);

                const newMax = Math.max(...revotes);
                const newTied = revotes.map((v, i) => v === newMax ? i : -1).filter(i => i !== -1);
                if (newTied.length === 1) {
                    return { eliminated: currentNominated[newTied[0]], voteLog };
                }
                var postSuperRevoteTied = newTied;
            }
        }
    }

    const effectiveRevoteTied = typeof postSuperRevoteTied !== 'undefined' ? postSuperRevoteTied : revoteTiedIndices;

    if (effectiveRevoteTied.length === 1) {
        return { eliminated: currentNominated[effectiveRevoteTied[0]], voteLog };
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