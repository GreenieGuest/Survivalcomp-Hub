import { useState } from "react";
import { Table, Container, createListCollection } from "@chakra-ui/react"
import { suffix } from "../simulators/utils";
import { MiscSelector } from "./Dropdowns.jsx";

import { BarList, useChart } from "@chakra-ui/charts";

import { Chart } from "@chakra-ui/charts"
import { Bar, Cell, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, LabelList} from "recharts"

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

const PointsChart = ({ playerList, eliminatedList }) => {
    const lastEliminatedPlayer = eliminatedList[eliminatedList.length - 1];

    var leaderboardPlayers = null;
    if (lastEliminatedPlayer) {
        leaderboardPlayers = [...playerList, lastEliminatedPlayer];
    } else {
        leaderboardPlayers = [...playerList];
    }

    if (playerList.length == 0 && eliminatedList.length == 0) {
        return (
        <p>No graph to display!</p>
        )
    }
    

    const items = leaderboardPlayers.map((player, index) => ({
        id: (index + 1)+suffix(index + 1),
        name: player.name,
        points: player.points,
        color: player.color,
        lastPlacement: player.lastPlacement
    }));

      const chart = useChart({
    data: items,
    series: [
      { name: "points", color: "yellow.solid", stackId: "a" },
    ],
  })

    return (
        <Container mt={4} centerContent>
            <Chart.Root maxH="sm" chart={chart}>
            <BarChart layout="vertical" data={chart.data}>
                <CartesianGrid stroke={chart.color("border.muted")} vertical={false} horizontal={false} />
                <XAxis type="number" hide/>
                <Tooltip
                cursor={{ fill: chart.color("bg.muted") }}
                animationDuration={100}
                content={
                    <Chart.Tooltip
                    labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.name
                    }
                    />
                }
                />
                <YAxis type="category" hide/>
                <Bar isAnimationActive={true} dataKey="points">
                    <LabelList dataKey="id" position="left" fill="gray"/>
                    <LabelList dataKey="name" position="right" />
                    <LabelList dataKey="points" position="insideRight" fill="black" />
                    {chart.data.map((item, index) => (
                        <Cell key={index} fill={item.color} />
                    ))}
                </Bar>
            </BarChart>
            </Chart.Root>
        </Container>
    )
};

const LeaderboardsDisplay = ({ playerList, eliminatedList }) => {
    const [displayType, setDisplayType] = useState('table');

    const displays = createListCollection({
        items: [
            { label: "Table", value: "table"},
            { label: "Chart", value: "chart"},
        ],
    })

    return (
        <Container centerContent>
            <MiscSelector options={displays} title="Display" state={displayType} setState={setDisplayType} />
            {displayType === 'chart' ? <PointsChart playerList={playerList} eliminatedList={eliminatedList} /> : <PointsLeaderboard playerList={playerList} eliminatedList={eliminatedList} />}
        </Container>
    )
}

export { PointsLeaderboard, PointsChart, LeaderboardsDisplay };