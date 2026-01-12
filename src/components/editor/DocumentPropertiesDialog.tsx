import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Shield,
  Calendar,
  User,
  Tag,
  Key,
} from 'lucide-react';
import { DocumentProperties, DocumentPermissions } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface DocumentPropertiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  properties: DocumentProperties;
  onSave: (properties: DocumentProperties) => void;
}

export const DocumentPropertiesDialog: React.FC<DocumentPropertiesDialogProps> = ({
  isOpen,
  onClose,
  properties,
  onSave,
}) => {
  const [localProperties, setLocalProperties] = useState<DocumentProperties>(properties);
  const [keywordInput, setKeywordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    onSave(localProperties);
    onClose();
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setLocalProperties((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setLocalProperties((prev) => ({
      ...prev,
      keywords: prev.keywords?.filter((_, i) => i !== index),
    }));
  };

  const updatePermission = (key: keyof DocumentPermissions, value: any) => {
    setLocalProperties((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: value,
      },
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Properties
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">
              <FileText className="w-4 h-4 mr-1" />
              General
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-1" />
              Security
            </TabsTrigger>
            <TabsTrigger value="metadata">
              <Tag className="w-4 h-4 mr-1" />
              Metadata
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1 py-4">
            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={localProperties.title || ''}
                  onChange={(e) =>
                    setLocalProperties((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Document title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="author"
                    value={localProperties.author || ''}
                    onChange={(e) =>
                      setLocalProperties((prev) => ({ ...prev, author: e.target.value }))
                    }
                    placeholder="Author name"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Textarea
                  id="subject"
                  value={localProperties.subject || ''}
                  onChange={(e) =>
                    setLocalProperties((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder="Brief description of the document"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Created
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {localProperties.creationDate?.toLocaleDateString() || 'Not set'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Modified
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {localProperties.modificationDate?.toLocaleDateString() || 'Not set'}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4 mt-0">
              <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <h4 className="font-medium">Password Protection</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Document Password</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={localProperties.password || ''}
                        onChange={(e) =>
                          setLocalProperties((prev) => ({ ...prev, password: e.target.value }))
                        }
                        placeholder="Enter password"
                        className="pl-9"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no password protection
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Document Permissions</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Printing</Label>
                      <p className="text-xs text-muted-foreground">Allow printing the document</p>
                    </div>
                    <Select
                      value={localProperties.permissions?.printing || 'high-res'}
                      onValueChange={(value) =>
                        updatePermission('printing', value as 'none' | 'low-res' | 'high-res')
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-res">High Quality</SelectItem>
                        <SelectItem value="low-res">Low Quality</SelectItem>
                        <SelectItem value="none">Not Allowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Copying</Label>
                      <p className="text-xs text-muted-foreground">Allow copying content</p>
                    </div>
                    <Switch
                      checked={localProperties.permissions?.copying !== false}
                      onCheckedChange={(checked) => updatePermission('copying', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Editing</Label>
                      <p className="text-xs text-muted-foreground">Allow content modifications</p>
                    </div>
                    <Switch
                      checked={localProperties.permissions?.editing !== false}
                      onCheckedChange={(checked) => updatePermission('editing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Annotating</Label>
                      <p className="text-xs text-muted-foreground">Allow adding annotations</p>
                    </div>
                    <Switch
                      checked={localProperties.permissions?.annotating !== false}
                      onCheckedChange={(checked) => updatePermission('annotating', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Form Filling</Label>
                      <p className="text-xs text-muted-foreground">Allow filling form fields</p>
                    </div>
                    <Switch
                      checked={localProperties.permissions?.formFilling !== false}
                      onCheckedChange={(checked) => updatePermission('formFilling', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="creator">Creator Application</Label>
                <Input
                  id="creator"
                  value={localProperties.creator || ''}
                  onChange={(e) =>
                    setLocalProperties((prev) => ({ ...prev, creator: e.target.value }))
                  }
                  placeholder="e.g., DocBuilder"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="producer">PDF Producer</Label>
                <Input
                  id="producer"
                  value={localProperties.producer || ''}
                  onChange={(e) =>
                    setLocalProperties((prev) => ({ ...prev, producer: e.target.value }))
                  }
                  placeholder="e.g., DocBuilder PDF Engine"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Add keyword"
                  />
                  <Button variant="outline" onClick={addKeyword}>
                    Add
                  </Button>
                </div>
                {localProperties.keywords && localProperties.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {localProperties.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeKeyword(index)}
                      >
                        {keyword}
                        <span className="ml-1 text-muted-foreground">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Properties</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
