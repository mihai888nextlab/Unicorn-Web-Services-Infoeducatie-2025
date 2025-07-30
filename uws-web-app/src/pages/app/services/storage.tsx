import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArchiveBoxIcon,
  FolderIcon,
  DocumentIcon,
  ArrowPathIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import type { NextPageWithLayout } from "../../_app";
import { useAuth } from "@/hooks/useAuth";
interface Bucket {
  createdAt: string;
  displayName: string;
  endpoint: string;
  id: string;
  name: string;
  objectCount: number;
  public: boolean;
  region: string;
  totalSize: number;
  url: string;
  objects?: StorageObject[];
}

interface StorageObject {
  key: string;
  size: number;
  lastModified: string;
}

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  if (bytes > 1024) return (bytes / 1024).toFixed(2) + " KB";
  return bytes + " B";
}

const StoragePage: NextPageWithLayout = () => {
  const { user } = useAuth();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add bucket modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const bucket = buckets.find((b) => b.name === selectedBucket);

  const fetchBuckets = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/storage/buckets`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch buckets: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched buckets:", data);
      setBuckets(data);

      // Select first bucket by default if none selected
      if (data.length > 0 && !selectedBucket) {
        setSelectedBucket(data[0].name);
      }
    } catch (err) {
      console.error("Error fetching buckets:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch buckets");
    } finally {
      setLoading(false);
    }
  };

  const createBucket = async () => {
    if (!newBucketName.trim()) {
      setCreateError("Bucket name is required");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setCreateError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/storage/buckets`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newBucketName.trim(),
            public: isPublic,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating bucket:", errorData);
        throw new Error(
          errorData.message || `Failed to create bucket: ${response.status}`
        );
      }

      // Reset form and close modal
      setNewBucketName("");
      setIsPublic(false);
      setIsAddModalOpen(false);

      // Refresh buckets list
      await fetchBuckets();
    } catch (err) {
      console.error("Error creating bucket:", err);
      setCreateError(
        err instanceof Error ? err.message : "Failed to create bucket"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setNewBucketName("");
    setIsPublic(false);
    setCreateError(null);
  };

  useEffect(() => {
    if (user) {
      fetchBuckets();
    }
  }, [user]);

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <ArchiveBoxIcon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">S3 Storage</h1>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBuckets}
            disabled={loading}
          >
            <ArrowPathIcon
              className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="w-4 h-4 mr-1" />
                New Bucket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Bucket</DialogTitle>
                <DialogDescription>
                  Create a new S3 storage bucket. Bucket names must be unique
                  and follow naming conventions.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bucket-name">Bucket Name</Label>
                  <Input
                    id="bucket-name"
                    placeholder="my-bucket-name"
                    value={newBucketName}
                    onChange={(e) => setNewBucketName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !createLoading && createBucket()
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be lowercase, no spaces, and globally unique
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public-access"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public-access" className="text-sm">
                    Public access
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow public read access to objects in this bucket
                </p>

                {createError && (
                  <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/10 p-2 rounded">
                    {createError}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleModalClose}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createBucket}
                  disabled={createLoading || !newBucketName.trim()}
                >
                  {createLoading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Bucket"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <div className="p-4">
            <div className="text-red-800 dark:text-red-200 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-6">
        {/* Buckets List */}
        <div className="w-64 min-w-[200px]">
          <h2 className="font-semibold mb-2 text-sm text-muted-foreground">
            Buckets {buckets.length > 0 && `(${buckets.length})`}
          </h2>
          <div className="flex flex-col gap-1">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : buckets.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">
                No buckets found
              </div>
            ) : (
              buckets.map((b) => (
                <Card
                  key={b.name}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer border transition-colors ${
                    selectedBucket === b.name
                      ? "border-primary bg-accent/40"
                      : "hover:bg-accent/20"
                  }`}
                  onClick={() => setSelectedBucket(b.name)}
                >
                  <FolderIcon className="w-5 h-5 text-primary/80" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{b.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.region}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Bucket Details & Objects */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <ArrowPathIcon className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : bucket ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">{bucket.name}</h2>
                <span className="text-xs text-muted-foreground">
                  Region: {bucket.region}
                </span>
                <span className="text-xs text-muted-foreground">
                  Created: {bucket.createdAt}
                </span>
                <Button variant="outline" size="sm" className="ml-auto">
                  Upload
                </Button>
              </div>
              <Input
                placeholder="Search objects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <div className="rounded-lg border bg-background overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left font-medium px-4 py-2">
                        Object
                      </th>
                      <th className="text-left font-medium px-4 py-2">Size</th>
                      <th className="text-left font-medium px-4 py-2">
                        Last Modified
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bucket.objects && bucket.objects.length > 0 ? (
                      bucket.objects
                        .filter((obj) =>
                          obj.key.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((obj) => (
                          <tr
                            key={obj.key}
                            className="border-b last:border-0 hover:bg-accent/20 transition-colors"
                          >
                            <td className="px-4 py-2 flex items-center gap-2">
                              <DocumentIcon className="w-4 h-4 text-muted-foreground" />
                              {obj.key}
                            </td>
                            <td className="px-4 py-2">
                              {formatSize(obj.size)}
                            </td>
                            <td className="px-4 py-2">{obj.lastModified}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-6 text-center text-muted-foreground"
                        >
                          No objects in this bucket.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : !loading && buckets.length > 0 ? (
            <div className="text-muted-foreground">
              Select a bucket to view its contents.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

StoragePage.getLayout = function getLayout(page: ReactElement) {
  return <ResizableLayout currentPage="services">{page}</ResizableLayout>;
};

export default StoragePage;
