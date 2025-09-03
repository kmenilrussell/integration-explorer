import { useIntegrationStore } from "@/store/integration-store"
import { Integration, UserIntegration } from "@/store/integration-store"

// API functions
const api = {
  async getIntegrations(params?: { category?: string; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append("category", params.category)
    if (params?.search) searchParams.append("search", params.search)
    
    const response = await fetch(`/api/integrations?${searchParams}`)
    if (!response.ok) throw new Error("Failed to fetch integrations")
    return response.json()
  },

  async getIntegration(id: string) {
    const response = await fetch(`/api/integrations/${id}`)
    if (!response.ok) throw new Error("Failed to fetch integration")
    return response.json()
  },

  async connectIntegration(id: string, credentials?: any, configuration?: any) {
    const response = await fetch(`/api/integrations/${id}/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentials, configuration }),
    })
    if (!response.ok) throw new Error("Failed to connect integration")
    return response.json()
  },

  async disconnectIntegration(id: string) {
    const response = await fetch(`/api/integrations/${id}/disconnect`, {
      method: "POST",
    })
    if (!response.ok) throw new Error("Failed to disconnect integration")
    return response.json()
  },

  async updateIntegrationConfig(id: string, configuration: any) {
    const response = await fetch(`/api/integrations/${id}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configuration }),
    })
    if (!response.ok) throw new Error("Failed to update integration configuration")
    return response.json()
  },

  async getUserIntegrations() {
    const response = await fetch("/api/user/integrations")
    if (!response.ok) throw new Error("Failed to fetch user integrations")
    return response.json()
  },
}

// React hooks
export function useIntegrations() {
  const {
    integrations,
    userIntegrations,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    setIntegrations,
    setUserIntegrations,
    setLoading,
    setError,
    setSearchQuery,
    setSelectedCategory,
    getFilteredIntegrations,
    getConnectedIntegrations,
    getIntegrationById,
    getUserIntegrationById,
    isConnected,
  } = useIntegrationStore()

  const loadIntegrations = async (params?: { category?: string; search?: string }) => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getIntegrations(params)
      setIntegrations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const loadUserIntegrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getUserIntegrations()
      setUserIntegrations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const connectIntegration = async (id: string, credentials?: any, configuration?: any) => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.connectIntegration(id, credentials, configuration)
      setUserIntegrations(prev => [...prev.filter(ui => ui.integrationId !== id), data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const disconnectIntegration = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.disconnectIntegration(id)
      setUserIntegrations(prev => prev.map(ui => ui.integrationId === id ? data : ui))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateIntegrationConfig = async (id: string, configuration: any) => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.updateIntegrationConfig(id, configuration)
      setUserIntegrations(prev => prev.map(ui => ui.integrationId === id ? data : ui))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    // Data
    integrations: getFilteredIntegrations(),
    userIntegrations,
    connectedIntegrations: getConnectedIntegrations(),
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    
    // Actions
    loadIntegrations,
    loadUserIntegrations,
    connectIntegration,
    disconnectIntegration,
    updateIntegrationConfig,
    setSearchQuery,
    setSelectedCategory,
    setLoading,
    setError,
    
    // Computed
    getIntegrationById,
    getUserIntegrationById,
    isConnected,
  }
}