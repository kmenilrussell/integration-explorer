import { db } from "../src/lib/db"

const integrations = [
  {
    name: "Stripe",
    description: "Accept payments online with Stripe's powerful payment processing platform",
    category: "payment",
    icon: "CreditCard",
    status: "AVAILABLE",
    authType: "API_KEY",
    configSchema: {
      apiKey: { type: "string", required: true },
      webhookSecret: { type: "string", required: false },
    },
  },
  {
    name: "FedEx",
    description: "Connect to FedEx shipping services for real-time rates and label generation",
    category: "shipping",
    icon: "Truck",
    status: "AVAILABLE",
    authType: "API_KEY",
    configSchema: {
      apiKey: { type: "string", required: true },
      accountNumber: { type: "string", required: true },
      meterNumber: { type: "string", required: true },
    },
  },
  {
    name: "Slack",
    description: "Integrate with Slack for team communication and notifications",
    category: "communication",
    icon: "MessageSquare",
    status: "AVAILABLE",
    authType: "OAUTH",
    configSchema: {
      channelId: { type: "string", required: true },
      notifications: { type: "boolean", default: true },
    },
  },
  {
    name: "Google Analytics",
    description: "Track user behavior and analyze website performance with Google Analytics",
    category: "analytics",
    icon: "BarChart3",
    status: "BETA",
    authType: "OAUTH",
    configSchema: {
      trackingId: { type: "string", required: true },
      enableEcommerce: { type: "boolean", default: false },
    },
  },
  {
    name: "Salesforce",
    description: "Connect your CRM with Salesforce for seamless customer management",
    category: "erp",
    icon: "Settings",
    status: "AVAILABLE",
    authType: "OAUTH",
    configSchema: {
      instanceUrl: { type: "string", required: true },
      syncContacts: { type: "boolean", default: true },
      syncLeads: { type: "boolean", default: true },
    },
  },
  {
    name: "Mailchimp",
    description: "Email marketing automation and audience management with Mailchimp",
    category: "marketing",
    icon: "MessageSquare",
    status: "AVAILABLE",
    authType: "API_KEY",
    configSchema: {
      apiKey: { type: "string", required: true },
      listId: { type: "string", required: true },
      doubleOptIn: { type: "boolean", default: true },
    },
  },
]

async function main() {
  console.log("Seeding integrations...")

  for (const integration of integrations) {
    await db.integration.create({
      data: integration,
    })
  }

  // Create a default user
  const user = await db.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })