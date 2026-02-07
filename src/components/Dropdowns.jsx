import { Container, Portal, Select, createListCollection, Stack, Span } from "@chakra-ui/react"
import { FaGun } from "react-icons/fa6";
import { MdOutlineLeaderboard } from "react-icons/md";
import { RiKnifeBloodLine } from "react-icons/ri";

const SimulationSelector = ({ simulation, setSimulation }) => {

  const simulations = createListCollection({
    items: [
      { label: "Ban Roulette", value: "br", description: "Every round, one random player has a limited chance of remaining in the game, otherwise they are banned.", icon: <FaGun /> },
      { label: "Algicosathlon", value: "as", description: "Athletes compete in challenges for points. The competitor with the least points is eliminated each round.", icon: <MdOutlineLeaderboard /> },
      { label: "Murder Island", value: "mi", description: "Players are randomly assigned clues. One player is chosen to be the murderer, and another is chosen to be the victim. Players vote on who they think the murderer is. The player with the most votes is executed.", icon: <RiKnifeBloodLine /> },
    ],
  })

  return (
    <Container mb={4} centerContent>
    <Select.Root collection={simulations} onChange={(e) => setSimulation(e.target.value)} size="sm" width="320px">
      <Select.HiddenSelect />
      <Select.Label>Simulation</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select simulation" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {simulations.items.map((sim) => (
              <Select.Item item={sim} key={sim.value}>
                <Stack gap="0">
                  <Select.ItemText>{sim.icon}{sim.label}</Select.ItemText>
                  <Span color="fg.muted" textStyle="xs">
                    {sim.description}
                  </Span>
                </Stack>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
    </Container>
  )
};

const MetricSelector = ({ statMetric, setStatMetric }) => {

    const metrics = createListCollection({
        items: [
            { label: "Wins", value: "wins", description: "Number of wins for each player."},
            { label: "Average Placement", value: "avgPlacement", description: "Average placement for each player."},
            { label: "Max Placement", value: "min", description: "Minimum placement for each player."},
            { label: "Min Placement", value: "max", description: "Maximum placement for each player."},
            { label: "Win Rate", value: "winRate", description: "Percentage of games won by each player."},
        ],
    })

        return (
        <Container mb={4} centerContent>
            <Select.Root collection={metrics} onChange={(e) => setStatMetric(e.target.value)} size="sm" width="320px">
                <Select.HiddenSelect />
                <Select.Label>Sort by Metric</Select.Label>
                <Select.Control>
                <Select.Trigger>
                    <Select.ValueText placeholder="Select Metric" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                    <Select.Indicator />
                </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                <Select.Positioner>
                    <Select.Content>
                    {metrics.items.map((sim) => (
                        <Select.Item item={sim} key={sim.value}>
                            {sim.label}
                        <Select.ItemIndicator />
                        </Select.Item>
                    ))}
                    </Select.Content>
                </Select.Positioner>
                </Portal>
            </Select.Root>
        </Container>
        )
    };

export { SimulationSelector, MetricSelector };