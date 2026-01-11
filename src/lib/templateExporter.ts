import { Template, PDFMakerTemplate } from '@/types/editor';
import { exportForPDFMaker, serializeTemplate, createTemplateManifest, PDFMAKER_SCHEMA_VERSION } from './templateService';

/**
 * Download a template as a JSON file
 */
export function downloadTemplateAsJSON(template: Template, filename?: string): void {
    const pdfMakerTemplate = exportForPDFMaker(template);
    const jsonString = serializeTemplate(pdfMakerTemplate);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const name = filename || `${sanitizeFilename(template.name)}.json`;
    downloadBlob(blob, name);
}

/**
 * Download multiple templates as a single JSON file
 */
export function downloadTemplatesBundle(templates: Template[], bundleName?: string): void {
    const exportData = {
        schemaVersion: PDFMAKER_SCHEMA_VERSION,
        type: 'pdfmaker-bundle',
        exportedAt: new Date().toISOString(),
        manifest: createTemplateManifest(templates),
        templates: templates.map((t) => exportForPDFMaker(t)),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const name = bundleName || `templates-bundle-${Date.now()}.json`;
    downloadBlob(blob, name);
}

/**
 * Download template for PDFMaker integration
 * Exports in the standardized format for external applications
 */
export function downloadForPDFMakerIntegration(
    template: Template,
    options: {
        includeMetadata?: boolean;
        includeDynamicFields?: boolean;
        minify?: boolean;
    } = {}
): void {
    const pdfMakerTemplate = exportForPDFMaker(template, {
        includeMetadata: options.includeMetadata ?? true,
        includeDynamicFields: options.includeDynamicFields ?? true,
    });

    const jsonString = serializeTemplate(pdfMakerTemplate, options.minify);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const filename = `pdfmaker-${sanitizeFilename(template.name)}.json`;
    downloadBlob(blob, filename);
}

/**
 * Copy template JSON to clipboard
 */
export async function copyTemplateToClipboard(template: Template): Promise<boolean> {
    try {
        const pdfMakerTemplate = exportForPDFMaker(template);
        const jsonString = serializeTemplate(pdfMakerTemplate);
        await navigator.clipboard.writeText(jsonString);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get template export data as string (for API use)
 */
export function getTemplateExportString(template: Template): string {
    const pdfMakerTemplate = exportForPDFMaker(template);
    return serializeTemplate(pdfMakerTemplate);
}

/**
 * Get PDFMaker template object
 */
export function getTemplateExportData(template: Template): PDFMakerTemplate {
    return exportForPDFMaker(template);
}

// Helper functions

function sanitizeFilename(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 50);
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
