import { Table, Container } from "@chakra-ui/react"
import { suffix, average } from "../simulators/utils";

const StatsTable = ({ playerStatsList }) => {
    const items = Object.values(playerStatsList).map((player, index) => ({
        id: index,
        name: player.object.name,
        color: player.object.color,
        placements: player.placements,
        wins: player.wins,
        avgPlacement: average(player.placements),
        max: Math.max(...player.placements),
        min: Math.min(...player.placements),
        winRate: player.wins / player.placements.length * 100,
    }))
    // Sort by avgPlacement ascending (1st place → last)
    .sort((a, b) => a.avgPlacement - b.avgPlacement);

    return (
        <Container>
            <Table.Root size="sm">
            <Table.Header>
                <Table.Row>
                <Table.ColumnHeader textAlign="center">#</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">Player</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">Avg</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">Min</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">Max</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">Wins</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">Win Rate</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {items.map((item, index) => (
                <Table.Row key={item.id}>
                    <Table.Cell textAlign="center">{index + 1}{suffix(index + 1)}</Table.Cell>
                    <Table.Cell textAlign="center"><span style={{ color: item.color }}>{item.name}</span></Table.Cell>
                    <Table.Cell textAlign="center">{item.avgPlacement.toFixed(2)}</Table.Cell>
                    <Table.Cell textAlign="center">{item.max}</Table.Cell>
                    <Table.Cell textAlign="center">{item.min}</Table.Cell>
                    <Table.Cell textAlign="center">{item.wins}</Table.Cell>
                    <Table.Cell textAlign="center">{item.winRate.toFixed(2)}%</Table.Cell>
                </Table.Row>
                ))}
            </Table.Body>
            </Table.Root>
        </Container>
    )
};


export default StatsTable;