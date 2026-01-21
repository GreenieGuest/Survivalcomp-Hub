export default function BanRouletteEvent({events}) {
    const event = events[events.length - 1];
    if (event.type === "system") {
        return (
            <p>{event.message}</p>
        )
    }

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
}