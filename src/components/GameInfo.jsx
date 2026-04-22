import { Container, VStack, Heading, Wrap, Center, WrapItem } from "@chakra-ui/react"

const GameInfo = ({ state }) => {
    if (state.quarter == 'M') {
        return (
            <Container>
                <VStack>
                    <Heading>Merge</Heading>
                    <Wrap gap="5px" justify="center">
                        {state.currentlyPlaying.map((player, index) => (
                        <WrapItem key={index}>
                            <Center padding="2px" bg={player.color || "gray.400"} borderRadius="md" color={"black"}>
                            {player.name}
                            </Center>
                        </WrapItem>
                        ))}
                    </Wrap>
                </VStack>
            </Container>
        )
    } else {
        return (
            <Container>
                <Wrap gap="5px" justify="center">
                {state.teams.map((team, index) => (
                    <WrapItem key={index}>
                        <Center padding="2px" w="200px" bg={state.teamInfo[index].color || "gray.400"} borderRadius="md" color={"black"}>
                            <VStack>
                                <Heading>{state.teamInfo[index].name}</Heading>
                                <Wrap gap="5px" justify="center">
                                    {team.map((player, index) => (
                                    <WrapItem key={index}>
                                        <Center padding="2px" bg={player.color || "gray.400"} borderRadius="md" color={"black"}>
                                        {player.name}
                                        </Center>
                                    </WrapItem>
                                    ))}
                                </Wrap>
                            </VStack>
                        </Center>
                    </WrapItem>
                ))}
                </Wrap>
            </Container>
        )
    }
};

export default GameInfo;