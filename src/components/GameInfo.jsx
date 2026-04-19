import { Container, Box, Heading, Wrap, Center, WrapItem } from "@chakra-ui/react"

const GameInfo = ({ state }) => {
    return (
        <Container>
            {state.teams.map((team, index) => (
                <Box>
                    <Heading color={state.teamInfo[index].color}>{state.teamInfo[index].name}</Heading>
                    <Wrap gap="5px" justify="center">
                        {team.map((player, index) => (
                        <WrapItem key={index}>
                            <Center padding="2px" bg={player.color || "gray.400"} borderRadius="md" color={"black"}>
                            {player.name}
                            </Center>
                        </WrapItem>
                        ))}
                    </Wrap>
                </Box>
            ))}
        </Container>
    )
};

export default GameInfo;