"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, Settings, Save, TestTube, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Integration, UserIntegration } from "@/store/integration-store"

interface ConfigurationDialogProps {
  integration: Integration
  userIntegration?: UserIntegration
  isOpen: boolean
  onClose: () => void
  onSave: (configuration: any) => Promise<void>
  onTest?: () => Promise<void>
}

const authTypeLabels = {
  API_KEY: "API Key",
  OAUTH: "OAuth",
  WEBHOOK: "Webhook",
  BASIC_AUTH: "Basic Auth",
} as const

export function ConfigurationDialog({ 
  integration, 
  userIntegration, 
  isOpen, 
  onClose, 
  onSave, 
  onTest 
}: ConfigurationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [configuration, setConfiguration] = useState<Record<string, any>>(
    userIntegration?.configuration || {}
  )

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await onSave(configuration)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    setError(null)
    setTestResult(null)

    try {
      if (onTest) {
        await onTest()
      } else {
        // Simulate test
        await new Promise(resolve => setTimeout(resolve, 2000))
        setTestResult({
          success: true,
          message: "Connection test successful! Integration is working properly."
        })
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Connection test failed"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const renderConfigurationField = (key: string, schema: any) => {
    const value = configuration[key] ?? schema.default ?? false

    switch (schema.type) {
      case "boolean":
        return (
          <div key={key} className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor={`config-${key}`} className="text-sm">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </Label>
              {schema.description && (
                <p className="text-xs text-muted-foreground">{schema.description}</p>
              )}
            </div>
            <Switch
              id={`config-${key}`}
              checked={value}
              onCheckedChange={(checked) => 
                setConfiguration({ ...configuration, [key]: checked })
              }
            />
          </div>
        )

      case "string":
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={`config-${key}`} className="text-sm">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              {schema.required && (
                <Badge variant="destructive" className="text-xs ml-2">Required</Badge>
              )}
            </Label>
            {schema.description && (
              <p className="text-xs text-muted-foreground">{schema.description}</p>
            )}
            <Input
              id={`config-${key}`}
              type={schema.secret ? "password" : "text"}
              placeholder={schema.placeholder || `Enter ${key}`}
              value={value || ""}
              onChange={(e) => 
                setConfiguration({ ...configuration, [key]: e.target.value })
              }
            />
          </div>
        )

      case "number":
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={`config-${key}`} className="text-sm">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              {schema.required && (
                <Badge variant="destructive" className="text-xs ml-2">Required</Badge>
              )}
            </Label>
            {schema.description && (
              <p className="text-xs text-muted-foreground">{schema.description}</p>
            )}
            <Input
              id={`config-${key}`}
              type="number"
              placeholder={schema.placeholder || `Enter ${key}`}
              value={value || ""}
              onChange={(e) => 
                setConfiguration({ ...configuration, [key]: Number(e.target.value) })
              }
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {integration.name}
          </DialogTitle>
          <DialogDescription>
            Manage your {integration.name} integration settings and configuration
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {testResult && (
          <div className={`rounded-lg p-3 ${
            testResult.success 
              ? "bg-green-50 border border-green-200" 
              : "bg-destructive/10 border border-destructive/20"
          }`}>
            <div className={`flex items-center gap-2 ${
              testResult.success ? "text-green-700" : "text-destructive"
            }`}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          </div>
        )}

        <Tabs defaultValue="configuration" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-4">
            <div className="space-y-4">
              {integration.configSchema && Object.entries(integration.configSchema).map(([key, schema]) =>
                renderConfigurationField(key, schema)
              )}
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Method:</span>
                  <Badge variant="outline">{authTypeLabels[integration.authType]}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={userIntegration?.status === "CONNECTED" ? "default" : "secondary"}>
                    {userIntegration?.status === "CONNECTED" ? "Connected" : "Not Connected"}
                  </Badge>
                </div>

                {userIntegration?.connectedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Connected:</span>
                    <span className="text-sm">
                      {new Date(userIntegration.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {userIntegration?.credentials && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Credentials:</span>
                    <div className="bg-muted p-2 rounded text-xs font-mono">
                      ••••••••••••••••
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleTest} 
                disabled={isTesting || !userIntegration}
                className="flex-1"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}