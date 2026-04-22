import { useState } from "react";
import { Separator, HStack, Text, createListCollection, Button, NumberInput, Input } from "@chakra-ui/react";
import { MiscSelector } from "./Dropdowns.jsx";

const Config = ({ config, setConfig }) => {
    // Universal
    const [challengeModus, setChallengeModus] = useState("default");
    // Algicosathlon-specific
    const [pointDiff, setPointDiff] = useState("expo");
    const [rateOfChange, setRateOfChange] = useState(String(1.5)); // Chakra number constraint
    const [startingTeams, setStartingTeams] = useState(String(2)); // Chakra number constraint

    const [swapInput, setSwapInput] = useState('');
    const [swapAt, setSwapAt] = useState([]);
    const handleSwapInputChange = (e) => {
        const stringValue = e.target.value;
        setSwapInput(stringValue);
        
        // Split by comma, remove whitespace, and convert to numbers
        const newArray = stringValue
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '' && !isNaN(item))
        .map(Number);
        
        setSwapAt(newArray);
    };
    const [mergeThreshold, setMergeThreshold] = useState(null);

    const [teamInfo, setTeamInfo] = useState([]);

    const challengeModuses = createListCollection({
    items: [
        { label: "Generic", value: "default",
            challenges: ["Strength","Agility","Mental","Teamwork","Physical","Puzzle","Obstacle Course","Coordination","Endurance (Strength)","Endurance (Dexterity)","Memory","Elimination","Combination"]},
        { label: "IwS Challenges", value: "iws",
            challenges: ["Running (100yd)", "Discus Throw", "Archery", "PSaT", "BMX Cycling", "IWS Obstacle Course",
        "Ninja Takedown", "The Ultimate Test of Your Sheer Willpower", "Maxing", "The FitnessGram Pacer Test",
        "The ASCI Spelling Bee", "Pole Vault", "Juggling", "Robot Takedown", "Mechanical Bull", "Shot Put",
        "Dogfighting", "Triathalon", "Beat the AI"]},
        { label: "RNG", value: "rng",
            challenges: ["Luck"]},
    ],
    })
    const pdOptions = createListCollection({
    items: [
        { label: "Linear", value: "linear"},
        { label: "Exponential", value: "expo"},
    ],
    })

    return (
        <>
            <HStack>
                <Text flexShrink="0">Universal</Text>
                <Separator flex="1" />
            </HStack>
            <MiscSelector options={challengeModuses} title="Challenge Modus" state={challengeModus} setState={setChallengeModus} />
            <HStack>
                <Text flexShrink="0">Points-specific</Text>
                <Separator flex="1" />
            </HStack>
            <MiscSelector options={pdOptions} title="Points Distribution" state={pointDiff} setState={setPointDiff} />
            <HStack justify="center">
                <Text>Rate of Change</Text>
                <NumberInput.Root width="100px" defaultValue={'1.5'} step={0.05} onValueChange={(details) => setRateOfChange(details.value)}>
                    <NumberInput.Control />
                    <NumberInput.Input />
                </NumberInput.Root>
            </HStack>
            <HStack>
                <Text flexShrink="0">Teams-specific</Text>
                <Separator flex="1" />
            </HStack>
            <HStack justify="center">
                <Text flexShrink="0">Swap Teams At</Text>
                <Input
                    width="250px"
                    placeholder="Enter SITR counts (e.g. 16,18,20)"
                    value={swapInput}
                    onChange={handleSwapInputChange}
                />
            </HStack>
            <HStack justify="center">
                <Text>Merge At (Default: half of cast size)</Text>
                <NumberInput.Root width="100px" step={1} onValueChange={(details) => setMergeThreshold(details.value)}>
                    <NumberInput.Control />
                    <NumberInput.Input />
                </NumberInput.Root>
            </HStack>
            <HStack justify="center">
                <Text>Starting Teams</Text>
                <NumberInput.Root width="100px" defaultValue={'2'} step={1} onValueChange={(details) => setStartingTeams(details.value)}>
                    <NumberInput.Control />
                    <NumberInput.Input />
                </NumberInput.Root>
            </HStack>
            <HStack>
                <Text flexShrink="0">Confirm</Text>
                <Separator flex="1" />
            </HStack>
            <Button variant="outline" colorPalette="green" onClick={() => setConfig({
                ...config,
                challenges: challengeModuses.items.find((item) => item.value === challengeModus)?.challenges,
                pointDistribution: pointDiff,
                rateOfChange: rateOfChange,
                startingTeams: startingTeams,
                swapThresholds: swapAt,
                mergeThreshold: mergeThreshold,
            })}>
                Update Configuration
            </Button>
        </>
    )
}
export default Config;