import React, { useState } from 'react';
import { Cloud, RefreshCw, FileText, Download, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExternalTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  app: string;
  elements?: any[];
}

interface ConnectionStatus {
  url: string;
  status: 'connected' | 'error' | 'pending';
}

interface ApiIntegrationsPanelProps {
  onImportTemplate: (template: ExternalTemplate) => void;
}

export const ApiIntegrationsPanel: React.FC<ApiIntegrationsPanelProps> = ({
  onImportTemplate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<ExternalTemplate[]>([]);
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discoveryInfo, setDiscoveryInfo] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    setDiscoveryInfo(null);

    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const { data, error: fnError } = await supabase.functions.invoke('fetch-wm-templates', {
        headers,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.success) {
        setConnection({
          url: data.connection?.url || 'wm-compliance.lovable.app',
          status: 'connected',
        });

        const fetchedTemplates: ExternalTemplate[] = [];
        
        // Process templates
        if (data.templates && Array.isArray(data.templates)) {
          data.templates.forEach((t: any) => {
            fetchedTemplates.push({
              id: t.id || t.template_id,
              name: t.name || t.title || 'Untitled Template',
              description: t.description,
              category: t.category || 'Template',
              app: 'wm-compliance',
            });
          });
        }

        // Process reports
        if (data.reports && Array.isArray(data.reports)) {
          data.reports.forEach((r: any) => {
            fetchedTemplates.push({
              id: r.id || r.report_id,
              name: r.name || r.title || 'Untitled Report',
              description: r.description,
              category: r.category || 'Report',
              app: 'wm-compliance',
            });
          });
        }

        setTemplates(fetchedTemplates);

        // Show discovery info if no templates found
        if (fetchedTemplates.length === 0 && data.discovery) {
          setDiscoveryInfo(data.discovery.suggestion || data.discovery.note);
        }

        toast({
          title: 'Connection successful',
          description: `Found ${fetchedTemplates.length} templates from WM Compliance`,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch templates');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      setConnection({
        url: 'wm-compliance.lovable.app',
        status: 'error',
      });
      toast({
        title: 'Connection failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (template: ExternalTemplate) => {
    // Pass template with category for smart element generation
    onImportTemplate({
      ...template,
      category: template.category,
    });
    toast({
      title: 'Template imported',
      description: `"${template.name}" has been loaded with starter elements based on its category`,
    });
  };

  return (
    <div className="w-72 border-r border-sidebar-border bg-sidebar flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-primary" />
          <span>API Integrations</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={fetchTemplates}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3">
        {/* Connection Status */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">WM Compliance</span>
            {connection && (
              <Badge variant={connection.status === 'connected' ? 'default' : 'destructive'} className="text-[10px]">
                {connection.status === 'connected' ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Error</>
                )}
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            wm-compliance.lovable.app
          </p>
        </div>

        {/* Fetch Button */}
        {!connection && !isLoading && (
          <Button 
            onClick={fetchTemplates} 
            className="w-full mb-4"
            variant="outline"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Connect & Fetch Templates
          </Button>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Connection Error</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={fetchTemplates}
            >
              Retry Connection
            </Button>
          </div>
        )}

        {/* Discovery Info */}
        {discoveryInfo && !isLoading && templates.length === 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600">Setup Required</p>
                <p className="text-xs text-muted-foreground mt-1">{discoveryInfo}</p>
              </div>
            </div>
          </div>
        )}

        {/* Templates List */}
        {templates.length > 0 && !isLoading && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Available Templates ({templates.length})
            </p>
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-3 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{template.name}</p>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {template.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        from {template.app}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => handleImport(template)}
                >
                  <Download className="w-3 h-3 mr-2" />
                  Import to Editor
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {connection && templates.length === 0 && !isLoading && !discoveryInfo && (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No templates found</p>
            <Button 
              variant="link" 
              size="sm" 
              className="mt-2"
              onClick={fetchTemplates}
            >
              Refresh
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-xs text-muted-foreground"
          asChild
        >
          <a href="https://wm-compliance.lovable.app" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3 mr-2" />
            Open WM Compliance
          </a>
        </Button>
      </div>
    </div>
  );
};
