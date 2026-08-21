import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSimStore = create(
    persist((set, get) => ({
        playerList: [],
        playerStats: {},
        simCount: 0,
        config: null,

        // Actions
        setPlayerList: (updater) => set((state) => ({
            playerList: typeof updater === 'function' ? updater(state.playerList) : updater
        })),
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

        // Events — turn is passed explicitly by the sim, not derived from separate state
        events: [],
        logEvent: (event, turn) => set(state => ({
            events: [...state.events, { ...event, turn: turn ?? 0 }]
        })),
        clearEvents: () => set({ events: [] }),
    }),
    {
      name: 'survivalcomp-storage',
      partialize: (state) => ({
        playerList: state.playerList,
        playerStats: state.playerStats,
        simCount: state.simCount,
        config: state.config,
      }),
    }
  )
)