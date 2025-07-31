import { useState, useEffect, useRef } from "react";
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
  ArrowDownTrayIcon,
  EyeIcon,
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
  const [objectsLoading, setObjectsLoading] = useState(false);
  const [objects, setObjects] = useState<StorageObject[]>([]);

  // Add bucket modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Upload file modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadKey, setUploadKey] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewObject, setPreviewObject] = useState<StorageObject | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const dragCounter = useRef(0);

  // Duplicate file warning state
  const [duplicateFiles, setDuplicateFiles] = useState<string[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const bucket = buckets.find((b) => b.name === selectedBucket);

  const fetchBucketObjects = async (bucketName: string) => {
    try {
      setObjectsLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/storage/buckets/${bucketName}/objects`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch objects: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched objects:", data);
      setObjects(data);
    } catch (err) {
      console.error("Error fetching objects:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch objects");
    } finally {
      setObjectsLoading(false);
    }
  };

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
        fetchBucketObjects(data[0].name);
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

  const uploadFileToStorage = async (forceOverwrite: boolean = false) => {
    if (!uploadFile || !selectedBucket) {
      setUploadError("Please select a file");
      return;
    }

    const fileKey = uploadKey.trim() || uploadFile.name;

    // Check if file already exists
    if (!forceOverwrite && objects.some(obj => obj.key === fileKey)) {
      setUploadError(`File "${fileKey}" already exists in this bucket. Please choose a different name or remove the existing file.`);
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUploadError("No authentication token found");
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("key", fileKey);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/storage/buckets/${selectedBucket}/objects`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to upload file: ${response.status}`
        );
      }

      // Reset form and close modal
      setUploadFile(null);
      setUploadKey("");
      setIsUploadModalOpen(false);

      // Refresh objects list
      await fetchBucketObjects(selectedBucket);
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload file"
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadKey("");
    setUploadError(null);
  };

  const downloadFile = async (object: StorageObject) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/storage/buckets/${selectedBucket}/objects/${encodeURIComponent(object.key)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = object.key.split("/").pop() || object.key;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading file:", err);
      setError(err instanceof Error ? err.message : "Failed to download file");
    }
  };

  const previewFile = async (object: StorageObject) => {
    setPreviewObject(object);
    setIsPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewContent(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/storage/buckets/${selectedBucket}/objects/${encodeURIComponent(object.key)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to preview file: ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type") || "";
      
      if (contentType.startsWith("image/")) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPreviewContent(url);
      } else if (contentType.startsWith("text/") || contentType.includes("json") || contentType.includes("javascript")) {
        const text = await response.text();
        setPreviewContent(text);
      } else {
        setPreviewContent("Preview not available for this file type");
      }
    } catch (err) {
      console.error("Error previewing file:", err);
      setPreviewContent("Error loading preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const getFileType = (key: string): string => {
    const ext = key.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
    if (["txt", "json", "js", "ts", "jsx", "tsx", "css", "html", "xml", "md"].includes(ext)) return "text";
    if (["pdf"].includes(ext)) return "pdf";
    return "other";
  };

  const uploadMultipleFiles = async (files: FileList, forceOverwrite: boolean = false) => {
    if (!selectedBucket) {
      setError("Please select a bucket first");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("No authentication token found");
      return;
    }

    // Check for duplicate files
    if (!forceOverwrite) {
      const fileNames = Array.from(files).map(f => f.name);
      const existingFiles = objects.map(obj => obj.key);
      const duplicates = fileNames.filter(name => existingFiles.includes(name));
      
      if (duplicates.length > 0) {
        setDuplicateFiles(duplicates);
        setShowDuplicateWarning(true);
        // Store the files temporarily to upload if user chooses to overwrite
        (window as any).pendingUploadFiles = files;
        return;
      }
    }

    // Track uploading files
    const fileNames = Array.from(files).map(f => f.name);
    setUploadingFiles(fileNames);

    try {
      // Upload files in parallel
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("key", file.name);

        return fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/storage/buckets/${selectedBucket}/objects`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      });

      const results = await Promise.allSettled(uploadPromises);
      
      // Check for any failures
      const failures = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok));
      if (failures.length > 0) {
        console.error("Some files failed to upload:", failures);
        setError(`Failed to upload ${failures.length} file(s)`);
      }

      // Refresh the file list
      await fetchBucketObjects(selectedBucket);
    } catch (err) {
      console.error("Error uploading files:", err);
      setError("Failed to upload files");
    } finally {
      setUploadingFiles([]);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadMultipleFiles(files);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBuckets();
    }
  }, [user]);

  return (
      <div 
        className="p-6 h-full flex flex-col gap-6 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
      {/* Full page drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center p-8 rounded-lg bg-background/80 border-2 border-dashed border-primary shadow-lg">
            <ArrowDownTrayIcon className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" />
            <p className="text-2xl font-semibold text-primary mb-2">Drop files anywhere</p>
            <p className="text-muted-foreground">
              {selectedBucket 
                ? `Files will be uploaded to ${selectedBucket}` 
                : "Please select a bucket first"}
            </p>
          </div>
        </div>
      )}
      
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

          {/* Upload File Modal */}
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Upload File to {selectedBucket}</DialogTitle>
                <DialogDescription>
                  Select a file to upload to your S3 bucket. You can optionally
                  specify a custom key (path/filename) for the object.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadFile(file);
                        // Auto-fill key with filename if empty
                        if (!uploadKey) {
                          setUploadKey(file.name);
                        }
                      }
                    }}
                  />
                  {uploadFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {uploadFile.name} ({formatSize(uploadFile.size)})
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="object-key">Object Key (optional)</Label>
                  <Input
                    id="object-key"
                    placeholder="path/to/file.jpg"
                    value={uploadKey}
                    onChange={(e) => setUploadKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use the original filename
                  </p>
                </div>

                {uploadError && (
                  <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/10 p-2 rounded">
                    {uploadError}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleUploadModalClose}
                  disabled={uploadLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => uploadFileToStorage()}
                  disabled={uploadLoading || !uploadFile}
                >
                  {uploadLoading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload File"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Preview Modal */}
          <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>
                  Preview: {previewObject?.key}
                </DialogTitle>
              </DialogHeader>
              
              <div className="overflow-auto max-h-[60vh]">
                {previewLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <ArrowPathIcon className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : previewContent ? (
                  <>
                    {previewObject && getFileType(previewObject.key) === "image" ? (
                      <img 
                        src={previewContent} 
                        alt={previewObject.key}
                        className="max-w-full h-auto"
                      />
                    ) : (
                      <pre className="p-4 bg-muted rounded-lg overflow-auto">
                        <code className="text-sm">{previewContent}</code>
                      </pre>
                    )}
                  </>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    No preview available
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(false)}
                >
                  Close
                </Button>
                {previewObject && (
                  <Button onClick={() => downloadFile(previewObject)}>
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Duplicate Files Warning Dialog */}
          <Dialog open={showDuplicateWarning} onOpenChange={setShowDuplicateWarning}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Files Already Exist</DialogTitle>
                <DialogDescription>
                  The following files already exist in the bucket. Do you want to overwrite them?
                </DialogDescription>
              </DialogHeader>
              
              <div className="max-h-[200px] overflow-y-auto">
                <div className="space-y-2">
                  {duplicateFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <DocumentIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDuplicateWarning(false);
                    setDuplicateFiles([]);
                    delete (window as any).pendingUploadFiles;
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const pendingFiles = (window as any).pendingUploadFiles;
                    if (pendingFiles) {
                      setShowDuplicateWarning(false);
                      setDuplicateFiles([]);
                      uploadMultipleFiles(pendingFiles, true);
                      delete (window as any).pendingUploadFiles;
                    }
                  }}
                >
                  Overwrite Files
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
                  onClick={() => {
                    setSelectedBucket(b.name);
                    fetchBucketObjects(b.name);
                  }}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Upload
                </Button>
              </div>
              <Input
                placeholder="Search objects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              {/* Uploading files indicator */}
              {uploadingFiles.length > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-sm">
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Uploading {uploadingFiles.length} file(s): {uploadingFiles.join(", ")}
                    </div>
                  </div>
                </Card>
              )}
              
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
                      <th className="text-left font-medium px-4 py-2">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {objectsLoading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center text-muted-foreground"
                        >
                          <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading objects...
                        </td>
                      </tr>
                    ) : objects.length > 0 ? (
                      objects
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
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => previewFile(obj)}
                                  className="h-8 w-8 p-0"
                                  title="Preview"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadFile(obj)}
                                  className="h-8 w-8 p-0"
                                  title="Download"
                                >
                                  <ArrowDownTrayIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-12 text-center text-muted-foreground"
                        >
                          <div>
                            <ArrowDownTrayIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No objects in this bucket.</p>
                            <p className="text-sm mt-2">Drag and drop files here or click the Upload button</p>
                          </div>
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
