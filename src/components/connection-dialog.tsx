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
import { Key, ExternalLink, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Integration } from "@/store/integration-store"

interface ConnectionDialogProps {
  integration: Integration
  isOpen: boolean
  onClose: () => void
  onConnect: (credentials: any, configuration: any) => Promise<void>
}

const authTypeLabels = {
  API_KEY: "API Key",
  OAUTH: "OAuth",
  WEBHOOK: "Webhook",
  BASIC_AUTH: "Basic Auth",
} as const

export function ConnectionDialog({ integration, isOpen, onClose, onConnect }: ConnectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [configuration, setConfiguration] = useState<Record<string, any>>({})
  const [currentStep, setCurrentStep] = useState<"auth" | "config" | "confirm">("auth")

  const handleAuthTypeSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validate credentials based on auth type
      if (integration.authType === "API_KEY") {
        if (!credentials.apiKey) {
          throw new Error("API Key is required")
        }
      } else if (integration.authType === "BASIC_AUTH") {
        if (!credentials.username || !credentials.password) {
          throw new Error("Username and password are required")
        }
      }

      setCurrentStep("config")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would redirect to the OAuth provider
      // For demo purposes, we'll simulate a successful OAuth connection
      setCurrentStep("config")
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth connection failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await onConnect(credentials, configuration)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setIsLoading(false)
    }
  }

  const renderAuthStep = () => {
    switch (integration.authType) {
      case "API_KEY":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={credentials.apiKey || ""}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
              />
            </div>
            {integration.configSchema?.webhookSecret && (
              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
                <Input
                  id="webhookSecret"
                  type="password"
                  placeholder="Enter webhook secret"
                  value={credentials.webhookSecret || ""}
                  onChange={(e) => setCredentials({ ...credentials, webhookSecret: e.target.value })}
                />
              </div>
            )}
          </div>
        )

      case "BASIC_AUTH":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={credentials.username || ""}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password || ""}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>
        )

      case "OAUTH":
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="mb-4">
                <ExternalLink className="h-12 w-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect with OAuth</h3>
              <p className="text-muted-foreground mb-6">
                You will be redirected to {integration.name} to authorize this integration
              </p>
              <Button onClick={handleOAuthConnect} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect to {integration.name}
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case "WEBHOOK":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://your-webhook-url.com/endpoint"
                value={credentials.webhookUrl || ""}
                onChange={(e) => setCredentials({ ...credentials, webhookUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret">Secret (Optional)</Label>
              <Input
                id="secret"
                type="password"
                placeholder="Webhook secret for verification"
                value={credentials.secret || ""}
                onChange={(e) => setCredentials({ ...credentials, secret: e.target.value })}
              />
            </div>
          </div>
        )

      default:
        return <div>Unsupported authentication type</div>
    }
  }

  const renderConfigStep = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Configure how {integration.name} should work with your account.
      </div>
      
      {integration.configSchema && Object.entries(integration.configSchema).map(([key, schema]: [string, any]) => (
        <div key={key} className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor={`config-${key}`} className="text-sm">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </Label>
            {schema.required && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
          </div>
          <Switch
            id={`config-${key}`}
            checked={configuration[key] ?? schema.default ?? false}
            onCheckedChange={(checked) => 
              setConfiguration({ ...configuration, [key]: checked })
            }
          />
        </div>
      ))}
    </div>
  )

  const renderConfirmStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Ready to Connect</h3>
        <p className="text-muted-foreground">
          Review your settings before connecting to {integration.name}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Connection Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Authentication:</span>
            <Badge variant="outline">{authTypeLabels[integration.authType]}</Badge>
          </div>
          
          {Object.entries(configuration).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
              </span>
              <Badge variant={value ? "default" : "secondary"}>
                {value ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Connect to {integration.name}
          </DialogTitle>
          <DialogDescription>
            Authenticate and configure your {integration.name} integration
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

        <div className="space-y-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {["auth", "config", "confirm"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? "bg-primary text-primary-foreground"
                      : index < ["auth", "config", "confirm"].indexOf(currentStep)
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < ["auth", "config", "confirm"].indexOf(currentStep) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < ["auth", "config", "confirm"].indexOf(currentStep)
                        ? "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === "auth" && renderAuthStep()}
          {currentStep === "config" && renderConfigStep()}
          {currentStep === "confirm" && renderConfirmStep()}
        </div>

        <DialogFooter className="flex gap-2">
          {currentStep === "auth" && integration.authType !== "OAUTH" && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleAuthTypeSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </>
          )}

          {currentStep === "config" && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep("auth")}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep("confirm")}>
                Continue
              </Button>
            </>
          )}

          {currentStep === "confirm" && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep("config")}>
                Back
              </Button>
              <Button onClick={handleFinalConnect} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Integration"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}