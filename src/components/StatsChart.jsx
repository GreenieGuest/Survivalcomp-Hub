import { Container } from "@chakra-ui/react"
import { Chart, useChart } from "@chakra-ui/charts"
import { suffix, average } from "../simulators/utils";
import { Bar, Cell, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Legend, Tooltip } from "recharts"

const StatsChart = ({ playerStatsList }) => {
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

    const chart = useChart({data: items,
    series: [{ name: "wins", color: "color" }],
    })

    return (
        <Container>
            <Chart.Root maxH="sm" chart={chart}>
            <BarChart data={chart.data}>
                <CartesianGrid stroke={chart.color("border.muted")} vertical={true} />
                <XAxis axisLine={false} tickLine={false} dataKey={chart.key("name")} />
                <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
                />
                <Bar isAnimationActive={true} dataKey={chart.key("wins")}>
                {chart.data.map((item) => (
                    <Cell key={item.name} fill={chart.color(item.color)} />
                ))}
                </Bar>
            </BarChart>
            </Chart.Root>
        </Container>
    )
};


export default StatsChart;