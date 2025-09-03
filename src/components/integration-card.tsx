"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle, ExternalLink, Settings, Key, Users, CreditCard, Truck, MessageSquare, BarChart3 } from "lucide-react"
import { Integration, UserIntegration } from "@/store/integration-store"
import { ConnectionDialog } from "@/components/connection-dialog"
import { ConfigurationDialog } from "@/components/configuration-dialog"

interface IntegrationCardProps {
  integration: Integration
  isConnected: boolean
  userIntegration?: UserIntegration
  onConnect: (credentials: any, configuration: any) => Promise<void>
  onDisconnect: () => void
  onUpdateConfig: (configuration: any) => Promise<void>
}

const statusColors = {
  AVAILABLE: "default",
  BETA: "secondary",
  DEPRECATED: "destructive",
  MAINTENANCE: "outline",
} as const

const statusLabels = {
  AVAILABLE: "Available",
  BETA: "Beta",
  DEPRECATED: "Deprecated",
  MAINTENANCE: "Maintenance",
} as const

const authTypeLabels = {
  API_KEY: "API Key",
  OAUTH: "OAuth",
  WEBHOOK: "Webhook",
  BASIC_AUTH: "Basic Auth",
} as const

// Map icon names to Lucide icons
const iconMap: Record<string, React.ComponentType<any>> = {
  CreditCard,
  Truck,
  MessageSquare,
  BarChart3,
  Settings,
}

export function IntegrationCard({ 
  integration, 
  isConnected, 
  userIntegration,
  onConnect, 
  onDisconnect,
  onUpdateConfig 
}: IntegrationCardProps) {
  const [showConfig, setShowConfig] = useState(false)
  const [showConnection, setShowConnection] = useState(false)
  const [isEnabled, setIsEnabled] = useState(isConnected)

  const Icon = iconMap[integration.icon || "Settings"] || Settings

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setShowConnection(true)
    } else {
      setIsEnabled(false)
      onDisconnect()
    }
  }

  const handleConnect = async (credentials: any, configuration: any) => {
    try {
      await onConnect(credentials, configuration)
      setIsEnabled(true)
      setShowConnection(false)
    } catch (error) {
      console.error("Failed to connect:", error)
      setIsEnabled(false)
    }
  }

  const handleUpdateConfig = async (configuration: any) => {
    try {
      await onUpdateConfig(configuration)
      setShowConfig(false)
    } catch (error) {
      console.error("Failed to update configuration:", error)
    }
  }

  // Extract features from config schema for display
  const features = integration.configSchema 
    ? Object.keys(integration.configSchema).map(key => 
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
      )
    : ["Basic Integration"]

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={statusColors[integration.status]} className="text-xs">
                    {statusLabels[integration.status]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {authTypeLabels[integration.authType]}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <CardDescription className="text-sm mb-4 line-clamp-2">
            {integration.description}
          </CardDescription>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Features</h4>
              <div className="flex flex-wrap gap-1">
                {features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {features.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Ready to connect</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={integration.status === "MAINTENANCE" || integration.status === "DEPRECATED"}
              />
              <span className="text-sm font-medium">
                {isEnabled ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!isConnected}
                onClick={() => setShowConfig(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>

              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                Docs
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      <ConnectionDialog
        integration={integration}
        isOpen={showConnection}
        onClose={() => setShowConnection(false)}
        onConnect={handleConnect}
      />

      <ConfigurationDialog
        integration={integration}
        userIntegration={userIntegration}
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={handleUpdateConfig}
      />
    </>
  )
}