import React, { useState } from 'react';
import { Download, Copy, Clipboard, Check, FileJson, Package } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Template } from '@/types/editor';
import {
    downloadTemplateAsJSON,
    downloadForPDFMakerIntegration,
    copyTemplateToClipboard,
    getTemplateExportString,
} from '@/lib/templateExporter';
import { extractDynamicFields, PDFMAKER_SCHEMA_VERSION } from '@/lib/templateService';

interface TemplateExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: Template | null;
}

export const TemplateExportDialog: React.FC<TemplateExportDialogProps> = ({
    open,
    onOpenChange,
    template,
}) => {
    const [includeMetadata, setIncludeMetadata] = useState(true);
    const [includeDynamicFields, setIncludeDynamicFields] = useState(true);
    const [minifyOutput, setMinifyOutput] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!template) return null;

    const dynamicFields = extractDynamicFields(template.elements);

    const handleDownloadJSON = () => {
        downloadTemplateAsJSON(template);
        onOpenChange(false);
    };

    const handleDownloadPDFMaker = () => {
        downloadForPDFMakerIntegration(template, {
            includeMetadata,
            includeDynamicFields,
            minify: minifyOutput,
        });
        onOpenChange(false);
    };

    const handleCopyToClipboard = async () => {
        const success = await copyTemplateToClipboard(template);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Export Template
                    </DialogTitle>
                    <DialogDescription>
                        Export "{template.name}" for use in external applications
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="pdfmaker" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pdfmaker" className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            PDFMaker
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="flex items-center gap-2">
                            <FileJson className="w-4 h-4" />
                            Raw JSON
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pdfmaker" className="space-y-4 mt-4">
                        <div className="text-sm text-muted-foreground">
                            Export in PDFMaker format for integration with external applications.
                            Schema version: <code className="px-1 py-0.5 bg-muted rounded">{PDFMAKER_SCHEMA_VERSION}</code>
                        </div>

                        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="include-metadata" className="text-sm">
                                    Include metadata
                                </Label>
                                <Switch
                                    id="include-metadata"
                                    checked={includeMetadata}
                                    onCheckedChange={setIncludeMetadata}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="include-dynamic-fields" className="text-sm">
                                    Include dynamic fields ({dynamicFields.length} found)
                                </Label>
                                <Switch
                                    id="include-dynamic-fields"
                                    checked={includeDynamicFields}
                                    onCheckedChange={setIncludeDynamicFields}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="minify-output" className="text-sm">
                                    Minify output
                                </Label>
                                <Switch
                                    id="minify-output"
                                    checked={minifyOutput}
                                    onCheckedChange={setMinifyOutput}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCopyToClipboard}>
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Clipboard className="w-4 h-4 mr-2" />
                                        Copy
                                    </>
                                )}
                            </Button>
                            <Button onClick={handleDownloadPDFMaker}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="raw" className="space-y-4 mt-4">
                        <div className="text-sm text-muted-foreground">
                            Export the raw template JSON. This format preserves all internal data.
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-2">Preview:</div>
                            <pre className="text-xs overflow-auto max-h-32 p-2 bg-background rounded border">
                                {JSON.stringify(
                                    {
                                        id: template.id,
                                        name: template.name,
                                        elements: `[${template.elements.length} elements]`,
                                        pageSize: template.pageSize,
                                        orientation: template.orientation,
                                    },
                                    null,
                                    2
                                )}
                            </pre>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleDownloadJSON}>
                                <Download className="w-4 h-4 mr-2" />
                                Download JSON
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
