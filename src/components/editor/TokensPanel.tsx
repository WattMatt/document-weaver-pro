import React, { useState } from 'react';
import { Key, Copy, Plus, Trash2, Link, ExternalLink, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { IntegrationToken } from '@/types/editor';
import { toast } from 'sonner';

interface TokensPanelProps {
  isOpen: boolean;
  onClose: () => void;
  publicToken?: string;
  integrationTokens?: IntegrationToken[];
  onGeneratePublicToken: () => string;
}

export const TokensPanel: React.FC<TokensPanelProps> = ({
  isOpen,
  onClose,
  publicToken,
  integrationTokens = [],
  onGeneratePublicToken,
}) => {
  const [tokens, setTokens] = useState<IntegrationToken[]>(integrationTokens);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenPermissions, setNewTokenPermissions] = useState<('read' | 'write' | 'generate')[]>(['read']);
  const [generatedPublicToken, setGeneratedPublicToken] = useState(publicToken || '');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleGeneratePublicToken = () => {
    const token = onGeneratePublicToken();
    setGeneratedPublicToken(token);
    toast.success('Public token generated!');
  };

  const handleCreateToken = () => {
    if (!newTokenName.trim()) {
      toast.error('Please enter a token name');
      return;
    }

    const newToken: IntegrationToken = {
      id: uuidv4(),
      name: newTokenName,
      token: `int_${uuidv4().replace(/-/g, '')}`,
      permissions: newTokenPermissions,
      createdAt: new Date(),
    };

    setTokens([...tokens, newToken]);
    setNewTokenName('');
    setNewTokenPermissions(['read']);
    toast.success('Integration token created!');
  };

  const handleDeleteToken = (id: string) => {
    setTokens(tokens.filter((t) => t.id !== id));
    toast.success('Token deleted');
  };

  const handleCopyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const togglePermission = (permission: 'read' | 'write' | 'generate') => {
    setNewTokenPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Tokens & Integration
          </DialogTitle>
          <DialogDescription>
            Manage tokens for external application integration and PDF generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Public Access Token */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  <Link className="w-4 h-4 text-primary" />
                  Public Access Token
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow external applications to access this template for PDF generation
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Read-only
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={generatedPublicToken}
                readOnly
                placeholder="No public token generated"
                className="font-mono text-sm"
              />
              {generatedPublicToken && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyToken(generatedPublicToken)}
                >
                  {copiedToken === generatedPublicToken ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button onClick={handleGeneratePublicToken}>
                {generatedPublicToken ? 'Regenerate' : 'Generate'}
              </Button>
            </div>

            {generatedPublicToken && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">API Endpoint:</p>
                <code className="text-xs bg-background px-2 py-1 rounded block">
                  GET /api/templates/{'{publicToken}'}/generate
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Send a POST request with JSON data to populate dynamic fields
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Integration Tokens */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                Integration Tokens
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create tokens to connect your applications and extract/generate PDFs
              </p>
            </div>

            {/* Existing Tokens */}
            {tokens.length > 0 && (
              <div className="space-y-2">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{token.name}</span>
                        <div className="flex gap-1">
                          {token.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-[10px] px-1.5 py-0">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <code className="text-xs text-muted-foreground font-mono truncate block mt-1">
                        {token.token.slice(0, 20)}...
                      </code>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyToken(token.token)}
                      >
                        {copiedToken === token.token ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteToken(token.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create New Token */}
            <div className="bg-muted/30 rounded-lg border p-4 space-y-4">
              <Label className="text-sm font-medium">Create New Token</Label>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Token Name</Label>
                  <Input
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="e.g., CRM Integration"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Permissions</Label>
                  <div className="flex items-center gap-4 h-10">
                    {(['read', 'write', 'generate'] as const).map((perm) => (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={newTokenPermissions.includes(perm)}
                          onCheckedChange={() => togglePermission(perm)}
                        />
                        <span className="text-sm capitalize">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleCreateToken} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Token
              </Button>
            </div>
          </div>

          <Separator />

          {/* Usage Examples */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Quick Start Examples</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Extract template data:</p>
              <code className="text-xs bg-background px-2 py-1 rounded block">
                curl -H "Authorization: Bearer YOUR_TOKEN" \\
                &nbsp;&nbsp;https://api.docbuilder.com/v1/templates
              </code>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Generate PDF:</p>
              <code className="text-xs bg-background px-2 py-1 rounded block whitespace-pre-wrap">
{`curl -X POST \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"customer_name": "John Doe"}' \\
  https://api.docbuilder.com/v1/generate`}
              </code>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
