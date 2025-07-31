"use client"

import { useState } from "react"
import { ResizableLayout } from "@/components/layout/resizable-layout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  KeyIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline"

// Mock permission templates - placeholders only
const PERMISSION_TEMPLATES = {
  postgresql: {
    create: 'Create PostgreSQL clusters',
    read: 'View PostgreSQL clusters',
    update: 'Update PostgreSQL clusters',
    delete: 'Delete PostgreSQL clusters',
    scale: 'Scale PostgreSQL instances',
    backup: 'Manage PostgreSQL backups',
  },
  storage: {
    create: 'Create storage buckets',
    read: 'View storage buckets',
    update: 'Update bucket settings',
    delete: 'Delete storage buckets',
    upload: 'Upload files',
    download: 'Download files',
  },
  compute: {
    create: 'Create compute instances',
    read: 'View compute instances',
    update: 'Update compute settings',
    delete: 'Delete compute instances',
    restart: 'Restart instances',
    logs: 'View instance logs',
  },
  billing: {
    read: 'View billing information',
    manage: 'Manage billing settings',
  },
  iam: {
    read: 'View users and roles',
    manage_users: 'Manage users',
    manage_roles: 'Manage roles',
  },
}

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    status: "active" as const,
    createdAt: "2024-01-01T00:00:00Z",
    lastActive: "2024-03-20T10:30:00Z",
    roles: [
      { id: "role1", name: "admin", displayName: "Administrator", isSystem: true }
    ]
  },
  {
    id: "2",
    email: "developer@example.com",
    name: "John Developer",
    status: "active" as const,
    createdAt: "2024-02-15T00:00:00Z",
    lastActive: "2024-03-20T09:15:00Z",
    roles: [
      { id: "role2", name: "developer", displayName: "Developer", isSystem: true }
    ]
  },
  {
    id: "3",
    email: "viewer@example.com",
    name: "Jane Viewer",
    status: "inactive" as const,
    createdAt: "2024-03-01T00:00:00Z",
    lastActive: "2024-03-15T14:20:00Z",
    roles: [
      { id: "role3", name: "viewer", displayName: "Viewer", isSystem: true }
    ]
  }
]

const mockRoles = [
  {
    id: "role1",
    name: "admin",
    displayName: "Administrator",
    description: "Full system access with all permissions",
    isSystem: true,
    userCount: 1,
    permissions: [
      { id: "postgresql-create", resource: "postgresql", action: "create", description: "Create PostgreSQL clusters" },
      { id: "postgresql-read", resource: "postgresql", action: "read", description: "View PostgreSQL clusters" },
      { id: "storage-create", resource: "storage", action: "create", description: "Create storage buckets" },
      { id: "storage-read", resource: "storage", action: "read", description: "View storage buckets" },
      { id: "compute-create", resource: "compute", action: "create", description: "Create compute instances" },
      { id: "billing-read", resource: "billing", action: "read", description: "View billing information" },
      { id: "iam-manage_users", resource: "iam", action: "manage_users", description: "Manage users" },
    ]
  },
  {
    id: "role2",
    name: "developer",
    displayName: "Developer",
    description: "Can create and manage own resources",
    isSystem: true,
    userCount: 1,
    permissions: [
      { id: "postgresql-create", resource: "postgresql", action: "create", description: "Create PostgreSQL clusters" },
      { id: "postgresql-read", resource: "postgresql", action: "read", description: "View PostgreSQL clusters" },
      { id: "postgresql-update", resource: "postgresql", action: "update", description: "Update PostgreSQL clusters" },
      { id: "storage-create", resource: "storage", action: "create", description: "Create storage buckets" },
      { id: "storage-read", resource: "storage", action: "read", description: "View storage buckets" },
      { id: "compute-create", resource: "compute", action: "create", description: "Create compute instances" },
      { id: "compute-read", resource: "compute", action: "read", description: "View compute instances" },
    ]
  },
  {
    id: "role3",
    name: "viewer",
    displayName: "Viewer",
    description: "Read-only access to assigned resources",
    isSystem: true,
    userCount: 1,
    permissions: [
      { id: "postgresql-read", resource: "postgresql", action: "read", description: "View PostgreSQL clusters" },
      { id: "storage-read", resource: "storage", action: "read", description: "View storage buckets" },
      { id: "compute-read", resource: "compute", action: "read", description: "View compute instances" },
      { id: "billing-read", resource: "billing", action: "read", description: "View billing information" },
    ]
  },
  {
    id: "role4",
    name: "custom-db-admin",
    displayName: "Database Administrator",
    description: "Full access to database resources",
    isSystem: false,
    userCount: 0,
    permissions: [
      { id: "postgresql-create", resource: "postgresql", action: "create", description: "Create PostgreSQL clusters" },
      { id: "postgresql-read", resource: "postgresql", action: "read", description: "View PostgreSQL clusters" },
      { id: "postgresql-update", resource: "postgresql", action: "update", description: "Update PostgreSQL clusters" },
      { id: "postgresql-delete", resource: "postgresql", action: "delete", description: "Delete PostgreSQL clusters" },
      { id: "postgresql-scale", resource: "postgresql", action: "scale", description: "Scale PostgreSQL instances" },
      { id: "postgresql-backup", resource: "postgresql", action: "backup", description: "Manage PostgreSQL backups" },
    ]
  }
]

export default function IAMPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [searchQuery, setSearchQuery] = useState("")
  
  // User management state
  const [users, setUsers] = useState(mockUsers)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [userFormData, setUserFormData] = useState({
    email: "",
    name: "",
    roles: [] as string[]
  })
  
  // Role management state
  const [roles, setRoles] = useState(mockRoles)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [roleFormData, setRoleFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    permissions: [] as string[]
  })
  
  // Resource permissions state
  const [resourcePermissions, setResourcePermissions] = useState([
    {
      id: "1",
      userId: "2",
      userName: "John Developer",
      resourceId: "pg-cluster-1",
      resourceName: "Production Database",
      resource: "postgresql_cluster",
      permission: "admin",
      grantedAt: "2024-03-10T00:00:00Z",
      grantedBy: "admin@example.com"
    },
    {
      id: "2",
      userId: "3",
      userName: "Jane Viewer",
      resourceId: "bucket-1",
      resourceName: "Static Assets",
      resource: "storage_bucket",
      permission: "read",
      grantedAt: "2024-03-15T00:00:00Z",
      grantedBy: "admin@example.com"
    }
  ])
  const [showResourcePermModal, setShowResourcePermModal] = useState(false)
  const [resourcePermFormData, setResourcePermFormData] = useState({
    userId: "",
    resourceId: "",
    resourceName: "",
    resource: "",
    permission: ""
  })

  // Filter functions
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredResourcePerms = resourcePermissions.filter(perm =>
    perm.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.resourceName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // User management functions
  const openUserModal = (user?: any) => {
    if (user) {
      setEditingUser(user)
      setUserFormData({
        email: user.email,
        name: user.name || "",
        roles: user.roles.map((r: any) => r.id)
      })
    } else {
      setEditingUser(null)
      setUserFormData({ email: "", name: "", roles: [] })
    }
    setShowUserModal(true)
  }
  
  const saveUser = () => {
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? {
              ...u,
              ...userFormData,
              roles: roles.filter(r => userFormData.roles.includes(r.id))
            }
          : u
      ))
    } else {
      const newUser = {
        id: Date.now().toString(),
        ...userFormData,
        status: "active" as const,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        roles: roles.filter(r => userFormData.roles.includes(r.id))
      }
      setUsers([...users, newUser])
    }
    setShowUserModal(false)
  }
  
  const deleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId))
  }
  
  // Role management functions
  const openRoleModal = (role?: any) => {
    if (role) {
      setEditingRole(role)
      setRoleFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description || "",
        permissions: role.permissions.map((p: any) => p.id)
      })
    } else {
      setEditingRole(null)
      setRoleFormData({ name: "", displayName: "", description: "", permissions: [] })
    }
    setShowRoleModal(true)
  }
  
  const saveRole = () => {
    // Simplified permissions for demo
    const allPermissions = [
      { id: "postgresql-create", resource: "postgresql", action: "create", description: "Create PostgreSQL clusters" },
      { id: "postgresql-read", resource: "postgresql", action: "read", description: "View PostgreSQL clusters" },
      { id: "storage-create", resource: "storage", action: "create", description: "Create storage buckets" },
      { id: "storage-read", resource: "storage", action: "read", description: "View storage buckets" },
      { id: "compute-create", resource: "compute", action: "create", description: "Create compute instances" },
      { id: "billing-read", resource: "billing", action: "read", description: "View billing information" },
    ]
    
    if (editingRole && !editingRole.isSystem) {
      setRoles(roles.map(r => 
        r.id === editingRole.id 
          ? {
              ...r,
              ...roleFormData,
              permissions: allPermissions.filter(p => roleFormData.permissions.includes(p.id))
            }
          : r
      ))
    } else if (!editingRole) {
      const newRole = {
        id: Date.now().toString(),
        ...roleFormData,
        isSystem: false,
        userCount: 0,
        permissions: allPermissions.filter(p => roleFormData.permissions.includes(p.id))
      }
      setRoles([...roles, newRole])
    }
    setShowRoleModal(false)
  }
  
  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role && !role.isSystem) {
      setRoles(roles.filter(r => r.id !== roleId))
    }
  }

  // Resource permission functions
  const saveResourcePermission = () => {
    const newPerm = {
      id: Date.now().toString(),
      ...resourcePermFormData,
      userName: users.find(u => u.id === resourcePermFormData.userId)?.name || "",
      grantedAt: new Date().toISOString(),
      grantedBy: "current@user.com"
    }
    setResourcePermissions([...resourcePermissions, newPerm])
    setShowResourcePermModal(false)
    setResourcePermFormData({
      userId: "",
      resourceId: "",
      resourceName: "",
      resource: "",
      permission: ""
    })
  }
  
  const revokeResourcePermission = (permId: string) => {
    setResourcePermissions(resourcePermissions.filter(p => p.id !== permId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>
      default:
        return null
    }
  }

  return (
    <ResizableLayout currentPage="iam">
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Identity & Access Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage users, roles, and permissions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <KeyIcon className="w-4 h-4" />
              Resource Permissions
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="flex-1 overflow-hidden">
            <Card className="h-full flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Users</h2>
                  <p className="text-sm text-muted-foreground">Manage user accounts and role assignments</p>
                </div>
                <Button onClick={() => openUserModal()}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="text-left text-sm">
                      <th className="px-6 py-3 font-medium">User</th>
                      <th className="px-6 py-3 font-medium">Roles</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Last Active</th>
                      <th className="px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-muted/25 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map(role => (
                              <Badge key={role.id} variant="secondary" className="text-xs">
                                {role.displayName}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openUserModal(user)}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="flex-1 overflow-hidden">
            <Card className="h-full flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Roles</h2>
                  <p className="text-sm text-muted-foreground">Define roles and their permissions</p>
                </div>
                <Button onClick={() => openRoleModal()}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="grid gap-4">
                  {filteredRoles.map(role => (
                    <Card key={role.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{role.displayName}</h3>
                            {role.isSystem && (
                              <Badge variant="outline" className="text-xs">System</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!role.isSystem && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openRoleModal(role)}
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteRole(role.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Permissions:</div>
                        <div className="flex flex-wrap gap-2">
                          {['postgresql', 'storage', 'compute', 'billing', 'iam'].map(resource => {
                            const count = role.permissions.filter(p => p.resource === resource).length
                            if (count === 0) return null
                            return (
                              <div key={resource} className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {resource}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  ({count})
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Resource Permissions Tab */}
          <TabsContent value="permissions" className="flex-1 overflow-hidden">
            <Card className="h-full flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Resource Permissions</h2>
                  <p className="text-sm text-muted-foreground">Manage direct resource access grants</p>
                </div>
                <Button onClick={() => setShowResourcePermModal(true)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Grant Permission
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="text-left text-sm">
                      <th className="px-6 py-3 font-medium">User</th>
                      <th className="px-6 py-3 font-medium">Resource</th>
                      <th className="px-6 py-3 font-medium">Permission</th>
                      <th className="px-6 py-3 font-medium">Granted</th>
                      <th className="px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredResourcePerms.map(perm => (
                      <tr key={perm.id} className="hover:bg-muted/25 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{perm.userName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{perm.resourceName}</div>
                            <div className="text-sm text-muted-foreground">{perm.resource}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary">{perm.permission}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>{new Date(perm.grantedAt).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">by {perm.grantedBy}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => revokeResourcePermission(perm.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Revoke
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Modal */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-lg">
            <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userFormData.email}
                  onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                  placeholder="user@example.com"
                  disabled={!!editingUser}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="user-name">Name</Label>
                <Input
                  id="user-name"
                  value={userFormData.name}
                  onChange={e => setUserFormData({...userFormData, name: e.target.value})}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Roles</Label>
                <div className="space-y-2 mt-2">
                  {roles.map(role => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Switch
                        id={`role-${role.id}`}
                        checked={userFormData.roles.includes(role.id)}
                        onCheckedChange={checked => {
                          if (checked) {
                            setUserFormData({
                              ...userFormData,
                              roles: [...userFormData.roles, role.id]
                            })
                          } else {
                            setUserFormData({
                              ...userFormData,
                              roles: userFormData.roles.filter(r => r !== role.id)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                        <div>
                          <div className="font-medium">{role.displayName}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={saveUser}>
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Role Modal */}
        <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={roleFormData.name}
                  onChange={e => setRoleFormData({...roleFormData, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  placeholder="custom_role"
                  disabled={!!editingRole}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Lowercase, underscores only</p>
              </div>
              <div>
                <Label htmlFor="role-display">Display Name</Label>
                <Input
                  id="role-display"
                  value={roleFormData.displayName}
                  onChange={e => setRoleFormData({...roleFormData, displayName: e.target.value})}
                  placeholder="Custom Role"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role-desc">Description</Label>
                <Textarea
                  id="role-desc"
                  value={roleFormData.description}
                  onChange={e => setRoleFormData({...roleFormData, description: e.target.value})}
                  placeholder="Describe the purpose of this role"
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="space-y-4 mt-2">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">PostgreSQL</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'postgresql-create', label: 'Create clusters' },
                        { id: 'postgresql-read', label: 'View clusters' },
                        { id: 'postgresql-update', label: 'Update clusters' },
                        { id: 'postgresql-delete', label: 'Delete clusters' },
                      ].map(perm => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Switch
                            id={perm.id}
                            checked={roleFormData.permissions.includes(perm.id)}
                            onCheckedChange={checked => {
                              if (checked) {
                                setRoleFormData({
                                  ...roleFormData,
                                  permissions: [...roleFormData.permissions, perm.id]
                                })
                              } else {
                                setRoleFormData({
                                  ...roleFormData,
                                  permissions: roleFormData.permissions.filter(p => p !== perm.id)
                                })
                              }
                            }}
                            disabled={editingRole?.isSystem}
                          />
                          <Label htmlFor={perm.id} className="text-sm cursor-pointer">
                            {perm.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Storage</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'storage-create', label: 'Create buckets' },
                        { id: 'storage-read', label: 'View buckets' },
                        { id: 'storage-upload', label: 'Upload files' },
                        { id: 'storage-delete', label: 'Delete buckets' },
                      ].map(perm => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Switch
                            id={perm.id}
                            checked={roleFormData.permissions.includes(perm.id)}
                            onCheckedChange={checked => {
                              if (checked) {
                                setRoleFormData({
                                  ...roleFormData,
                                  permissions: [...roleFormData.permissions, perm.id]
                                })
                              } else {
                                setRoleFormData({
                                  ...roleFormData,
                                  permissions: roleFormData.permissions.filter(p => p !== perm.id)
                                })
                              }
                            }}
                            disabled={editingRole?.isSystem}
                          />
                          <Label htmlFor={perm.id} className="text-sm cursor-pointer">
                            {perm.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Compute</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'compute-create', label: 'Create instances' },
                        { id: 'compute-read', label: 'View instances' },
                        { id: 'compute-restart', label: 'Restart instances' },
                        { id: 'compute-logs', label: 'View logs' },
                      ].map(perm => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Switch
                            id={perm.id}
                            checked={roleFormData.permissions.includes(perm.id)}
                            onCheckedChange={checked => {
                              if (checked) {
                                setRoleFormData({
                                  ...roleFormData,
                                  permissions: [...roleFormData.permissions, perm.id]
                                })
                              } else {
                                setRoleFormData({
                                  ...roleFormData,
                                  permissions: roleFormData.permissions.filter(p => p !== perm.id)
                                })
                              }
                            }}
                            disabled={editingRole?.isSystem}
                          />
                          <Label htmlFor={perm.id} className="text-sm cursor-pointer">
                            {perm.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Billing & IAM</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'billing-read', label: 'View billing' },
                        { id: 'billing-manage', label: 'Manage billing' },
                        { id: 'iam-manage_users', label: 'Manage users' },
                        { id: 'iam-manage_roles', label: 'Manage roles' },
                      ].map(perm => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Switch
                            id={perm.id}
                            checked={roleFormData.permissions.includes(perm.id)}
                            onCheckedChange={checked => {
                              if (checked) {
                                setRoleFormData({
                                  ...roleFormData,
                                  permissions: [...roleFormData.permissions, perm.id]
                                })
                              } else {
                                setRoleFormData({
                                  ...roleFormData,
                                  permissions: roleFormData.permissions.filter(p => p !== perm.id)
                                })
                              }
                            }}
                            disabled={editingRole?.isSystem}
                          />
                          <Label htmlFor={perm.id} className="text-sm cursor-pointer">
                            {perm.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={saveRole}
                  disabled={!roleFormData.name || !roleFormData.displayName || editingRole?.isSystem}
                >
                  {editingRole ? 'Update' : 'Create'} Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resource Permission Modal */}
        <Dialog open={showResourcePermModal} onOpenChange={setShowResourcePermModal}>
          <DialogContent className="max-w-lg">
            <DialogTitle>Grant Resource Permission</DialogTitle>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="perm-user">User</Label>
                <Select 
                  value={resourcePermFormData.userId}
                  onValueChange={v => setResourcePermFormData({...resourcePermFormData, userId: v})}
                >
                  <SelectTrigger id="perm-user" className="mt-1">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="perm-resource-type">Resource Type</Label>
                <Select 
                  value={resourcePermFormData.resource}
                  onValueChange={v => setResourcePermFormData({...resourcePermFormData, resource: v})}
                >
                  <SelectTrigger id="perm-resource-type" className="mt-1">
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql_cluster">PostgreSQL Cluster</SelectItem>
                    <SelectItem value="storage_bucket">Storage Bucket</SelectItem>
                    <SelectItem value="compute_instance">Compute Instance</SelectItem>
                    <SelectItem value="lambda_function">Lambda Function</SelectItem>
                    <SelectItem value="secret">Secret</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="perm-resource-id">Resource ID</Label>
                <Input
                  id="perm-resource-id"
                  value={resourcePermFormData.resourceId}
                  onChange={e => setResourcePermFormData({...resourcePermFormData, resourceId: e.target.value})}
                  placeholder="resource-123"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="perm-resource-name">Resource Name (Display)</Label>
                <Input
                  id="perm-resource-name"
                  value={resourcePermFormData.resourceName}
                  onChange={e => setResourcePermFormData({...resourcePermFormData, resourceName: e.target.value})}
                  placeholder="Production Database"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="perm-level">Permission Level</Label>
                <Select 
                  value={resourcePermFormData.permission}
                  onValueChange={v => setResourcePermFormData({...resourcePermFormData, permission: v})}
                >
                  <SelectTrigger id="perm-level" className="mt-1">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={saveResourcePermission}
                  disabled={!resourcePermFormData.userId || !resourcePermFormData.resourceId || !resourcePermFormData.permission}
                >
                  Grant Permission
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ResizableLayout>
  )
}