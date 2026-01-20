import { useState } from "react";
import {Button, Input, ColorPicker, Group, Tabs, Alert} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";

export default function PlayerCard({ playerList, setPlayerList }) {
    const [name, setName] = useState("");
    const [emptyMessage, setEmptyMessage] = useState(false);

    const handlePostPlayer = (e) => {
        e.preventDefault();

        if (name.length > 0) {
            // If value detected in input, create new player object and add to player list
            //More stats will be added later

            const newPlayer = {
                id: Date.now(),
                name: name,
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
        <div>
			<Group attached w="full" maxW="sm">
                <Input flex="1" placeholder="Enter player name..." value={name} width={400} onChange={(e) => setName(e.target.value)} />
                <Button bg="bg.subtle" variant="outline" type="submit" onClick={handlePostPlayer}>
                    Add Player
                </Button>
            </Group>

            {emptyMessage && (
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Title>Player name cannot be empty</Alert.Title>
                </Alert.Root>
            )}

            <Tabs.Root lazyMount unmountOnExit defaultValue="tab-1">
                <Tabs.List>
                    <Tabs.Trigger value="tab-1">Description</Tabs.Trigger>
                    <Tabs.Trigger value="tab-2">Players</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="tab-1">
                    Ban Roulette: one player gets eliminated every round!
                </Tabs.Content>
                <Tabs.Content value="tab-2">
                    <ul>
                        {playerList.map((player) => (
                            <li key={player.id}>
                                <span style={{color: player.color}}>{player.name}</span>
                                <Button variant={'outline'} size="2xs" colorPalette={'red'} onClick={() => handleDeletePlayer(player.id)}>
                                    <FaTrash /> Delete
                                </Button>
                            </li>
                        ))}
                    </ul>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
}