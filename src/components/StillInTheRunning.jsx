import { Container, Heading, Wrap, Center, WrapItem } from "@chakra-ui/react"

const StillInTheRunning = ({ playerList }) => {
    return (
        <Container>
            <Heading>Still in the Running</Heading>
            <Wrap gap="5px" justify="center">
                {playerList.map((player, index) => (
                <WrapItem key={index}>
                    <Center padding="2px" bg={player.color || "gray.600"} borderRadius="md" mixBlendMode="difference">
                    {player.name}
                    </Center>
                </WrapItem>
                ))}
            </Wrap>
        </Container>
    )
};

export default StillInTheRunning;