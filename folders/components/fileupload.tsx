'use client'
import { FileRecord, useFileStore } from "@/stores/fileStore";
import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  File,
  FileText,
  Image,
  MoreVertical,
  Plus,
  Trash2,
  Upload,
  VideoIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import DeleteDialog from "./deleteDialog";

function FileUpload({ folderId }: { folderId: string }) {
  const router = useRouter();
  const {
    files,
    fetchFiles,
    deleteFile,
    uploadFile,
    isloading,
    uploadProgress,
    error,
    clearError,
  } = useFileStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filetodeleteId, setFileToDeleteId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filetodelete = files.find((file) => file.id === filetodeleteId);

  //fetch files
  useEffect(() => {
    fetchFiles(folderId);
  }, [folderId, fetchFiles]);
  //clear error
  useEffect(() => {
    if (error) {
      setTimeout(() => clearError(), 5000);
    }
  }, [error, clearError]);

  const handlefileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;
      Array.from(selectedFiles).forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(
            `${file.name} is too large. Please select a file smaller than 10MB`
          );
          return;
        }
        uploadFile(file, folderId);
      });
    },
    [folderId, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      handlefileSelect(files);
    },
    [handlefileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const handleDragleave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  const handleDelete = async () => {
    if (!filetodeleteId) return;
    try {
      const succes = await deleteFile(filetodeleteId);
      if (succes) {
        toast.success("file deleted successfully");
      } else {
        toast.error("file deletion failed");
      }
    } catch (error) {
      console.error("error deleting file", error);
      toast.error("file deletion failed");
    } finally {
      setShowDeleteDialog(false);
      setFileToDeleteId(null);
    }
  };
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "image":
        return <Image className="h-8 w-8 text-blue-500" />;
      case "doc":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "video":
        return <VideoIcon className="h-8 w-8 text-blue-500" />;
      default:
        return "file";
    }
  };
  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return "bg-red-100 text-red-500";
      case "image":
        return "bg-blue-100 text-blue-500";
      case "doc":
        return "bg-blue-100 text-blue-500";
      default:
        return "blue";
    }
  };
  const handleViewFile = (file: FileRecord) => {
    router.push(`/folders/${folderId}/files/${file.id}`);
    
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Uplaod files</CardTitle>
          <CardDescription>upload files to your folder</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragleave}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text- lg font-medium">
                Drop files here or click browse
              </p>
              <p className="text-sm text-gray-500">
                supports PDF, Images, Docs, upto 10MB
              </p>
              <Button
                className="mt-4"
                disabled={isloading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                choose files
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.rtf,.mp4,.avi"
                onChange={(e) => handlefileSelect(e.target.files)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      {uploadProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadProgress.map((progress) => (
              <div key={progress.fileId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {progress.status === "completed" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {progress.status === "failed" && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    {progress.status === "uploading" && (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className="text-sm font-medium truncate">
                      {progress.fileName}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {progress.progress}%
                  </span>
                  
                </div>
                <Progress value={progress.progress} className='h-2' />
               {progress.error &&(
                <p className="text-xs text-red-500"> {progress.error}</p>
               )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium truncate">{error}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    
      {/* Files List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Files ({files.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFiles(folderId)}
              disabled={isloading}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isloading && files.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No files uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <Card
                  key={file.id}
                  className="group hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1 ">
                        {getFileIcon(file.file_type)}
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-medium truncate"
                            title={file.file_name}
                          >
                            {file.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2" >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">

                           <DropdownMenuItem  onClick={()=>handleViewFile(file)} >
                            <Eye className="mr-2 h-4 w-4"/>
                            View 
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setFileToDeleteId(file.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        getFileTypeColor(file.file_type)
                      )}
                    >
                      {file.file_type.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              
            </div>
          )}
        </CardContent>
      </Card>

      {filetodelete && (
        <DeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete file"
          description={`Are you sure you want to delete ${filetodelete.file_name} `}
          onConfirm={handleDelete}
          itemName={filetodelete.file_name}
        />
      )}
    </div>
  );
}

export default FileUpload;
