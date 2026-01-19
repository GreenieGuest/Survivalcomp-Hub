import { useState } from "react";

export default function PlayerCard({ playerList, setPlayerList }) {
    const [name, setName] = useState("");
    const [emptyMessage, setEmptyMessage] = useState(false);

    const handlePostPlayer = (e) => {
        e.preventDefault();

        if (name.length > 0) {
            // If value detected in input, create new player object and add to player list
            //More stats will be added later

            const newPlayer = { id: Date.now(), name: name };
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
            <form onSubmit={handlePostPlayer}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter player name"
                />
                <button type="submit">Add Player</button>
            </form>
            {emptyMessage && <p style={{ color: "red" }}>Player name cannot be empty!</p>}
            <ul>
                {playerList.map((player) => (
                    <li key={player.id}>
                        {player.name}
                        <button onClick={() => handleDeletePlayer(player.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}