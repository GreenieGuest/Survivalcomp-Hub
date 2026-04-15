import { useState } from "react";
import { Separator, HStack, Text, createListCollection, Button, NumberInput } from "@chakra-ui/react";
import { MiscSelector } from "./Dropdowns.jsx";

const Config = ({ config, setConfig }) => {
    const [challengeModus, setChallengeModus] = useState("default");
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
    const [pointDiff, setPointDiff] = useState("linear");
    const pdOptions = createListCollection({
    items: [
        { label: "Linear", value: "linear"},
        { label: "Exponential", value: "expo"},
    ],
    })
    const [rateOfChange, setRateOfChange] = useState(String(1.5)); // Chakra number constraint

    return (
        <>
            <HStack>
                <Text flexShrink="0">Universal</Text>
                <Separator flex="1" />
            </HStack>
            <MiscSelector options={challengeModuses} title="Challenge Modus" state={challengeModus} setState={setChallengeModus} />
            <HStack>
                <Text flexShrink="0">Algicosathlon-specific</Text>
                <Separator flex="1" />
            </HStack>
            <MiscSelector options={pdOptions} title="Points Distribution" state={pointDiff} setState={setPointDiff} />
            <HStack justify="center">
            <Text fontSize="xs" color="red.400">Rate of Change</Text>
            <NumberInput.Root width="100px" defaultValue={'1.5'} step={0.05} onValueChange={(details) => setRateOfChange(details.value)} colorPalette={"red"}>
                <NumberInput.Control />
                <NumberInput.Input />
            </NumberInput.Root>
            </HStack>
            <Separator />
            <Button variant="outline" onClick={() => setConfig({
                ...config,
                challenges: challengeModuses.items.find((item) => item.value === challengeModus)?.challenges,
                pointDistribution: pointDiff,
                rateOfChange: rateOfChange,
            })}>
                Update Configuration
            </Button>
        </>
    )
}
export default Config;