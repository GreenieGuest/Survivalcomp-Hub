import { Table } from "@chakra-ui/react"
import { suffix } from "../simulators/utils";

const PlacementGains = ({ playerList, lastEliminatedPlayer }) => {
    if (lastEliminatedPlayer == null) {
        return <div>No placements available yet.</div>;
    }

    const items = [...playerList, lastEliminatedPlayer].map((player, index) => ({
        id: index,
        name: player.name,
        color: player.color,
        score: player.score,
        gains: player.gains
    }))
    // Sort by score descending (1st place → last)
    .sort((a, b) => b.score - a.score);

    return (
        <Table.Root size="sm">
        <Table.Header>
            <Table.Row>
            <Table.ColumnHeader textAlign="center">#</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Athlete</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Score</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Gains</Table.ColumnHeader>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {items.map((item, index) => (
            <Table.Row key={item.id}>
                <Table.Cell textAlign="center">{index + 1}{suffix(index + 1)}</Table.Cell>
                <Table.Cell textAlign="center"><span style={{ color: item.color }}>{item.name}</span></Table.Cell>
                <Table.Cell textAlign="center">{item.score}</Table.Cell>
                <Table.Cell textAlign="center">+{item.gains} points</Table.Cell>
            </Table.Row>
            ))}
        </Table.Body>
        </Table.Root>
    )
};


export default PlacementGains;