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
            <p><span style={{ color: event.chosen.color }}>{event.chosen.name}</span> is been eliminated with {event.chosen.points} points.</p>
            <p>{event.remaining} players remain.</p>
        </div>
    );
    
    
  }
}