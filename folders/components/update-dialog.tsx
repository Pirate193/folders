'use client'
import { useFolderStore, type Folder as FolderType } from '@/stores/folderStore'


import { Edit, Loader2 } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { DialogHeader, DialogFooter, DialogTrigger, Dialog, DialogContent,  DialogDescription, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'
import { Label } from './ui/label'

type Props = {
    trigger?: React.ReactNode,
    folder?: FolderType | null,
    onSuccess?: () => void
}

const UpdateDialog = ({ trigger, folder, onSuccess }: Props)  => {
    const { updateFolder, loading, error, clearError } = useFolderStore();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
    })

    // Initialize form with folder data when dialog opens
    useEffect(() => {
        if (folder && open) {
            setForm({
                name: folder.name || '',
                description: folder.description || '',
            });
        }
    }, [folder, open]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!folder?.id) {
            toast.error('No folder selected for update');
            return;
        }
        
        if (!form.name.trim()) {
            toast.error('Folder name is required');
            return;
        }
      
        try {
            await updateFolder(folder.id, {
                name: form.name.trim(),
                description: form.description.trim() || null,
            });
            
            toast.success('Folder updated successfully');
            setForm({ name: '', description: '' });
            setOpen(false);
            onSuccess?.();
        } catch (err) {
          console.error(err);
            toast.error('Failed to update folder');
        }
    };
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            // Reset form when closing
            setForm({ name: '', description: '' });
            clearError();
        }
    };

    // Don't render if no folder is provided
    if (!folder) {
        return null;
    }
    

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogTrigger asChild>
      {trigger || (
        <Button size="sm" className="w-full justify-start gap-2">
          <Edit className="h-4 w-4" />
          Edit Folder
        </Button>
      )}
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Update Folder</DialogTitle>
          <DialogDescription>
            Update the folder name and description.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Machine Learning Course"
              disabled={loading}
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description for this folder..."
              disabled={loading}
              maxLength={500}
              rows={3}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !form.name.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Folder
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  )
}

export default UpdateDialog