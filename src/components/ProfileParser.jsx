import React, { useState } from 'react'

function extractPlayers(data) {
    // Helper function to extract player info from JSON data, whether array (my preferred format) or an object
    const makePlayer = (obj) => {
        const values = Object.values(obj);
        if (values.length === 0) return null;
        return { id: Date.now() + Math.random(), name: values[0] }; // Simple unique ID
    }

    if (Array.isArray(data)) {
        return data.map((item, index) => ({ id: Date.now() + index, name: item.name || `Player ${index + 1}` }));
    } else if (typeof data === "object" && data !== null) {
        return [makePlayer(data)];
    }
    return [];
}

const ProfileParser = ({ playerList, setPlayerList }) => {
    const [jsonData, setJsonData] = useState(null)
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
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
        <div>
            <input type="file" style={{ display: "none" }} id="json-upload-button" accept=".json" onChange={handleFileChange} />
            {/* You can add a custom button/label and hide the input for better styling if needed */}
            <label htmlFor="json-upload-button" style={{ cursor: 'pointer', padding: '10px 15px', background: '#0b4020', color: 'white', borderRadius: '5px' }}>
                Import Profiles (JSON)
            </label>
            
            {jsonData && (
                <div>
                <h3>Successfully imported data</h3>
                </div>
            )}
        </div>
    )
};

export default ProfileParser;