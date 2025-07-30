"use client"

import {
  ArchiveBoxIcon,
  ServerIcon,
  BoltIcon,
  CircleStackIcon,
  QueueListIcon,
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline"
import { ServiceCard } from "./service-card"

export function ServicesGrid() {
  const services = [
    {
      name: "S3 Storage",
      description: "Scalable object storage service",
      icon: ArchiveBoxIcon,
      status: "Active",
      usage: "2.4 TB used",
    },
    {
      name: "Compute",
      description: "Virtual servers and application hosting",
      icon: ServerIcon,
      status: "Active",
      usage: "12 instances",
    },
    {
      name: "Lambda",
      description: "Serverless code execution",
      icon: BoltIcon,
      status: "Active",
      usage: "1.2M invocations",
    },
    {
      name: "RDB",
      description: "Managed relational databases",
      icon: CircleStackIcon,
      status: "Active",
      usage: "3 databases",
    },
    {
      name: "NoSQL",
      description: "Non-relational database service",
      icon: CircleStackIcon,
      status: "Active",
      usage: "5 collections",
    },
    {
      name: "Queue Service",
      description: "Message queuing and processing",
      icon: QueueListIcon,
      status: "Active",
      usage: "450K messages",
    },
    {
      name: "Secrets Manager",
      description: "Secure credential storage",
      icon: ShieldCheckIcon,
      status: "Active",
      usage: "28 secrets",
    },
    {
      name: "IAM",
      description: "Identity and access management",
      icon: UsersIcon,
      status: "Active",
      usage: "15 users",
    },
    {
      name: "Monitoring",
      description: "Application and infrastructure monitoring",
      icon: ChartBarIcon,
      status: "Active",
      usage: "Real-time",
    },
    {
      name: "Billing",
      description: "Cost management and billing",
      icon: CreditCardIcon,
      status: "Active",
      usage: "$247.50/mo",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service, index) => (
        <ServiceCard
          key={index}
          name={service.name}
          description={service.description}
          icon={service.icon}
          status={service.status}
          usage={service.usage}
        />
      ))}
    </div>
  )
}
