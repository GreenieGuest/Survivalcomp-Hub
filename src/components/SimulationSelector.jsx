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

export default SimulationSelector;