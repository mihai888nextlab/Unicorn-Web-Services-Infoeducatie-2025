"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, ServerIcon, CircleStackIcon, FolderOpenIcon, DocumentTextIcon, TrashIcon, ArrowPathIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, PencilIcon, ChevronRightIcon, UserIcon } from "@heroicons/react/24/outline"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ResizableLayout } from "@/components/layout/resizable-layout"
import { useAuth } from "@/hooks/useAuth"

// Dynamic import for Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <ArrowPathIcon className="w-6 h-6 animate-spin" />
    </div>
  ),
})

interface NoSQLDatabase {
  id: string
  name: string
  displayName: string
  status: string
  k8sStatus?: string
  collectionsCount?: number
  createdAt: string
}

interface PostgreSQLDatabase {
  id: string
  name: string
  displayName: string
  description?: string
  version: string
  status: string
  size: string
  instances: number
  haEnabled: boolean
  backupEnabled: boolean
  databasesCount?: number
  usersCount?: number
  createdAt: string
  config?: {
    cpu: number
    memory: number
    storage: string
    price: number
  }
}

interface PostgreSQLUser {
  id: string
  username: string
  createDb: boolean
  superuser: boolean
  connectionString?: string
  createdAt?: string
}

interface PostgreSQLUserDatabase {
  id: string
  name: string
  owner: string
  encoding?: string
  locale?: string
  createdAt?: string
}

interface Collection {
  id: string
  name: string
  documentCount?: number
  createdAt: string
  schema?: any
  indexes?: any[]
}

interface Document {
  id: string
  documentId: string
  data: any
  version: number
  createdAt: string
  updatedAt?: string
}

const DATABASE_SIZES = [
  { value: "small", label: "Small - 512MB RAM, 0.5 CPU, 10Gi Storage", price: 0.05 },
  { value: "medium", label: "Medium - 2GB RAM, 1 CPU, 50Gi Storage", price: 0.20 },
  { value: "large", label: "Large - 8GB RAM, 2 CPU, 100Gi Storage", price: 0.80 },
]

const POSTGRESQL_SIZES = [
  { value: "small", label: "Small - 1GB RAM, 0.5 CPU, 10Gi Storage", price: 20 },
  { value: "medium", label: "Medium - 2GB RAM, 1 CPU, 25Gi Storage", price: 50 },
  { value: "large", label: "Large - 4GB RAM, 2 CPU, 50Gi Storage", price: 100 },
]

const POSTGRESQL_VERSIONS = [
  { value: "13", label: "PostgreSQL 13" },
  { value: "14", label: "PostgreSQL 14" },
  { value: "15", label: "PostgreSQL 15 (Recommended)" },
  { value: "16", label: "PostgreSQL 16 (Latest)" },
]

export default function DatabasePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState("rdb")
  
  // NoSQL state
  const [databases, setDatabases] = useState<NoSQLDatabase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Database form state
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newSize, setNewSize] = useState("small")
  
  // Selected database and collections
  const [selectedDatabase, setSelectedDatabase] = useState<NoSQLDatabase | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  
  // Collection modal
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [collectionName, setCollectionName] = useState("")
  const [collectionSchema, setCollectionSchema] = useState("{}")
  const [collectionIndexes, setCollectionIndexes] = useState("[]")
  const [collectionCreateLoading, setCollectionCreateLoading] = useState(false)
  const [collectionCreateError, setCollectionCreateError] = useState<string | null>(null)
  
  // Document management
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [documentData, setDocumentData] = useState("{}")
  const [documentId, setDocumentId] = useState("")
  const [documentSaveLoading, setDocumentSaveLoading] = useState(false)
  const [documentSaveError, setDocumentSaveError] = useState<string | null>(null)
  
  // Query builder
  const [showQueryModal, setShowQueryModal] = useState(false)
  const [queryFilter, setQueryFilter] = useState("{}")
  const [queryLimit, setQueryLimit] = useState("100")
  const [querySkip, setQuerySkip] = useState("0")
  const [querySort, setQuerySort] = useState("{}")
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryResults, setQueryResults] = useState<any[]>([])
  
  // PostgreSQL state
  const [pgDatabases, setPgDatabases] = useState<PostgreSQLDatabase[]>([])
  const [pgLoading, setPgLoading] = useState(true)
  const [pgError, setPgError] = useState<string | null>(null)
  const [pgAdding, setPgAdding] = useState(false)
  const [pgCreateLoading, setPgCreateLoading] = useState(false)
  const [pgCreateError, setPgCreateError] = useState<string | null>(null)
  const [pgActionLoading, setPgActionLoading] = useState<string | null>(null)
  
  // PostgreSQL form state
  const [pgNewName, setPgNewName] = useState("")
  const [pgNewDisplayName, setPgNewDisplayName] = useState("")
  const [pgNewDescription, setPgNewDescription] = useState("")
  const [pgNewVersion, setPgNewVersion] = useState("15")
  const [pgNewSize, setPgNewSize] = useState("small")
  const [pgNewInstances, setPgNewInstances] = useState(1)
  const [pgNewHaEnabled, setPgNewHaEnabled] = useState(false)
  const [pgNewBackupEnabled, setPgNewBackupEnabled] = useState(false)
  const [pgNewBackupSchedule, setPgNewBackupSchedule] = useState("0 2 * * *")
  const [pgNewBackupRetention, setPgNewBackupRetention] = useState(7)
  
  // Selected PostgreSQL database
  const [selectedPgDatabase, setSelectedPgDatabase] = useState<PostgreSQLDatabase | null>(null)
  const [pgDetails, setPgDetails] = useState<any>(null)
  const [pgDetailsLoading, setPgDetailsLoading] = useState(false)
  const [showPgDetailsModal, setShowPgDetailsModal] = useState(false)
  
  // PostgreSQL user management
  const [showPgUserModal, setShowPgUserModal] = useState(false)
  const [pgUserName, setPgUserName] = useState("")
  const [pgUserPassword, setPgUserPassword] = useState("")
  const [pgUserCreateDb, setPgUserCreateDb] = useState(false)
  const [pgUserSuperuser, setPgUserSuperuser] = useState(false)
  const [pgUserCreateLoading, setPgUserCreateLoading] = useState(false)
  const [pgUserCreateError, setPgUserCreateError] = useState<string | null>(null)
  
  // PostgreSQL database creation
  const [showPgDbModal, setShowPgDbModal] = useState(false)
  const [pgDbName, setPgDbName] = useState("")
  const [pgDbOwner, setPgDbOwner] = useState("")
  const [pgDbEncoding, setPgDbEncoding] = useState("UTF8")
  const [pgDbLocale, setPgDbLocale] = useState("en_US.utf8")
  const [pgDbTemplate, setPgDbTemplate] = useState("template0")
  const [pgDbCreateLoading, setPgDbCreateLoading] = useState(false)
  const [pgDbCreateError, setPgDbCreateError] = useState<string | null>(null)

  // Fetch databases
  const fetchDatabases = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/databases`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setDatabases(Array.isArray(data) ? data : [])
      } else if (response.status === 404) {
        setDatabases([])
      } else {
        throw new Error(`Failed to fetch databases: ${response.status}`)
      }
    } catch (err) {
      console.error("Error fetching databases:", err)
      setDatabases([])
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Create database
  const createDatabase = async () => {
    if (!newName.trim()) {
      setCreateError("Name is required")
      return
    }

    const nameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/
    if (!nameRegex.test(newName.trim())) {
      setCreateError("Database name must start and end with alphanumeric characters and can contain hyphens")
      return
    }

    try {
      setCreateLoading(true)
      setCreateError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setCreateError("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/databases`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newName.trim(),
            description: newDescription.trim(),
            engine: "mongodb",
            size: newSize,
            storage: newSize === "small" ? "10Gi" : newSize === "medium" ? "50Gi" : "100Gi",
          }),
        }
      )

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || `Failed to create database: ${response.status}`)
      }

      // Reset form and close modal
      setNewName("")
      setNewDescription("")
      setNewSize("small")
      setAdding(false)

      // Refresh databases
      await fetchDatabases()
    } catch (err) {
      console.error("Error creating database:", err)
      setCreateError(err instanceof Error ? err.message : "Failed to create database")
    } finally {
      setCreateLoading(false)
    }
  }

  // Delete database
  const deleteDatabase = async (databaseId: string) => {
    try {
      setActionLoading(`${databaseId}-delete`)
      
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.error("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/databases/${databaseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Failed to delete database")
      }

      await fetchDatabases(false)
    } catch (err) {
      console.error("Error deleting database:", err)
      setError(err instanceof Error ? err.message : "Failed to delete database")
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Fetch collections
  const fetchCollections = async (databaseId: string) => {
    try {
      setCollectionsLoading(true)
      
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/databases/${databaseId}/collections`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCollections(Array.isArray(data) ? data : [])
      } else {
        setCollections([])
      }
    } catch (err) {
      console.error("Error fetching collections:", err)
      setCollections([])
    } finally {
      setCollectionsLoading(false)
    }
  }

  // Create collection
  const createCollection = async () => {
    if (!collectionName.trim() || !selectedDatabase) {
      setCollectionCreateError("Collection name is required")
      return
    }

    const nameRegex = /^[a-zA-Z0-9_]+$/
    if (!nameRegex.test(collectionName.trim())) {
      setCollectionCreateError("Collection name must be alphanumeric with underscores")
      return
    }

    try {
      setCollectionCreateLoading(true)
      setCollectionCreateError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setCollectionCreateError("No authentication token found")
        return
      }

      let schema = {}
      let indexes = []
      
      try {
        if (collectionSchema.trim()) {
          schema = JSON.parse(collectionSchema)
        }
        if (collectionIndexes.trim()) {
          indexes = JSON.parse(collectionIndexes)
        }
      } catch (e) {
        setCollectionCreateError("Invalid JSON in schema or indexes")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/databases/${selectedDatabase.id}/collections`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: collectionName.trim(),
            schema: Object.keys(schema).length > 0 ? schema : undefined,
            indexes: indexes.length > 0 ? indexes : undefined,
          }),
        }
      )

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || "Failed to create collection")
      }

      // Reset form and close modal
      setCollectionName("")
      setCollectionSchema("{}")
      setCollectionIndexes("[]")
      setShowCollectionModal(false)

      // Refresh collections
      await fetchCollections(selectedDatabase.id)
    } catch (err) {
      console.error("Error creating collection:", err)
      setCollectionCreateError(err instanceof Error ? err.message : "Failed to create collection")
    } finally {
      setCollectionCreateLoading(false)
    }
  }

  // Fetch documents
  const fetchDocuments = async (collectionId: string) => {
    try {
      setDocumentsLoading(true)
      
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/collections/${collectionId}/scan`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        setDocuments([])
      }
    } catch (err) {
      console.error("Error fetching documents:", err)
      setDocuments([])
    } finally {
      setDocumentsLoading(false)
    }
  }

  // Save document (create or update)
  const saveDocument = async () => {
    if (!selectedCollection) return

    try {
      setDocumentSaveLoading(true)
      setDocumentSaveError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setDocumentSaveError("No authentication token found")
        return
      }

      let data = {}
      try {
        data = JSON.parse(documentData)
      } catch (e) {
        setDocumentSaveError("Invalid JSON data")
        return
      }

      if (editingDocument) {
        // Update existing document
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/collections/${selectedCollection.id}/documents/${editingDocument.documentId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || errorData.detail || "Failed to update document")
        }
      } else {
        // Create new document
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/collections/${selectedCollection.id}/documents`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentId: documentId.trim() || undefined,
              data,
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || errorData.detail || "Failed to create document")
        }
      }

      // Reset form and close modal
      setDocumentData("{}")
      setDocumentId("")
      setEditingDocument(null)
      setShowDocumentModal(false)

      // Refresh documents
      await fetchDocuments(selectedCollection.id)
    } catch (err) {
      console.error("Error saving document:", err)
      setDocumentSaveError(err instanceof Error ? err.message : "Failed to save document")
    } finally {
      setDocumentSaveLoading(false)
    }
  }

  // Delete document
  const deleteDocument = async (collectionId: string, documentId: string) => {
    try {
      setActionLoading(`${documentId}-delete`)
      
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/collections/${collectionId}/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Failed to delete document")
      }

      await fetchDocuments(collectionId)
    } catch (err) {
      console.error("Error deleting document:", err)
      setError(err instanceof Error ? err.message : "Failed to delete document")
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Query documents
  const queryDocuments = async () => {
    if (!selectedCollection) return

    try {
      setQueryLoading(true)
      setQueryResults([])

      const token = localStorage.getItem("auth_token")
      if (!token) return

      let filter = {}
      let sort = {}
      
      try {
        if (queryFilter.trim()) {
          filter = JSON.parse(queryFilter)
        }
        if (querySort.trim()) {
          sort = JSON.parse(querySort)
        }
      } catch (e) {
        setError("Invalid JSON in query parameters")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nosql/collections/${selectedCollection.id}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filter,
            limit: parseInt(queryLimit) || 100,
            skip: parseInt(querySkip) || 0,
            sort: Object.keys(sort).length > 0 ? sort : undefined,
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setQueryResults(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error querying documents:", err)
      setError(err instanceof Error ? err.message : "Failed to query documents")
      setTimeout(() => setError(null), 5000)
    } finally {
      setQueryLoading(false)
    }
  }

  // Open document editor
  const openDocumentEditor = (doc?: Document) => {
    if (doc) {
      setEditingDocument(doc)
      setDocumentData(JSON.stringify(doc.data, null, 2))
      setDocumentId(doc.documentId)
    } else {
      setEditingDocument(null)
      setDocumentData("{}")
      setDocumentId("")
    }
    setShowDocumentModal(true)
    setDocumentSaveError(null)
  }

  // Select database
  const selectDatabase = (database: NoSQLDatabase) => {
    setSelectedDatabase(database)
    setSelectedCollection(null)
    setDocuments([])
    fetchCollections(database.id)
  }

  // Select collection
  const selectCollection = (collection: Collection) => {
    setSelectedCollection(collection)
    fetchDocuments(collection.id)
  }

  // Fetch PostgreSQL databases
  const fetchPostgreSQLDatabases = async (showLoading = true) => {
    try {
      if (showLoading) {
        setPgLoading(true)
      }
      setPgError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setPgError("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postgresql/databases`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPgDatabases(Array.isArray(data) ? data : [])
      } else if (response.status === 404) {
        setPgDatabases([])
      } else {
        throw new Error(`Failed to fetch PostgreSQL databases: ${response.status}`)
      }
    } catch (err) {
      console.error("Error fetching PostgreSQL databases:", err)
      setPgDatabases([])
    } finally {
      if (showLoading) {
        setPgLoading(false)
      }
    }
  }

  // Create PostgreSQL database
  const createPostgreSQLDatabase = async () => {
    if (!pgNewName.trim() || !pgNewDisplayName.trim()) {
      setPgCreateError("Name and display name are required")
      return
    }

    const nameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/
    if (!nameRegex.test(pgNewName.trim())) {
      setPgCreateError("Cluster name must start and end with alphanumeric characters and can contain hyphens")
      return
    }

    try {
      setPgCreateLoading(true)
      setPgCreateError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setPgCreateError("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postgresql/databases`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: pgNewName.trim(),
            displayName: pgNewDisplayName.trim(),
            description: pgNewDescription.trim() || undefined,
            version: pgNewVersion,
            size: pgNewSize,
            instances: pgNewInstances,
            haEnabled: pgNewHaEnabled,
            backupEnabled: pgNewBackupEnabled,
            ...(pgNewBackupEnabled && {
              backupSchedule: pgNewBackupSchedule,
              backupRetention: pgNewBackupRetention,
            }),
          }),
        }
      )

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || `Failed to create PostgreSQL database: ${response.status}`)
      }

      // Reset form and close modal
      setPgNewName("")
      setPgNewDisplayName("")
      setPgNewDescription("")
      setPgNewVersion("15")
      setPgNewSize("small")
      setPgNewInstances(1)
      setPgNewHaEnabled(false)
      setPgNewBackupEnabled(false)
      setPgNewBackupSchedule("0 2 * * *")
      setPgNewBackupRetention(7)
      setPgAdding(false)

      // Refresh databases
      await fetchPostgreSQLDatabases()
    } catch (err) {
      console.error("Error creating PostgreSQL database:", err)
      setPgCreateError(err instanceof Error ? err.message : "Failed to create PostgreSQL database")
    } finally {
      setPgCreateLoading(false)
    }
  }

  // Delete PostgreSQL database
  const deletePostgreSQLDatabase = async (databaseId: string) => {
    try {
      setPgActionLoading(`${databaseId}-delete`)
      
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.error("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postgresql/databases/${databaseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Failed to delete PostgreSQL database")
      }

      await fetchPostgreSQLDatabases(false)
    } catch (err) {
      console.error("Error deleting PostgreSQL database:", err)
      setPgError(err instanceof Error ? err.message : "Failed to delete PostgreSQL database")
      setTimeout(() => setPgError(null), 5000)
    } finally {
      setPgActionLoading(null)
    }
  }

  // Backup PostgreSQL database
  const backupPostgreSQLDatabase = async (databaseId: string) => {
    try {
      setPgActionLoading(`${databaseId}-backup`)
      
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.error("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postgresql/databases/${databaseId}/backup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Failed to backup PostgreSQL database")
      }

      setPgError("Backup initiated successfully")
      setTimeout(() => setPgError(null), 3000)
    } catch (err) {
      console.error("Error backing up PostgreSQL database:", err)
      setPgError(err instanceof Error ? err.message : "Failed to backup PostgreSQL database")
      setTimeout(() => setPgError(null), 5000)
    } finally {
      setPgActionLoading(null)
    }
  }

  // Fetch PostgreSQL database details
  const fetchPostgreSQLDatabaseDetails = async (databaseId: string) => {
    try {
      setPgDetailsLoading(true)
      
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postgresql/databases/${databaseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPgDetails(data)
      }
    } catch (err) {
      console.error("Error fetching PostgreSQL database details:", err)
    } finally {
      setPgDetailsLoading(false)
    }
  }


  // Create PostgreSQL user
  const createPostgreSQLUser = async () => {
    if (!selectedPgDatabase || !pgUserName.trim()) {
      setPgUserCreateError("Username is required")
      return
    }

    const usernameRegex = /^[a-z][a-z0-9_]*$/
    if (!usernameRegex.test(pgUserName.trim())) {
      setPgUserCreateError("Username must start with a letter and contain only lowercase letters, numbers, and underscores")
      return
    }

    try {
      setPgUserCreateLoading(true)
      setPgUserCreateError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setPgUserCreateError("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postgresql/databases/${selectedPgDatabase.id}/users`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: pgUserName.trim(),
            password: pgUserPassword.trim() || undefined,
            createDb: pgUserCreateDb,
            superuser: pgUserSuperuser,
          }),
        }
      )

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || "Failed to create user")
      }

      // Reset form and close modal
      setPgUserName("")
      setPgUserPassword("")
      setPgUserCreateDb(false)
      setPgUserSuperuser(false)
      setShowPgUserModal(false)

      // Refresh database details
      fetchPostgreSQLDatabaseDetails(selectedPgDatabase.id)
    } catch (err) {
      console.error("Error creating PostgreSQL user:", err)
      setPgUserCreateError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setPgUserCreateLoading(false)
    }
  }

  // Create user database
  const createUserDatabase = async () => {
    if (!selectedPgDatabase || !pgDbName.trim() || !pgDbOwner.trim()) {
      setPgDbCreateError("Database name and owner are required")
      return
    }

    const dbNameRegex = /^[a-z][a-z0-9_]*$/
    if (!dbNameRegex.test(pgDbName.trim())) {
      setPgDbCreateError("Database name must start with a letter and contain only lowercase letters, numbers, and underscores")
      return
    }

    try {
      setPgDbCreateLoading(true)
      setPgDbCreateError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setPgDbCreateError("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postgresql/databases/${selectedPgDatabase.id}/databases`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: pgDbName.trim(),
            owner: pgDbOwner.trim(),
            encoding: pgDbEncoding,
            locale: pgDbLocale,
            template: pgDbTemplate,
          }),
        }
      )

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || "Failed to create database")
      }

      // Reset form and close modal
      setPgDbName("")
      setPgDbOwner("")
      setPgDbEncoding("UTF8")
      setPgDbLocale("en_US.utf8")
      setPgDbTemplate("template0")
      setShowPgDbModal(false)

      // Refresh database details
      fetchPostgreSQLDatabaseDetails(selectedPgDatabase.id)
    } catch (err) {
      console.error("Error creating user database:", err)
      setPgDbCreateError(err instanceof Error ? err.message : "Failed to create database")
    } finally {
      setPgDbCreateLoading(false)
    }
  }

  // Scale PostgreSQL database
  const scalePostgreSQLDatabase = async (databaseId: string, instances: number) => {
    try {
      setPgActionLoading(`${databaseId}-scale`)
      
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.error("No authentication token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/postgresql/databases/${databaseId}/scale`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ instances }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Failed to scale PostgreSQL database")
      }

      await fetchPostgreSQLDatabases(false)
      if (selectedPgDatabase) {
        fetchPostgreSQLDatabaseDetails(selectedPgDatabase.id)
      }
    } catch (err) {
      console.error("Error scaling PostgreSQL database:", err)
      setPgError(err instanceof Error ? err.message : "Failed to scale PostgreSQL database")
      setTimeout(() => setPgError(null), 5000)
    } finally {
      setPgActionLoading(null)
    }
  }

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      if (tab === "nosql") {
        fetchDatabases()
        
        // Set up polling
        const interval = setInterval(() => {
          fetchDatabases(false)
        }, 10000)
        
        return () => clearInterval(interval)
      } else if (tab === "rdb") {
        fetchPostgreSQLDatabases()
        
        // Set up polling
        const interval = setInterval(() => {
          fetchPostgreSQLDatabases(false)
        }, 10000)
        
        return () => clearInterval(interval)
      }
    }
  }, [user, tab])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
      case "active":
        return "bg-green-400"
      case "creating":
      case "updating":
        return "bg-yellow-400 animate-pulse"
      case "failed":
      case "error":
        return "bg-red-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <ResizableLayout currentPage="services">
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Databases</h1>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="w-full flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="rdb">RDB</TabsTrigger>
            <TabsTrigger value="nosql">NoSQL</TabsTrigger>
          </TabsList>
          <TabsContent value="rdb" className="flex-1 flex gap-4 h-full overflow-hidden">
            {/* PostgreSQL Database List */}
            <div className="w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">PostgreSQL Clusters</h2>
                <Dialog open={pgAdding} onOpenChange={setPgAdding}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusIcon className="w-4 h-4 mr-1" /> New Cluster
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogTitle>Create PostgreSQL Database Cluster</DialogTitle>
                    <div className="flex flex-col gap-4 mt-4">
                      <div>
                        <Label htmlFor="pg-name">Cluster Name*</Label>
                        <Input 
                          id="pg-name"
                          placeholder="my-postgres-db" 
                          value={pgNewName} 
                          onChange={e => setPgNewName(e.target.value.toLowerCase())} 
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Lowercase, alphanumeric with hyphens, 1-50 chars
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="pg-display-name">Display Name*</Label>
                        <Input 
                          id="pg-display-name"
                          placeholder="My PostgreSQL Database" 
                          value={pgNewDisplayName} 
                          onChange={e => setPgNewDisplayName(e.target.value)} 
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pg-description">Description</Label>
                        <Textarea 
                          id="pg-description"
                          placeholder="Database description" 
                          value={pgNewDescription} 
                          onChange={e => setPgNewDescription(e.target.value)} 
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="pg-version">PostgreSQL Version</Label>
                        <Select value={pgNewVersion} onValueChange={setPgNewVersion}>
                          <SelectTrigger id="pg-version" className="mt-1">
                            <SelectValue placeholder="Select version" />
                          </SelectTrigger>
                          <SelectContent>
                            {POSTGRESQL_VERSIONS.map(version => (
                              <SelectItem key={version.value} value={version.value}>
                                {version.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="pg-size">Cluster Size</Label>
                        <Select value={pgNewSize} onValueChange={setPgNewSize}>
                          <SelectTrigger id="pg-size" className="mt-1">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {POSTGRESQL_SIZES.map(size => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {POSTGRESQL_SIZES.find(s => s.value === pgNewSize) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ${POSTGRESQL_SIZES.find(s => s.value === pgNewSize)!.price}/month
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="pg-instances">Number of Instances</Label>
                        <Input 
                          id="pg-instances"
                          type="number"
                          min={1}
                          max={3}
                          value={pgNewInstances} 
                          onChange={e => setPgNewInstances(parseInt(e.target.value) || 1)} 
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="pg-ha"
                          checked={pgNewHaEnabled} 
                          onCheckedChange={setPgNewHaEnabled}
                        />
                        <Label htmlFor="pg-ha">Enable High Availability</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="pg-backup"
                          checked={pgNewBackupEnabled} 
                          onCheckedChange={setPgNewBackupEnabled}
                        />
                        <Label htmlFor="pg-backup">Enable Automatic Backups</Label>
                      </div>
                      
                      {pgNewBackupEnabled && (
                        <>
                          <div>
                            <Label htmlFor="pg-backup-schedule">Backup Schedule (Cron)</Label>
                            <Input 
                              id="pg-backup-schedule"
                              placeholder="0 2 * * *" 
                              value={pgNewBackupSchedule} 
                              onChange={e => setPgNewBackupSchedule(e.target.value)} 
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Default: Daily at 2 AM
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="pg-backup-retention">Backup Retention (days)</Label>
                            <Input 
                              id="pg-backup-retention"
                              type="number"
                              min={1}
                              max={30}
                              value={pgNewBackupRetention} 
                              onChange={e => setPgNewBackupRetention(parseInt(e.target.value) || 7)} 
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}

                      {pgCreateError && (
                        <div className="text-sm text-red-500 flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          {pgCreateError}
                        </div>
                      )}

                      <div className="flex gap-2 justify-end mt-2">
                        <DialogClose asChild>
                          <Button variant="outline" size="sm" onClick={() => {
                            setPgAdding(false)
                            setPgCreateError(null)
                          }}>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button 
                          size="sm" 
                          onClick={createPostgreSQLDatabase}
                          disabled={pgCreateLoading || !pgNewName || !pgNewDisplayName}
                        >
                          {pgCreateLoading ? "Creating..." : "Create Cluster"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {pgError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                  {pgError}
                </div>
              )}

              <div className="flex flex-col gap-2 overflow-y-auto">
                {pgLoading && (
                  <Card className="p-4 text-center text-muted-foreground">
                    <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto mb-1" />
                    Loading clusters...
                  </Card>
                )}
                
                {!pgLoading && pgDatabases.length === 0 && (
                  <Card className="p-4 text-center text-muted-foreground">
                    No clusters yet
                  </Card>
                )}
                
                {!pgLoading && pgDatabases.map(db => (
                  <Card 
                    key={db.id} 
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedPgDatabase?.id === db.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => {
                      setSelectedPgDatabase(db)
                      setPgDetails(null)
                      fetchPostgreSQLDatabaseDetails(db.id)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CircleStackIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-mono text-sm">{db.displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {db.databasesCount || 0} DBs • {db.usersCount || 0} users
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(db.status)}`} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6"
                              disabled={pgActionLoading !== null}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {pgActionLoading?.startsWith(db.id) ? (
                                <ArrowPathIcon className="w-3 h-3 animate-spin" />
                              ) : (
                                <ChevronRightIcon className="w-3 h-3" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                backupPostgreSQLDatabase(db.id)
                              }}
                              disabled={pgActionLoading !== null || !db.backupEnabled}
                            >
                              <ArrowPathIcon className="w-4 h-4 mr-2" /> Backup
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePostgreSQLDatabase(db.id)
                              }} 
                              className="text-red-600"
                              disabled={pgActionLoading !== null}
                            >
                              <TrashIcon className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Panel - Simplified with button to open modal */}
            <Card className="flex-1 flex items-center justify-center text-muted-foreground">
              {selectedPgDatabase ? (
                <div className="text-center">
                  <CircleStackIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="mb-2 font-semibold">{selectedPgDatabase.displayName}</p>
                  <p className="text-sm mb-1">PostgreSQL {selectedPgDatabase.version}</p>
                  <p className="text-xs mb-4">
                    {selectedPgDatabase.databasesCount || 0} DBs • {selectedPgDatabase.usersCount || 0} users
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setShowPgDetailsModal(true)
                      fetchPostgreSQLDatabaseDetails(selectedPgDatabase.id)
                    }}
                  >
                    Manage Cluster
                  </Button>
                </div>
              ) : (
                "Select a cluster to manage"
              )}
            </Card>
          </TabsContent>
          <TabsContent value="nosql" className="flex-1 flex gap-4 h-full overflow-hidden">
            {/* Database List */}
            <div className="w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">NoSQL Databases</h2>
                <Dialog open={adding} onOpenChange={setAdding}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusIcon className="w-4 h-4 mr-1" /> New Database
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogTitle>Create NoSQL Database</DialogTitle>
                    <div className="flex flex-col gap-4 mt-4">
                      <div>
                        <Label htmlFor="name">Database Name*</Label>
                        <Input 
                          id="name"
                          placeholder="my-database" 
                          value={newName} 
                          onChange={e => setNewName(e.target.value.toLowerCase())} 
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Lowercase, alphanumeric with hyphens, 1-50 chars
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description"
                          placeholder="Database description" 
                          value={newDescription} 
                          onChange={e => setNewDescription(e.target.value)} 
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="size">Database Size</Label>
                        <Select value={newSize} onValueChange={setNewSize}>
                          <SelectTrigger id="size" className="mt-1">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {DATABASE_SIZES.map(size => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {DATABASE_SIZES.find(s => s.value === newSize) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ${DATABASE_SIZES.find(s => s.value === newSize)!.price.toFixed(2)}/hour
                          </p>
                        )}
                      </div>

                      {createError && (
                        <div className="text-sm text-red-500 flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          {createError}
                        </div>
                      )}

                      <div className="flex gap-2 justify-end mt-2">
                        <DialogClose asChild>
                          <Button variant="outline" size="sm" onClick={() => {
                            setAdding(false)
                            setCreateError(null)
                          }}>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button 
                          size="sm" 
                          onClick={createDatabase}
                          disabled={createLoading || !newName}
                        >
                          {createLoading ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2 overflow-y-auto">
                {loading && (
                  <Card className="p-4 text-center text-muted-foreground">
                    <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto mb-1" />
                    Loading databases...
                  </Card>
                )}
                
                {!loading && databases.length === 0 && (
                  <Card className="p-4 text-center text-muted-foreground">
                    No databases yet
                  </Card>
                )}
                
                {!loading && databases.map(db => (
                  <Card 
                    key={db.id} 
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedDatabase?.id === db.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => selectDatabase(db)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CircleStackIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-mono text-sm">{db.displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {db.collectionsCount || 0} collections
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(db.status)}`} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6"
                              disabled={actionLoading !== null}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {actionLoading?.startsWith(db.id) ? (
                                <ArrowPathIcon className="w-3 h-3 animate-spin" />
                              ) : (
                                <ChevronRightIcon className="w-3 h-3" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteDatabase(db.id)
                              }} 
                              className="text-red-600"
                              disabled={actionLoading !== null}
                            >
                              <TrashIcon className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Collections and Documents */}
            {selectedDatabase ? (
              <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Collections List */}
                <div className="w-64 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Collections</h3>
                    <Button 
                      size="sm"
                      onClick={() => setShowCollectionModal(true)}
                    >
                      <PlusIcon className="w-4 h-4 mr-1" /> New
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2 overflow-y-auto">
                    {collectionsLoading && (
                      <Card className="p-3 text-center text-muted-foreground">
                        <ArrowPathIcon className="w-4 h-4 animate-spin mx-auto" />
                      </Card>
                    )}
                    
                    {!collectionsLoading && collections.length === 0 && (
                      <Card className="p-3 text-center text-muted-foreground text-sm">
                        No collections yet
                      </Card>
                    )}
                    
                    {!collectionsLoading && collections.map(col => (
                      <Card 
                        key={col.id} 
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedCollection?.id === col.id ? 'bg-accent' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => selectCollection(col)}
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpenIcon className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-mono text-sm">{col.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {col.documentCount || 0} documents
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                {selectedCollection && (
                  <Card className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{selectedCollection.name} Documents</h3>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowQueryModal(true)
                            setQueryResults([])
                          }}
                        >
                          <MagnifyingGlassIcon className="w-4 h-4 mr-1" /> Query
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => openDocumentEditor()}
                        >
                          <PlusIcon className="w-4 h-4 mr-1" /> New Document
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {documentsLoading && (
                        <div className="text-center py-8">
                          <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading documents...
                        </div>
                      )}
                      
                      {!documentsLoading && documents.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No documents in this collection
                        </div>
                      )}
                      
                      {!documentsLoading && documents.map(doc => (
                        <div 
                          key={doc.id} 
                          className="mb-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <DocumentTextIcon className="w-4 h-4 text-muted-foreground mt-1" />
                              <div>
                                <div className="font-mono text-sm">{doc.documentId}</div>
                                <div className="text-xs text-muted-foreground">
                                  v{doc.version} • {new Date(doc.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => openDocumentEditor(doc)}
                              >
                                <PencilIcon className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => deleteDocument(selectedCollection.id, doc.documentId)}
                                disabled={actionLoading === `${doc.documentId}-delete`}
                              >
                                {actionLoading === `${doc.documentId}-delete` ? (
                                  <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                ) : (
                                  <TrashIcon className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <pre className="text-xs font-mono bg-black/5 p-2 rounded overflow-x-auto">
                            {JSON.stringify(doc.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a database to view collections
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* PostgreSQL Details Modal removed - using inline display */}
        {false && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>
              {selectedPgDatabase?.displayName || "PostgreSQL Database Details"}
            </DialogTitle>
            {selectedPgDatabase && (
              <div className="flex flex-col gap-6 mt-4">
                {pgDetailsLoading ? (
                  <div className="text-center py-8">
                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading details...
                  </div>
                ) : pgDetails ? (
                  <>
                    {/* Connection Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Connection Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Host</Label>
                          <p className="font-mono text-sm">{pgDetails.host || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Port</Label>
                          <p className="font-mono">{pgDetails.port || 5432}</p>
                        </div>
                      </div>
                      {pgDetails.connectionString && (
                        <div>
                          <Label className="text-muted-foreground">Connection String</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              value={pgDetails.connectionString} 
                              readOnly 
                              className="font-mono text-xs"
                            />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(pgDetails.connectionString)
                                setPgError("Connection string copied to clipboard")
                                setTimeout(() => setPgError(null), 2000)
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Databases */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Databases ({pgDetails.databases?.length || 0})</h3>
                        <Button 
                          size="sm"
                          onClick={() => setShowPgDbModal(true)}
                        >
                          <PlusIcon className="w-4 h-4 mr-1" /> New Database
                        </Button>
                      </div>
                      {pgDetails.databases && pgDetails.databases.length > 0 ? (
                        <div className="space-y-2">
                          {pgDetails.databases.map((db: any) => (
                            <div key={db.id} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{db.name}</span>
                                <span className="text-sm text-muted-foreground">• Owner: {db.owner}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No databases created yet</p>
                      )}
                    </div>

                    {/* Users */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Users ({pgDetails.users?.length || 0})</h3>
                        <Button 
                          size="sm"
                          onClick={() => setShowPgUserModal(true)}
                        >
                          <PlusIcon className="w-4 h-4 mr-1" /> New User
                        </Button>
                      </div>
                      {pgDetails.users && pgDetails.users.length > 0 ? (
                        <div className="space-y-2">
                          {pgDetails.users.map((user: PostgreSQLUser) => (
                            <div key={user.id} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="font-mono">{user.username}</span>
                                <div className="flex gap-2">
                                  {user.createDb && <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">Can Create DB</span>}
                                  {user.superuser && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">Superuser</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No users created yet</p>
                      )}
                    </div>

                    {/* Scaling */}
                    <div className="space-y-3">
                      <h3 className="font-semibold">Scaling</h3>
                      <div className="flex items-center gap-3">
                        <Label>Instances:</Label>
                        <Select 
                          value={selectedPgDatabase ? selectedPgDatabase.instances.toString() : "1"} 
                          onValueChange={(value) => selectedPgDatabase && scalePostgreSQLDatabase(selectedPgDatabase.id, parseInt(value))}
                          disabled={pgActionLoading !== null || !selectedPgDatabase}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Instance</SelectItem>
                            <SelectItem value="2">2 Instances</SelectItem>
                            <SelectItem value="3">3 Instances</SelectItem>
                          </SelectContent>
                        </Select>
                        {pgActionLoading?.includes("scale") && (
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>Loading database details...</div>
                )}
              </div>
            )}
          </DialogContent>
        )}

        {/* Create PostgreSQL User Modal */}
        <Dialog open={showPgUserModal} onOpenChange={setShowPgUserModal}>
          <DialogContent className="max-w-lg">
            <DialogTitle>Create Database User</DialogTitle>
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <Label htmlFor="pg-username">Username*</Label>
                <Input 
                  id="pg-username"
                  placeholder="appuser" 
                  value={pgUserName} 
                  onChange={e => setPgUserName(e.target.value.toLowerCase())} 
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must start with a letter, lowercase letters, numbers, and underscores only
                </p>
              </div>

              <div>
                <Label htmlFor="pg-password">Password (optional)</Label>
                <Input 
                  id="pg-password"
                  type="password"
                  placeholder="Auto-generated if empty" 
                  value={pgUserPassword} 
                  onChange={e => setPgUserPassword(e.target.value)} 
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="pg-create-db"
                  checked={pgUserCreateDb} 
                  onCheckedChange={setPgUserCreateDb}
                />
                <Label htmlFor="pg-create-db">Can create databases</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="pg-superuser"
                  checked={pgUserSuperuser} 
                  onCheckedChange={setPgUserSuperuser}
                />
                <Label htmlFor="pg-superuser">Superuser privileges</Label>
              </div>

              {pgUserCreateError && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {pgUserCreateError}
                </div>
              )}

              <div className="flex gap-2 justify-end mt-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowPgUserModal(false)
                    setPgUserCreateError(null)
                  }}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  size="sm" 
                  onClick={createPostgreSQLUser}
                  disabled={pgUserCreateLoading || !pgUserName}
                >
                  {pgUserCreateLoading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create User Database Modal */}
        <Dialog open={showPgDbModal} onOpenChange={setShowPgDbModal}>
          <DialogContent className="max-w-lg">
            <DialogTitle>Create Database</DialogTitle>
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <Label htmlFor="pg-db-name">Database Name*</Label>
                <Input 
                  id="pg-db-name"
                  placeholder="myapp_production" 
                  value={pgDbName} 
                  onChange={e => setPgDbName(e.target.value.toLowerCase())} 
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must start with a letter, lowercase letters, numbers, and underscores only
                </p>
              </div>

              <div>
                <Label htmlFor="pg-db-owner">Owner*</Label>
                <Select value={pgDbOwner} onValueChange={setPgDbOwner}>
                  <SelectTrigger id="pg-db-owner" className="mt-1">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {pgDetails?.users?.map((user: PostgreSQLUser) => (
                      <SelectItem key={user.username} value={user.username}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pg-db-encoding">Encoding</Label>
                <Select value={pgDbEncoding} onValueChange={setPgDbEncoding}>
                  <SelectTrigger id="pg-db-encoding" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTF8">UTF8 (Recommended)</SelectItem>
                    <SelectItem value="LATIN1">LATIN1</SelectItem>
                    <SelectItem value="SQL_ASCII">SQL_ASCII</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pg-db-locale">Locale</Label>
                <Input 
                  id="pg-db-locale"
                  placeholder="en_US.utf8" 
                  value={pgDbLocale} 
                  onChange={e => setPgDbLocale(e.target.value)} 
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="pg-db-template">Template</Label>
                <Select value={pgDbTemplate} onValueChange={setPgDbTemplate}>
                  <SelectTrigger id="pg-db-template" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template0">template0 (Recommended)</SelectItem>
                    <SelectItem value="template1">template1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pgDbCreateError && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {pgDbCreateError}
                </div>
              )}

              <div className="flex gap-2 justify-end mt-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowPgDbModal(false)
                    setPgDbCreateError(null)
                  }}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  size="sm" 
                  onClick={createUserDatabase}
                  disabled={pgDbCreateLoading || !pgDbName || !pgDbOwner}
                >
                  {pgDbCreateLoading ? "Creating..." : "Create Database"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Collection Modal */}
        <Dialog open={showCollectionModal} onOpenChange={setShowCollectionModal}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogTitle>Create Collection</DialogTitle>
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <Label htmlFor="collection-name">Collection Name*</Label>
                <Input 
                  id="collection-name"
                  placeholder="users" 
                  value={collectionName} 
                  onChange={e => setCollectionName(e.target.value)} 
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Alphanumeric with underscores, 1-50 chars
                </p>
              </div>

              <div>
                <Label htmlFor="schema">Schema (JSON, optional)</Label>
                <Textarea 
                  id="schema"
                  placeholder={`{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string" }
  }
}`}
                  value={collectionSchema} 
                  onChange={e => setCollectionSchema(e.target.value)} 
                  className="mt-1 font-mono"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="indexes">Indexes (JSON Array, optional)</Label>
                <Textarea 
                  id="indexes"
                  placeholder={`[
  { "email": 1 },
  { "name": 1, "age": -1 }
]`}
                  value={collectionIndexes} 
                  onChange={e => setCollectionIndexes(e.target.value)} 
                  className="mt-1 font-mono"
                  rows={4}
                />
              </div>

              {collectionCreateError && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {collectionCreateError}
                </div>
              )}

              <div className="flex gap-2 justify-end mt-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowCollectionModal(false)
                    setCollectionCreateError(null)
                  }}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  size="sm" 
                  onClick={createCollection}
                  disabled={collectionCreateLoading || !collectionName}
                >
                  {collectionCreateLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Editor Modal */}
        <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
          <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh]">
            <DialogTitle>
              {editingDocument ? `Edit Document: ${editingDocument.documentId}` : "New Document"}
            </DialogTitle>
            <div className="flex flex-col gap-4 mt-4 h-[70vh]">
              {!editingDocument && (
                <div>
                  <Label htmlFor="doc-id">Document ID (optional)</Label>
                  <Input 
                    id="doc-id"
                    placeholder="Auto-generated if empty" 
                    value={documentId} 
                    onChange={e => setDocumentId(e.target.value)} 
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex-1 flex flex-col gap-2">
                <Label>Document Data (JSON)</Label>
                <div className="flex-1 border rounded-lg overflow-hidden">
                  <MonacoEditor
                    value={documentData}
                    onChange={(value) => setDocumentData(value || "{}")}
                    language="json"
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              {documentSaveError && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {documentSaveError}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  size="sm" 
                  onClick={saveDocument}
                  disabled={documentSaveLoading}
                >
                  {documentSaveLoading ? "Saving..." : editingDocument ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Query Builder Modal */}
        <Dialog open={showQueryModal} onOpenChange={setShowQueryModal}>
          <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogTitle>Query Builder - {selectedCollection?.name}</DialogTitle>
            <div className="flex flex-col gap-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="filter">Filter (JSON)</Label>
                  <Textarea 
                    id="filter"
                    placeholder={`{
  "age": 30,
  "preferences.theme": "dark"
}`}
                    value={queryFilter} 
                    onChange={e => setQueryFilter(e.target.value)} 
                    className="mt-1 font-mono"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="sort">Sort (JSON)</Label>
                  <Textarea 
                    id="sort"
                    placeholder={`{
  "name": 1,
  "createdAt": -1
}`}
                    value={querySort} 
                    onChange={e => setQuerySort(e.target.value)} 
                    className="mt-1 font-mono"
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="limit">Limit</Label>
                  <Input 
                    id="limit"
                    type="number"
                    min="1"
                    max="1000"
                    value={queryLimit} 
                    onChange={e => setQueryLimit(e.target.value)} 
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="skip">Skip</Label>
                  <Input 
                    id="skip"
                    type="number"
                    min="0"
                    value={querySkip} 
                    onChange={e => setQuerySkip(e.target.value)} 
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  onClick={queryDocuments}
                  disabled={queryLoading}
                >
                  {queryLoading ? "Querying..." : "Execute Query"}
                </Button>
              </div>

              {queryResults.length > 0 && (
                <div>
                  <Label>Results ({queryResults.length} documents)</Label>
                  <div className="mt-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-black/5">
                    {queryResults.map((doc, idx) => (
                      <div key={idx} className="mb-4 last:mb-0">
                        <div className="text-xs text-muted-foreground mb-1">
                          Document ID: {doc.documentId}
                        </div>
                        <pre className="text-xs font-mono bg-white p-2 rounded">
                          {JSON.stringify(doc.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ResizableLayout>
  )
}
