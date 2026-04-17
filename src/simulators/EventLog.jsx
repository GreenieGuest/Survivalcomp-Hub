import { Text, Box } from "@chakra-ui/react";

// Two types of events: preset (allows for more components to be used also)
// and plain player-and-string events (for simpler events like "Player A has been eliminated")
// differentiate by adding type

function Player({player}) {
    return <span style={{ color: player.color, fontWeight: "bold" }}>{player.name}</span>;
}

export default function EventLog({events}) {
    const event = events[events.length - 1];
    if (event.type === "system") {
        return (
            <p>{event.message}</p>
        )
    }

    // Ban Roulette Events
    if (event.type === "ban") {
        return (
            <div>
                <p>The gun is passed to <Player player={event.chosen} />.</p>
                <p>The chance is {6 - event.chance} out of 6.</p>
                <p>...</p>
                <strong>{event.survived ? "*click*" : "BANG."}</strong>
                <p>{event.remaining} players remain.</p>
            </div>
        );
    }

    // Algicosathlon Events
    if (event.type === "algoElim") {
        return (
            <div>
                <p>Challenge: {event.challenge}</p>
                <p><Player player={event.chosen} /> has been eliminated with {event.chosen.points} points.</p>
                <p>{event.remaining} players remain.</p>
            </div>
        );
    }

    // Murder Island Events
    if (event.type === "murderIslandStart") {
        return (
            <div>
                <p>{event.message}</p>
                <h1>Suspect Profiles</h1>
                {event.players.map(p => (
                    <p key={p.id}><Player player={p} /> - {p.clues.join(", ")}</p>
                ))}
            </div>
        );
    }
    if (event.type === "murder") {
        return (
            <div>
                <p><Player player={event.victim} /> was discovered dead. They were killed by an unknown murderer!</p>
                <br/>
                <p>It seems the murderer has left clues behind...</p>
                <p>The clues were: {event.realClue1} (Primary), {event.realClue2}, {event.fakeClue1}, and {event.fakeClue2}.</p>
                <br/>
                <p>Gather around the table, everyone. We have a murderer to find.</p>
                <p>Let's now point fingers using the evidence to decide who the killer was...</p>
                <br/>
                <p>Potential suspects:</p>
                {event.potentialSus.map(p => (
                    <p key={p.id}><Player player={p} /> - {p.clues.join(", ")}</p>
                ))}
                <br/>
                <p>The players who are not potential suspects will now vote for the killer.</p>
                <p><Player player={event.executed} /> has been nominated for execution.</p>
                <p>The killer was <Player player={event.murderer} />!</p>
                <p>{event.remaining} players remain.</p>
            </div>
        );
    }

    if (typeof(event) === "object" && event.type === undefined) {
        // Plain player-and-string event
        return (
        <Text>
            {event.map((p, i) => {
                if (typeof p === "object" && p.name && p.color) {
                    return <Player key={i} player={p} />;
                } else {
                    return <span key={i}>{p}</span>;
                }
            })}
        </Text>
        )
    }
}