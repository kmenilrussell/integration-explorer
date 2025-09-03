"use client"

import { useEffect } from "react"
import { IntegrationCard } from "@/components/integration-card"
import { ManagementInterface } from "@/components/management-interface"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Plus, Zap, Grid, List } from "lucide-react"
import { useIntegrations } from "@/hooks/use-integrations"
import { toast } from "sonner"

const categories = [
  { value: "all", label: "All Categories" },
  { value: "payment", label: "Payment Processors" },
  { value: "shipping", label: "Shipping Carriers" },
  { value: "communication", label: "Communication" },
  { value: "analytics", label: "Analytics" },
  { value: "erp", label: "ERP Systems" },
  { value: "marketing", label: "Marketing" },
]

export default function Home() {
  const {
    integrations,
    userIntegrations,
    connectedIntegrations,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    loadIntegrations,
    loadUserIntegrations,
    connectIntegration,
    disconnectIntegration,
    updateIntegrationConfig,
    setSearchQuery,
    setSelectedCategory,
    isConnected,
  } = useIntegrations()

  useEffect(() => {
    loadIntegrations()
    loadUserIntegrations()
  }, [])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadIntegrations({ category: selectedCategory !== "all" ? selectedCategory : undefined, searchQuery })
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [selectedCategory, searchQuery])

  const handleConnectIntegration = async (integrationId: string, credentials?: any, configuration?: any) => {
    try {
      const integration = integrations.find(i => i.id === integrationId)
      await connectIntegration(integrationId, credentials, configuration)
      toast.success(`Successfully connected to ${integration?.name}`)
    } catch (error) {
      console.error("Failed to connect integration:", error)
      toast.error("Failed to connect integration")
    }
  }

  const handleDisconnectIntegration = async (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId)
      await disconnectIntegration(integrationId)
      toast.success(`Disconnected from ${integration?.name}`)
    } catch (error) {
      console.error("Failed to disconnect integration:", error)
      toast.error("Failed to disconnect integration")
    }
  }

  const handleReconnectIntegration = async (integrationId: string, credentials?: any, configuration?: any) => {
    try {
      const integration = integrations.find(i => i.id === integrationId)
      await connectIntegration(integrationId, credentials, configuration)
      toast.success(`Successfully reconnected to ${integration?.name}`)
    } catch (error) {
      console.error("Failed to reconnect integration:", error)
      toast.error("Failed to reconnect integration")
    }
  }

  const handleUpdateConfig = async (integrationId: string, configuration: any) => {
    try {
      const integration = integrations.find(i => i.id === integrationId)
      await updateIntegrationConfig(integrationId, configuration)
      toast.success(`Configuration updated for ${integration?.name}`)
    } catch (error) {
      console.error("Failed to update configuration:", error)
      toast.error("Failed to update configuration")
    }
  }

  if (isLoading && integrations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary/30 mx-auto absolute top-0 left-0"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading Integrations</p>
            <p className="text-muted-foreground">Preparing your integration marketplace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Integration Explorer</h1>
              <p className="text-muted-foreground mt-2">
                Connect and manage your third-party integrations to extend platform functionality
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2 animate-pulse">
                <Zap className="h-4 w-4" />
                {connectedIntegrations.length} Connected
              </Badge>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                <Plus className="h-4 w-4 mr-2" />
                Request Integration
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
            <TabsTrigger value="marketplace" className="flex items-center gap-2 data-[state=active]:bg-primary">
              <Grid className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2 data-[state=active]:bg-primary">
              <List className="h-4 w-4" />
              My Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 transition-all focus:ring-2 focus:ring-primary/20">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {integrations.length} integration{integrations.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {/* Integration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration, index) => {
                const userIntegration = userIntegrations.find(ui => ui.integrationId === integration.id)
                return (
                  <div 
                    key={integration.id}
                    className="animate-in fade-in-50 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <IntegrationCard
                      integration={integration}
                      isConnected={isConnected(integration.id)}
                      userIntegration={userIntegration}
                      onConnect={handleConnectIntegration}
                      onDisconnect={() => handleDisconnectIntegration(integration.id)}
                      onUpdateConfig={(configuration) => handleUpdateConfig(integration.id, configuration)}
                    />
                  </div>
                )
              })}
            </div>

            {integrations.length === 0 && (
              <div className="text-center py-12 animate-in fade-in-50 duration-300">
                <div className="text-muted-foreground">
                  No integrations found matching your search criteria.
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="management" className="space-y-6 animate-in fade-in-50 duration-300">
            <ManagementInterface
              userIntegrations={userIntegrations}
              integrations={integrations}
              onDisconnect={handleDisconnectIntegration}
              onReconnect={handleReconnectIntegration}
              onUpdateConfig={handleUpdateConfig}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}