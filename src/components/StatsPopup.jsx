import { ColorPicker, parseColor, Button, HStack, Input, Popover, Portal, Text, VStack, NumberInput} from "@chakra-ui/react";
import {useState} from "react";
import { isColorHex, isColorRGBA } from "../simulators/utils";

function checkColor(input) {
    if (isColorRGBA(input)) {
        return input;
    } else if (isColorHex(input)) {
        return input+"FF"; // Add full opacity if hex code provided
    } else {
        return "#FFFFFFFF"; // Default to white if invalid (looking at you, CSS)
    }
}

const StatsCell = ({currentProfile, setPlayerList}) => {
    // Universal Stats
    const [name, setName] = useState(currentProfile.name || "Unnamed Player");
	const [color, setColor] = useState(parseColor(checkColor(currentProfile.color || "#ffffff")));
    const [str, setStr] = useState(String(currentProfile.str || 3)); // Convert to string because of Chakra UI constraints
    const [dex, setDex] = useState(String(currentProfile.dex || 3));
    const [int, setInt] = useState(String(currentProfile.int || 3));
    const [soc, setSoc] = useState(String(currentProfile.soc || 3));

    //Sim-specific stats
    const [clues, setClues] = useState(currentProfile.clues || []);

    //Used for popover
    const [emptyMessage, setEmptyMessage] = useState(false);
    const [open, setOpen] = useState(false);

    const handleTrackClick = async () => {
        setOpen(false);
    };

    return (
            <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)} lazyMount unmountOnExit>
                <Popover.Trigger asChild>
                    <span style={{color: currentProfile.color}}>{currentProfile.name}</span>
                </Popover.Trigger>
                <Portal>
                    <Popover.Positioner>
                        <Popover.Content>
                            <Popover.Arrow />
                            <Popover.Body>
                                <Popover.Title textAlign="center" fontWeight="bold" color={currentProfile.color} mb={1}>{`Editing ${currentProfile.name}'s Profile`}</Popover.Title>

                                <Text textAlign="center" fontWeight="medium">Name & Color</Text>
                                <HStack alignItems={'baseline'} mb={2} gap={1}>
                                    <Input placeholder={currentProfile.name} onChange={(e) => setName(e.target.value)} width="250px"/>
                                
                                    <ColorPicker.Root defaultValue={color} onValueChange={(e) => setColor(e.value)}>
                                        <ColorPicker.HiddenInput />
                                        <ColorPicker.Control>
                                            <ColorPicker.Input />
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
                                </HStack>

                                <Text textAlign="center" fontWeight="medium">Challenge Ability</Text>
                                <HStack justify="center">
                                    <VStack>
                                        <Text fontSize="xs" color="red.400">Strength</Text>
                                        <NumberInput.Root width="60px" defaultValue={currentProfile.str || '3'} onValueChange={(details) => setStr(details.value)} min={1} max={6} colorPalette={"red"}>
                                            <NumberInput.Control />
                                            <NumberInput.Input />
                                        </NumberInput.Root>
                                    </VStack>
                                    <VStack>
                                        <Text fontSize="xs" color="orange.400">Dexterity</Text>
                                        <NumberInput.Root width="60px" defaultValue={currentProfile.dex || '3'} onValueChange={(details) => setDex(details.value)} min={1} max={6} colorPalette={"orange"}>
                                            <NumberInput.Control />
                                            <NumberInput.Input />
                                        </NumberInput.Root>
                                    </VStack>
                                    <VStack>
                                        <Text fontSize="xs" color="blue.400">Intelligence</Text>
                                        <NumberInput.Root width="60px" defaultValue={currentProfile.int || '3'} onValueChange={(details) => setInt(details.value)} min={1} max={6} colorPalette={"blue"}>
                                            <NumberInput.Control />
                                            <NumberInput.Input />
                                        </NumberInput.Root>
                                    </VStack>
                                    <VStack>
                                        <Text fontSize="xs" color="purple.400">Social</Text>
                                        <NumberInput.Root width="60px" defaultValue={currentProfile.soc || '3'} onValueChange={(details) => setSoc(details.value)} min={1} max={6} colorPalette={"purple"}>
                                            <NumberInput.Control />
                                            <NumberInput.Input />
                                        </NumberInput.Root>
                                    </VStack>
                                </HStack>

                                <HStack justify="center">
                                    <Button mt={4} onClick={() => {
                                        const newProfile = {...currentProfile};
                                        newProfile.name = name;
                                        newProfile.color = color.toString('hexa');
                                        newProfile.str = Number(str);
                                        newProfile.dex = Number(dex);
                                        newProfile.int = Number(int);
                                        newProfile.soc = Number(soc);
                                        setPlayerList(prevList => prevList.map(p => p.id === currentProfile.id ? newProfile : p));
                                        setOpen(false);
                                    }} size={'sm'} h={'38px'} variant={'outline'} colorPalette={"green"}>Submit Changes</Button>
                                    <Button mt={4} onClick={() => {
                                        setOpen(false);
                                    }} size={'sm'} h={'38px'} variant={'outline'} colorPalette={"red"}>Cancel</Button>
                                </HStack>



                            </Popover.Body>
                        </Popover.Content>
                    </Popover.Positioner>
                </Portal>
            </Popover.Root>
    )
}

export { StatsCell }