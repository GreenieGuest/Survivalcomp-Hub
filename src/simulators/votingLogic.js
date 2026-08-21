import { randomInt, randomChoice } from "./utils";
import { useSimStore } from "../store/simulationStore";
import default_factions from "../constants/defaultFactions";

const { logEvent } = useSimStore.getState();

// Idol types
export const IDOL_TYPES = {
    HII: 'hii', // Hidden Immunity Idol: Played before the votes are read. Nullifies all votes for the target.
    SUPER: 'super', // Super Idol: Played AFTER the votes are read. Either eliminates second-most-highest voted player or forces a tie.
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

function consumeIdol(player, idolType) {
    const idx = player.idols.findIndex(i => i?.type === idolType);
    // if idol not found do nothing
    if (idx === -1) return player;
    // if idol is found only remove the specific one that was counted as found
    return { ...player, idols: player.idols.filter((_, i) => i !== idx) };
}

// applies idol consumption to a nominated array immutably
function applyConsumedIdol(nominated, playerId, idolType) {
    return nominated.map(p => p.id === playerId ? consumeIdol(p, idolType) : p);
}

function resolveHII(nominated, votes, safeIds, turn) {
    let updatedNominated = [...nominated];
    let updatedVotes = [...votes];
    let updatedSafe = [...safeIds];
    const idToIndex = Object.fromEntries(nominated.map((p, i) => [p.id, i]));
 
    for (const player of nominated) {
        if (!player.idols?.length) continue;
        const hasHII = player.idols.find(i => i?.type === IDOL_TYPES.HII);
        if (!hasHII) continue;
        const idx = idToIndex[player.id];
        if (updatedVotes[idx] > 0) {
            updatedVotes[idx] = 0;
            updatedNominated = applyConsumedIdol(updatedNominated, player.id, IDOL_TYPES.HII);
            updatedSafe = [...updatedSafe, player.id];
            logEvent({ type: 'idolPlay', player: { ...player }, idolType: IDOL_TYPES.HII }, turn);
        }
    }
 
    return { votes: updatedVotes, nominated: updatedNominated, safeIds: updatedSafe };
}

function resolveSuper(nominated, votes, safeIds, topIdx, turn) {
    const topPlayer = nominated[topIdx];
    if (!topPlayer.idols?.find(i => i?.type === IDOL_TYPES.SUPER)) {
        return null; // no super idol, nothing to do
    }
 
    let updatedVotes = [...votes];
    let updatedNominated = applyConsumedIdol([...nominated], topPlayer.id, IDOL_TYPES.SUPER);
    let updatedSafe = [...safeIds, topPlayer.id];
    updatedVotes[topIdx] = 0;
 
    logEvent({ type: 'idolPlay', player: { ...topPlayer }, idolType: IDOL_TYPES.SUPER }, turn);
 
    return { votes: updatedVotes, nominated: updatedNominated, safeIds: updatedSafe };
}

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

function fireMakingChallenge(player1, player2, turn) { // The ultimate test.
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
    const updatedWinner = { ...winner, notoriety: (winner.notoriety ?? 0) + 3 };
    logEvent({ type: 'fireMaking', winner: updatedWinner, loser: { ...loser }, p1Score: p1Fire, p2Score: p2Fire }, turn);
    return { loser, updatedWinner }; // return loser and updated winner
}

export function voteOut(nominated, votingPool, playersRemaining, immuneIds = [], turn = 0) {
    let safeIds = [...immuneIds];
    let currentNominated = [...nominated];
    let currentVotingPool = [...votingPool];
    const voteLog = []; // To be used in the future for The Voting Notation

    // First Voting Pass
    let votes = castVotes(currentNominated, currentVotingPool);
    voteLog.push({ round: 'vote', tally: currentNominated.map((p, i) => ({ player: { ...p }, votes: votes[i] })) });

    // Standard Hidden Immunity Idol Play
    // "If anybody has a Hidden Immunity Idol and you want to play it... now would be the time to do so."
    ({ votes, nominated: currentNominated, safeIds } = resolveHII(currentNominated, votes, safeIds, turn));

    let maxVotes = Math.max(...votes);
    let tiedIndices = votes.map((v, i) => v === maxVotes ? i : -1).filter(i => i !== -1);

    // --- Super Idol play: can be played AFTER votes are read to nullify votes for the top vote-getter ---
    if (tiedIndices.length === 1) {
        const superResult = resolveSuper(currentNominated, votes, safeIds, tiedIndices[0], turn);
        if (superResult) {
            ({ votes, nominated: currentNominated, safeIds } = superResult);
            maxVotes = Math.max(...votes);
            tiedIndices = votes.map((v, i) => v === maxVotes ? i : -1).filter(i => i !== -1);
        }
    }

    // If the votes don't tie, continue as normal
    if (tiedIndices.length === 1) {
        const elim = currentNominated[tiedIndices[0]];
        return { eliminated: elim, voteLog, updatedNominated: currentNominated };
    }

    // If they do, re-vote - tied people are removed from the voting pool and are the only choices available to vote for
    let tiedPlayers = tiedIndices.map(i => currentNominated[i]);
    if (playersRemaining === 4 && tiedPlayers.length === 2) {
        const { loser, updatedWinner } = fireMakingChallenge(tiedPlayers[0], tiedPlayers[1], turn);
        voteLog.push({ round: 'firemaking' });
        return { eliminated: { ...loser }, voteLog, updatedNominated: currentNominated, updatedWinner };
    }

    // Second Voting Pass
    let revoteNominated = tiedPlayers;
    const revotePool = votingPool.filter(p => !tiedPlayers.find(t => t.id === p.id));

    let revotes = castVotes(revoteNominated, revotePool);
    voteLog.push({ round: 'revote', tally: revoteNominated.map((p, i) => ({ player: { ...p }, votes: revotes[i] })) });

    // do NOT allow hidden immunity idol plays in revotes

    let maxRevotes = Math.max(...revotes);
    let revoteTied = revotes.map((v, i) => v === maxRevotes ? i : -1).filter(i => i !== -1);

    // EVER
    // not even 64ditp works like that and it has crazy twists

    if (revoteTied.length === 1) {
        return { eliminated: { ...revoteNominated[revoteTied[0]] }, voteLog, updatedNominated: currentNominated };
    }

    // If votes tied twice, players go to rocks - players immune but in the voting pool are spared, along with tied players
    const eliminated = drawRocks(tiedPlayers, currentVotingPool, safeIds);
    voteLog.push({ round: 'rocks', eliminated: { ...eliminated } });

    return { eliminated: { ...rocksElim }, voteLog, updatedNominated: currentNominated };
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

// ############################################
// FACTION LOGIC
// ############################################

export function runCampEvents(players, turn) {
    let updatedPlayers = players.map(p => ({ ...p }));
 
    for (let i = 0; i < updatedPlayers.length; i++) {
        const player = updatedPlayers[i];
        const event = rollCampEvent(player, updatedPlayers, turn);
        if (!event) continue;
 
        // Apply state changes returned by the event
        if (event.updatedPlayers) {
            updatedPlayers = event.updatedPlayers;
        }
    }
 
    return updatedPlayers;
}

function rollCampEvent(player, allPlayers, turn) {
    // Weight each possible event by relevant stat
    const events = [
        { weight: player.soc, fn: tryFormAlliance },
        { weight: player.soc, fn: tryFractureAlliance },
        { weight: player.int, fn: tryUpdateTarget },
        { weight: Math.floor((player.str + (player.dex ?? 0)) / 2), fn: tryPhysicalEvent },
        { weight: player.soc, fn: trySocialEvent },
        { weight: 2, fn: () => null }, // do nothing (idle)
    ];
 
    const total = events.reduce((sum, e) => sum + e.weight, 0);
    let roll = randomInt(1, total);
    for (const e of events) {
        roll -= e.weight;
        if (roll <= 0) return e.fn(player, allPlayers, turn);
    }
    return null;
}

function tryFormAlliance(player, allPlayers, turn) {
    // Only high-soc players without a faction attempt to form one
    if (player.faction) return null;
    if (socScope(player) < Math.ceil(player.soc * 0.6)) return null;
 
    const eligible = allPlayers.filter(p =>
        p.id !== player.id && !p.faction && socScope(p) >= Math.ceil(p.soc * 0.4)
    );
    if (eligible.length === 0) return null;
 
    const ally = randomChoice(eligible);
    const factionId = `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const factionName = randomChoice(default_factions);
    const faction = { id: factionId, name: factionName, target: null };
 
    logEvent({ type: 'allianceForm', leader: { ...player }, ally: { ...ally }, name: factionName }, turn);
 
    return {
        updatedPlayers: allPlayers.map(p => {
            if (p.id === player.id || p.id === ally.id) return { ...p, faction };
            return p;
        })
    };
}

function tryFractureAlliance(player, allPlayers, turn) {
    if (!player.faction) return null;
    // Low-strat players may get cold feet
    if (stratScope(player) >= Math.ceil(player.int * 0.4)) return null;
 
    logEvent({ type: 'allianceFracture', player: { ...player }, factionName: player.faction.name }, turn);
 
    return {
        updatedPlayers: allPlayers.map(p =>
            p.id === player.id ? { ...p, faction: null } : p
        )
    };
}

function tryUpdateTarget(player, allPlayers, turn) {
    if (!player.faction) return null;
 
    // Pick the highest-notoriety outsider as the new target
    const outsiders = allPlayers.filter(p => p.faction?.id !== player.faction.id);
    if (outsiders.length === 0) return null;
 
    const target = outsiders.reduce((top, p) =>
        (p.notoriety ?? 0) > (top.notoriety ?? 0) ? p : top
    );
 
    // Update all faction members' target
    return {
        updatedPlayers: allPlayers.map(p =>
            p.faction?.id === player.faction.id
                ? { ...p, faction: { ...p.faction, target } }
                : p
        )
    };
}

function tryPhysicalEvent(player, allPlayers, turn) {
    const events = [
        `${player.name} goes for a morning run to stay sharp.`,
        `${player.name} practices their strength in the camp.`,
        `${player.name} finds a comfortable spot to rest and recover.`,
    ];
    logEvent({ type: 'campEvent', player: { ...player }, message: randomChoice(events) }, turn);
    return null;
}
 
function trySocialEvent(player, allPlayers, turn) {
    const others = allPlayers.filter(p => p.id !== player.id);
    if (others.length === 0) return null;
    const target = randomChoice(others);
 
    const events = [
        `${player.name} shares a meal with ${target.name}.`,
        `${player.name} and ${target.name} have a long conversation by the fire.`,
        `${player.name} checks in on ${target.name} to see how they're doing.`,
    ];
    logEvent({ type: 'campEvent', player: { ...player }, message: randomChoice(events) }, turn);
    return null;
}