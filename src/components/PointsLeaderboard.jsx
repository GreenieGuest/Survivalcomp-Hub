import { Table } from "@chakra-ui/react"
import { suffix } from "../simulators/utils";

function calculateChange(placement, lastPlacement) {
    if (placement < lastPlacement) {
        return (
            <span style={{ color: "green" }}>↑{lastPlacement - placement}</span>
        )
    } else if (placement > lastPlacement) {
        return (
            <span style={{ color: "red" }}>↓{placement - lastPlacement}</span>
        )
    } else {
        return (
            <span style={{ color: "white" }}>-</span>
        );
    }
}

const PointsLeaderboard = ({ playerList, eliminatedList }) => {
    const lastEliminatedPlayer = eliminatedList[eliminatedList.length - 1];
    const items = playerList.map((player, index) => ({
        id: index,
        name: player.name,
        points: player.points,
        color: player.color,
        lastPlacement: player.lastPlacement
    }));

    //Reverse eliminated list to show in order of elimination
    const items2 = eliminatedList.map((player, index) => ({
        id: eliminatedList.length - index - 1,
        name: player.name,
        points: player.points,
        color: player.color,
        lastPlacement: (lastEliminatedPlayer.id == player.id) ? player.lastPlacement : null
    }));
    items2.reverse();

    return (
        <Table.Root size="sm">
        <Table.Header>
            <Table.Row>
            <Table.ColumnHeader textAlign="center">#</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Athlete</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Points</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Change</Table.ColumnHeader>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {items.map((item) => (
            <Table.Row key={item.id}>
                <Table.Cell textAlign="center">{item.id + 1}{suffix(item.id + 1)}</Table.Cell>
                <Table.Cell textAlign="center"><span style={{ color: item.color }}>{item.name}</span></Table.Cell>
                <Table.Cell textAlign="center">{item.points}</Table.Cell>
                <Table.Cell textAlign="center">{calculateChange(item.id, item.lastPlacement)}</Table.Cell>
            </Table.Row>
            ))}
            {items2.map((item) => (
            <Table.Row key={item.id} bg="red.800">
                <Table.Cell textAlign="center">{items.length + item.id + 1}{suffix(items.length + item.id + 1)}</Table.Cell>
                <Table.Cell textAlign="center"><span style={{ color: item.color }}>{item.name}</span></Table.Cell>
                <Table.Cell textAlign="center">{item.points}</Table.Cell>
                <Table.Cell textAlign="center">{item.lastPlacement ? calculateChange(items.length + item.id, item.lastPlacement) : <span style={{ color: "red" }}>ELIMINATED</span>}</Table.Cell>
            </Table.Row>
            ))}
        </Table.Body>
        </Table.Root>
        // Render eliminated players too
    )
};


export default PointsLeaderboard;