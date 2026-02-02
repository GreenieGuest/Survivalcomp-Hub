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
                <p>The gun is passed to <span style={{ color: event.chosen.color }}>{event.chosen.name}</span>.</p>
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
                <p><span style={{ color: event.chosen.color }}>{event.chosen.name}</span> has been eliminated with {event.chosen.points} points.</p>
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
                    <p key={p.id}><span style={{ color: p.color }}>{p.name}</span> - {p.clues.join(", ")}</p>
                ))}
            </div>
        );
    }
    if (event.type === "murder") {
        return (
            <div>
                <p><span style={{ color: event.victim.color }}>{event.victim.name}</span> was discovered dead. They were killed by an unknown murderer!</p>
                <br/>
                <p>It seems the murderer has left clues behind...</p>
                <p>The clues were: {event.realClue1} (Primary), {event.realClue2}, {event.fakeClue1}, and {event.fakeClue2}.</p>
                <br/>
                <p>Gather around the table, everyone. We have a murderer to find.</p>
                <p>Let's now point fingers using the evidence to decide who the killer was...</p>
                <br/>
                <p>Potential suspects:</p>
                {event.potentialSus.map(p => (
                    <p key={p.id}><span style={{ color: p.color }}>{p.name}</span> - {p.clues.join(", ")}</p>
                ))}
                <br/>
                <p>The players who are not potential suspects will now vote for the killer.</p>
                <p><span style={{ color: event.executed.color }}>{event.executed.name}</span> has been nominated for execution.</p>
                <p>The killer was <span style={{ color: event.murderer.color }}>{event.murderer.name}</span>!</p>
                <p>{event.remaining} players remain.</p>
            </div>
        );
    }
}