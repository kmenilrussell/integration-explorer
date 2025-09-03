"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Settings, 
  ExternalLink, 
  Power, 
  PowerOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MoreHorizontal,
  Trash2
} from "lucide-react"
import { UserIntegration, Integration } from "@/store/integration-store"
import { ConfigurationDialog } from "@/components/configuration-dialog"
import { ConnectionDialog } from "@/components/connection-dialog"

interface ManagementInterfaceProps {
  userIntegrations: UserIntegration[]
  integrations: Integration[]
  onDisconnect: (integrationId: string) => Promise<void>
  onReconnect: (integrationId: string, credentials: any, configuration: any) => Promise<void>
  onUpdateConfig: (integrationId: string, configuration: any) => Promise<void>
}

const statusColors = {
  CONNECTED: "default",
  CONNECTING: "secondary",
  DISCONNECTED: "outline",
  ERROR: "destructive",
} as const

const statusLabels = {
  CONNECTED: "Connected",
  CONNECTING: "Connecting",
  DISCONNECTED: "Disconnected",
  ERROR: "Error",
} as const

const statusIcons = {
  CONNECTED: CheckCircle,
  CONNECTING: Clock,
  DISCONNECTED: PowerOff,
  ERROR: AlertTriangle,
}

export function ManagementInterface({
  userIntegrations,
  integrations,
  onDisconnect,
  onReconnect,
  onUpdateConfig,
}: ManagementInterfaceProps) {
  const [showConfig, setShowConfig] = useState<{ integration: Integration; userIntegration: UserIntegration } | null>(null)
  const [showConnection, setShowConnection] = useState<Integration | null>(null)

  const getIntegrationDetails = (integrationId: string) => {
    return integrations.find(i => i.id === integrationId)
  }

  const handleToggle = async (userIntegration: UserIntegration) => {
    if (userIntegration.status === "CONNECTED") {
      await onDisconnect(userIntegration.integrationId)
    } else {
      const integration = getIntegrationDetails(userIntegration.integrationId)
      if (integration) {
        setShowConnection(integration)
      }
    }
  }

  const handleReconnect = async (integrationId: string, credentials: any, configuration: any) => {
    try {
      await onReconnect(integrationId, credentials, configuration)
      setShowConnection(null)
    } catch (error) {
      console.error("Failed to reconnect:", error)
    }
  }

  const handleUpdateConfig = async (configuration: any) => {
    if (showConfig) {
      try {
        await onUpdateConfig(showConfig.userIntegration.integrationId, configuration)
        setShowConfig(null)
      } catch (error) {
        console.error("Failed to update configuration:", error)
      }
    }
  }

  if (userIntegrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Connected Integrations</CardTitle>
          <CardDescription>
            You haven't connected any integrations yet. Browse the marketplace to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userIntegrations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {userIntegrations.filter(ui => ui.status === "CONNECTED").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {userIntegrations.filter(ui => ui.status === "ERROR" || ui.status === "DISCONNECTED").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(userIntegrations.map(ui => getIntegrationDetails(ui.integrationId)?.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Management</CardTitle>
          <CardDescription>
            Manage your connected integrations, configure settings, and monitor status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Integration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Connected</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userIntegrations.map((userIntegration) => {
                  const integration = getIntegrationDetails(userIntegration.integrationId)
                  if (!integration) return null

                  const StatusIcon = statusIcons[userIntegration.status]
                  const isConnected = userIntegration.status === "CONNECTED"

                  return (
                    <TableRow key={userIntegration.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Settings className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{integration.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {integration.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge variant={statusColors[userIntegration.status]}>
                            {statusLabels[userIntegration.status]}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {integration.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {userIntegration.connectedAt ? (
                          <div className="text-sm">
                            {new Date(userIntegration.connectedAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Never</div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isConnected}
                            onCheckedChange={() => handleToggle(userIntegration)}
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowConfig({ integration, userIntegration })}
                            disabled={!isConnected}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      {showConfig && (
        <ConfigurationDialog
          integration={showConfig.integration}
          userIntegration={showConfig.userIntegration}
          isOpen={!!showConfig}
          onClose={() => setShowConfig(null)}
          onSave={handleUpdateConfig}
        />
      )}

      {/* Connection Dialog */}
      {showConnection && (
        <ConnectionDialog
          integration={showConnection}
          isOpen={!!showConnection}
          onClose={() => setShowConnection(null)}
          onConnect={(credentials, configuration) => 
            handleReconnect(showConnection.id, credentials, configuration)
          }
        />
      )}
    </div>
  )
}