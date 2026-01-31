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
    if (event.type === "murder") {
        return (
            <div>
                <p><span style={{ color: event.victim.color }}>{event.victim.name}</span> was murdered by <span style={{ color: event.murderer.color }}>{event.murderer.name}</span>.</p>
                <p>The clues were: {event.realClue1} (Primary), {event.realClue2}, {event.fakeClue1}, and {event.fakeClue2}.</p>
                <p>The potential suspects were:</p>
                {event.potentialSus.map(p => (
                    <p key={p.id}><span style={{ color: p.color }}>{p.name}</span></p>
                ))}
                <p><span style={{ color: event.executed.color }}>{event.executed.name}</span> was executed.</p>
                <p>{event.remaining} players remain.</p>
            </div>
        );
    }
}