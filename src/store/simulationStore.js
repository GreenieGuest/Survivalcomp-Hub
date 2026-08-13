import { create } from 'zustand'

export const useSimStore = create((set, get) => ({
    playerList: [],
    playerStats: {},
    simCount: 0,
    config: null,

    gameState: null,

    // Actions
    setPlayerList: (playerList) => set({ playerList }),
    setConfig: (config) => set({ config }),

    applyGameResults: (gameState) => {
        const { playerStats, simCount } = get()
        const newStats = { ...playerStats }
        gameState.eliminated.forEach((player, index) => {
            const prev = newStats[player.id] ?? { object: player, wins: 0, placements: [] }
            newStats[player.id] = {
                ...prev,
                wins: prev.wins + (gameState.castSize - index === 1 ? 1 : 0),
                placements: [...prev.placements, gameState.castSize - index],
            }
        });
        set({ playerStats: newStats, simCount: simCount + 1 })
    },

    clearStats: () => set({ playerStats: {}, simCount: 0 }),
    setGameState: (gameState) => set({ gameState }),
}))