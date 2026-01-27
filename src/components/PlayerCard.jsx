import { useState } from "react";
import {Button, Input, Container, ColorPicker, parseColor, Portal, HStack, Group, Alert, VStack, Box} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";

export default function PlayerCard({ playerList, setPlayerList }) {
    const [name, setName] = useState("");
	const [color, setColor] = useState(parseColor("#ffffff"));
    const [emptyMessage, setEmptyMessage] = useState(false);

    const handlePostPlayer = (e) => {
        e.preventDefault();

        if (name.length > 0) {
            // If value detected in input, create new player object and add to player list
            //More stats will be added later

            const newPlayer = {
                id: Date.now(),
                name: name,
                color: color.toString('hexa'),
                str: 3,
                dex: 3,
                int: 3,
            };
            const updatedPlayerList = [...playerList, newPlayer];
            setPlayerList(updatedPlayerList);

            //Clear input field
            setName("");
            setEmptyMessage(false);
        } else {
            //show error if name, other stat, etc. is empty
            setEmptyMessage(true);
        }
    };

    const handleDeletePlayer = (id) => {
        // Handle deleting a player from the list if clicked in list
        const updatedPlayerList = playerList.filter((player) => player.id !== id);
        setPlayerList(updatedPlayerList);
    };

    return (
        <Container width={'auto'}>
			<Group attached w="full" maxW="sm">
                <Input flex="1" placeholder="Enter player name..." value={name} width={400} onChange={(e) => setName(e.target.value)} />
                <Button bg="bg.subtle" variant="outline" type="submit" onClick={handlePostPlayer}>
                    Add Player
                </Button>
                <ColorPicker.Root defaultValue={color} onValueChange={(e) => setColor(e.value)} maxW="130px">
                    <ColorPicker.HiddenInput />
                    <ColorPicker.Control>
                        {/*<ColorPicker.Input />*/}
                        <ColorPicker.Trigger />
                    </ColorPicker.Control>
                    <Portal>
                        <ColorPicker.Positioner>
                        <ColorPicker.Content>
                            <ColorPicker.Area />
                            <HStack>
                            <ColorPicker.EyeDropper size="xs" variant="outline" />
                            <ColorPicker.Sliders />
                            </HStack>
                        </ColorPicker.Content>
                        </ColorPicker.Positioner>
                    </Portal>
                </ColorPicker.Root>
            </Group>
            {emptyMessage && (
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Title>Player name cannot be empty</Alert.Title>
                </Alert.Root>
            )}
            <Container maxH="600px" scrollBehavior="smooth" overflowY="auto" mt={3}> 
                <VStack justifyContent={"center"}>
                    {playerList.map((player) => (
                        <Box key={player.id}>
                            <span style={{color: player.color}}>{player.name} </span>
                            <Button variant={'outline'} size="2xs" colorPalette={'red'} onClick={() => handleDeletePlayer(player.id)}>
                                <FaTrash /> Delete
                            </Button>
                        </Box>
                    ))}
                </VStack>
            </Container>
        </Container>
    );
}