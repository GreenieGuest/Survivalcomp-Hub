import { Table } from "@chakra-ui/react"
import { suffix } from "../simulators/utils";

const PlacementGains = ({ playerList, eliminatedList }) => {
    const items = playerList.map((player, index) => ({
        id: index,
        name: player.name,
        points: player.points,
        color: player.color
    }));

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
            {items.map((item) => (
            <Table.Row key={item.id}>
                <Table.Cell textAlign="center">{item.id + 1}{suffix(item.id + 1)}</Table.Cell>
                <Table.Cell textAlign="center"><span style={{ color: item.color }}>{item.name}</span></Table.Cell>
                <Table.Cell textAlign="center">{item.points}</Table.Cell>
                <Table.Cell textAlign="center">{item.lastPlacement ? `${suffix(item.lastPlacement)} place` : "N/A"}</Table.Cell>
            </Table.Row>
            ))}
        </Table.Body>
        </Table.Root>
    )
};


export default PlacementGains;