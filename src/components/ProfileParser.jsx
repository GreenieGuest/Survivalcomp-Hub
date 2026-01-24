import React, { useState } from 'react'
import { Flex, Container, Button, FileUpload, VStack, Alert } from "@chakra-ui/react"
import { HiUpload } from "react-icons/hi"

function extractPlayers(data) {
    // Helper function to extract player info from JSON data, whether array (my preferred format) or an object
    const makePlayer = (obj, index = 0) => {
        const values = Object.values(obj);
        if (values.length === 0) return null;
        return {
            id: Date.now() + Math.random() + index, // simple unique id
            name: obj.name || obj.contestant || `Player ${index + 1}`,
            color: obj.color || null,
            str: obj.str || 3,
            dex: obj.dex || 3,
            int: obj.int || 3,
        };
    }

    if (Array.isArray(data)) {
        return data.map((item, index) => (
            makePlayer(item, index)));
    } else if (typeof data === "object" && data !== null) {
        return [makePlayer(data)];
    }
    return [];
}

const ProfileParser = ({ playerList, setPlayerList }) => {
    const [jsonData, setJsonData] = useState(null)
    const handleFileChange = ({ files }) => {
        const file = files?.[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    setJsonData(data);
                    const extractedPlayers = extractPlayers(data);

                    setPlayerList((prevList) => [...prevList, ...extractedPlayers]);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    setJsonData(null);
                }
            };

            reader.onerror = () => {
                setJsonData(null);
            }

            reader.readAsText(file);
        } else {
            // Not a JSON file
            setJsonData(null);
        }
    }

    return (
        <Container>
            <Flex pb={5} justifyContent={"center"}>
                <VStack alignItems="center">
                <FileUpload.Root accept={[".json"]} onFileAccept={handleFileChange}>
                    <FileUpload.HiddenInput />
                        <FileUpload.Trigger asChild>
                            <Button variant="outline" colorPalette="teal" size="sm" alignSelf="center">
                            <HiUpload /> Import Profiles (JSON)
                            </Button>
                        </FileUpload.Trigger>
                    <FileUpload.List />
                </FileUpload.Root>
                
                {jsonData && (
                    <Alert.Root status="success">
                        <Alert.Indicator />
                        <Alert.Title>Successfully parsed profiles!</Alert.Title>
                    </Alert.Root>
                )}
                </VStack>
            </Flex>
        </Container>
    )
};

export default ProfileParser;