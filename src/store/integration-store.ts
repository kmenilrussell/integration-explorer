import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface Integration {
  id: string
  name: string
  description?: string
  category: string
  icon?: string
  status: "AVAILABLE" | "BETA" | "DEPRECATED" | "MAINTENANCE"
  authType: "API_KEY" | "OAUTH" | "WEBHOOK" | "BASIC_AUTH"
  configSchema?: any
  createdAt: string
  updatedAt: string
}

interface UserIntegration {
  id: string
  userId: string
  integrationId: string
  status: "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR"
  credentials?: any
  configuration?: any
  connectedAt?: string
  disconnectedAt?: string
  createdAt: string
  updatedAt: string
  integration?: Integration
}

interface IntegrationState {
  // Data
  integrations: Integration[]
  userIntegrations: UserIntegration[]
  isLoading: boolean
  error: string | null
  
  // Filters
  searchQuery: string
  selectedCategory: string
  
  // Actions
  setIntegrations: (integrations: Integration[]) => void
  setUserIntegrations: (userIntegrations: UserIntegration[]) => void
  addIntegration: (integration: Integration) => void
  updateUserIntegration: (integrationId: string, updates: Partial<UserIntegration>) => void
  removeUserIntegration: (integrationId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  
  // Computed
  getFilteredIntegrations: () => Integration[]
  getConnectedIntegrations: () => UserIntegration[]
  getIntegrationById: (id: string) => Integration | undefined
  getUserIntegrationById: (id: string) => UserIntegration | undefined
  isConnected: (integrationId: string) => boolean
}

export const useIntegrationStore = create<IntegrationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        integrations: [],
        userIntegrations: [],
        isLoading: false,
        error: null,
        searchQuery: "",
        selectedCategory: "all",
        
        // Actions
        setIntegrations: (integrations) => set({ integrations }),
        setUserIntegrations: (userIntegrations) => set({ userIntegrations }),
        addIntegration: (integration) => 
          set((state) => ({ integrations: [...state.integrations, integration] })),
        updateUserIntegration: (integrationId, updates) =>
          set((state) => ({
            userIntegrations: state.userIntegrations.map((ui) =>
              ui.integrationId === integrationId ? { ...ui, ...updates } : ui
            ),
          })),
        removeUserIntegration: (integrationId) =>
          set((state) => ({
            userIntegrations: state.userIntegrations.filter(
              (ui) => ui.integrationId !== integrationId
            ),
          })),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setSearchQuery: (searchQuery) => set({ searchQuery }),
        setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
        
        // Computed
        getFilteredIntegrations: () => {
          const { integrations, searchQuery, selectedCategory } = get()
          return integrations.filter((integration) => {
            const matchesSearch =
              searchQuery === "" ||
              integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              integration.description?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory =
              selectedCategory === "all" || integration.category === selectedCategory
            return matchesSearch && matchesCategory
          })
        },
        
        getConnectedIntegrations: () => {
          const { userIntegrations } = get()
          return userIntegrations.filter((ui) => ui.status === "CONNECTED")
        },
        
        getIntegrationById: (id) => {
          const { integrations } = get()
          return integrations.find((integration) => integration.id === id)
        },
        
        getUserIntegrationById: (id) => {
          const { userIntegrations } = get()
          return userIntegrations.find((ui) => ui.integrationId === id)
        },
        
        isConnected: (integrationId) => {
          const { userIntegrations } = get()
          const userIntegration = userIntegrations.find(
            (ui) => ui.integrationId === integrationId
          )
          return userIntegration?.status === "CONNECTED"
        },
      }),
      {
        name: "integration-storage",
        partialize: (state) => ({
          userIntegrations: state.userIntegrations,
          searchQuery: state.searchQuery,
          selectedCategory: state.selectedCategory,
        }),
      }
    ),
    {
      name: "integration-store",
    }
  )
)