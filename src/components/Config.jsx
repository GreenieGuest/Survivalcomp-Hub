import { useState } from "react";
import { Container, Text, VStack, createListCollection, Tabs } from "@chakra-ui/react";
import { MiscSelector } from "./Dropdowns.jsx";
import { LeaderboardsDisplay } from "./PointsLeaderboard.jsx";
import PlacementGains from "./PlacementGains.jsx";
import { FaHome } from "react-icons/fa";

const Config = () => {
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

    return (
        <>
            <MiscSelector options={challengeModuses} title="Challenge Modus" state={challengeModus} setState={setChallengeModus} />
            <VStack>
            <Text>Selected Challenges:</Text>
            {challengeModuses.items.find((item) => item.value === challengeModus)?.challenges.map((challenge, index) => (
                <Text key={index}>{challenge}</Text>
            ))}
            </VStack>
        </>
    )
}
export default Config;