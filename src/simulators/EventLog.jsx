import { Text, Box, VStack, HStack, Separator, Table } from "@chakra-ui/react";
import { useSimStore } from "../store/simulationStore";
import { suffix } from "../simulators/utils"

// Two types of events: preset (allows for more components to be used also)
// and plain player-and-string events (for simpler events like "Player A has been eliminated")
// differentiate by adding type

function Player({ player }) {
    return <span style={{ color: player.color, fontWeight: "bold" }}>{player.name}</span>;
}

function SectionHeader({ label }) {
    return (
        <HStack my={2}>
            <Separator flex="1" />
            <Text fontSize="xs" color="fg.muted" fontWeight="bold" flexShrink="0">
                {label.toUpperCase()}
            </Text>
            <Separator flex="1" />
        </HStack>
    );
}

function EventEntry({event}) {
    if (event.type === "header") {
        return (
            <SectionHeader label={event.label} />
        )
    }

    if (event.type === "system") {
        return (
            <Text>{event.message}</Text>
        )
    }

    // Ban Roulette Events
    if (event.type === "ban") {
        return (
            <Box>
                <Text>The gun is passed to <Player player={event.chosen} />.</Text>
                <Text>The chance is {6 - event.chance} out of 6.</Text>
                <Text>...</Text>
                <Text fontWeight="bold">{event.survived ? "*click*" : "BANG."}</Text>
                <Text>{event.remaining} players remain.</Text>
            </Box>
        );
    }

    // Algicosathlon Events
    if (event.type === "challengeResults") {
        return (
            <Box>
                <Text fontWeight="bold">Challenge: {event.challengeName}</Text>
                <Table.Root size="sm" mt={1}>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader textAlign="center">#</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">Athlete</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">Score</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">Gains</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {event.results.map((r, i) => (
                            <Table.Row key={i}>
                                <Table.Cell textAlign="center">{i + 1}{suffix(i + 1)}</Table.Cell>
                                <Table.Cell textAlign="center"><Player player={r.player} /></Table.Cell>
                                <Table.Cell textAlign="center">{r.score}</Table.Cell>
                                <Table.Cell textAlign="center">+{r.gained} points</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>
        );
    }

    if (event.type === "algoElim") {
        return (
            <Text>
                <Player player={event.chosen} /> has been eliminated with {event.chosen.points} points. {event.remaining} remain.
            </Text>
        )
    }

    // Murder Island Events
    if (event.type === "murderIslandStart") {
        return (
            <Box>
                <Text>{event.message}</Text>
                <Text fontWeight="bold" mt={1}>Suspect Profiles</Text>
                {event.players.map(p => (
                    <Text key={p.id}><Player player={p} /> - {p.clues.join(", ")}</Text>
                ))}
            </Box>
        );
    }
    if (event.type === "murder") {
        return (
            <Box>
                <Text><Player player={event.victim} /> was discovered dead. They were killed by an unknown murderer!</Text>

                <Text mt={2}>It seems the murderer has left clues behind...</Text>
                <Text>The clues were: {event.realClue1} (Primary), {event.realClue2}, {event.fakeClue1}, and {event.fakeClue2}.</Text>

                <Text mt={2}>Gather around the table, everyone. We have a murderer to find.</Text>
                <Text>Let's now point fingers using the evidence to decide who the killer was...</Text>

                <Text mt={2}>Potential suspects:</Text>
                {event.potentialSus.map(p => (
                    <p key={p.id}><Player player={p} /> - {p.clues.join(", ")}</Text>
                ))}

                <Text mt={2}>The players who are not potential suspects will now vote for the killer.</Text>
                <Text><Player player={event.executed} /> has been nominated for execution.</Text>
                <Text>The killer was <Player player={event.murderer} />!</Text>
                <Text>{event.remaining} players remain.</Text>
            </Box>
        );
    }

    if (Array.isArray(event)) {
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
    return null;
}

export default function EventLog() {
    const events = useSimStore(state => state.events)

    return events.map((event, i) => <EventEntry key={i} event={event} />)
}