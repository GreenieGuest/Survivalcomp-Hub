import { Table } from "@chakra-ui/react"
import { suffix, average } from "../simulators/utils";

const StatsTable = ({ playerStatsList }) => {
    const items = Object.values(playerStatsList).map((player, index) => ({
        id: index,
        name: player.object.name,
        color: player.object.color,
        placements: player.placements,
        wins: player.wins,
        avgPlacement: average(player.placements)
    }))
    // Sort by avgPlacement ascending (1st place → last)
    .sort((a, b) => a.avgPlacement - b.avgPlacement);

    return (
        <Table.Root size="sm">
        <Table.Header>
            <Table.Row>
            <Table.ColumnHeader textAlign="center">#</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Player</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Average Placement</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Wins</Table.ColumnHeader>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {items.map((item, index) => (
            <Table.Row key={item.id}>
                <Table.Cell textAlign="center">{index + 1}{suffix(index + 1)}</Table.Cell>
                <Table.Cell textAlign="center"><span style={{ color: item.color }}>{item.name}</span></Table.Cell>
                <Table.Cell textAlign="center">{item.avgPlacement.toFixed(2)}</Table.Cell>
                <Table.Cell textAlign="center">{item.wins}</Table.Cell>
            </Table.Row>
            ))}
        </Table.Body>
        </Table.Root>
        // Render eliminated players too
    )
};


export default StatsTable;