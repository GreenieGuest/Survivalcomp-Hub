import { Table, Container } from "@chakra-ui/react"
import { suffix, average } from "../simulators/utils";

import { Chart, useChart } from "@chakra-ui/charts"
import { Bar, Cell, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

const StatsTable = ({ playerStatsList, sortByMetric }) => {
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

    if (sortByMetric === "winRate" || sortByMetric === "wins") {
        // Sort by avgPlacement ascending (1st place → last)
        items.sort((a, b) => b[sortByMetric] - a[sortByMetric]);
    } else {
        // Sort by avgPlacement ascending (1st place → last)
        items.sort((a, b) => a[sortByMetric] - b[sortByMetric]);
    }


    return (
        <Container >
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

const StatsChart = ({ playerStatsList, sortByMetric }) => {
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

    if (sortByMetric === "winRate" || sortByMetric === "wins") {
        // Sort by avgPlacement ascending (1st place → last)
        items.sort((a, b) => b[sortByMetric] - a[sortByMetric]);
    } else {
        // Sort by avgPlacement ascending (1st place → last)
        items.sort((a, b) => a[sortByMetric] - b[sortByMetric]);
    }

    const chart = useChart({data: items})

    return (
        <Container mt={4} centerContent>
            <Chart.Root maxH="sm" chart={chart}>
            <BarChart data={chart.data}>
                <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
                <XAxis axisLine={false} tickLine={false} dataKey={chart.key("name")} />
                <Tooltip
                cursor={{ fill: chart.color("bg.muted") }}
                animationDuration={100}
                content={<Chart.Tooltip hideLabel={true} />}
                />
                <YAxis
                label={{ value: sortByMetric, angle: -90, position: "insideLeft" }}
                axisLine={true}
                tickLine={true}
                tickFormatter={(value) => `${value}`}
                />
                <Bar isAnimationActive={true} dataKey={chart.key(sortByMetric)}>
                {chart.data.map((item) => (
                    <Cell key={item.name} fill={chart.color(item.color)} />
                ))}
                </Bar>
            </BarChart>
            </Chart.Root>
        </Container>
    )
};

export { StatsTable, StatsChart };