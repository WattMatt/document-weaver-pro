import { Template, PDFMakerTemplate, TemplateImportResult } from '@/types/editor';
import { importFromPDFMaker, parseTemplateJSON, validateTemplate, generateTemplateId } from './templateService';

/**
 * Import template from a File object
 */
export async function importTemplateFromFile(file: File): Promise<TemplateImportResult> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) {
                resolve({ success: false, errors: ['Failed to read file'] });
                return;
            }

            const result = importTemplateFromJSON(content);
            resolve(result);
        };

        reader.onerror = () => {
            resolve({ success: false, errors: ['Error reading file'] });
        };

        reader.readAsText(file);
    });
}

/**
 * Import template from JSON string
 */
export function importTemplateFromJSON(jsonString: string): TemplateImportResult {
    // Try parsing as PDFMaker format first
    const pdfMakerTemplate = parseTemplateJSON(jsonString);

    if (pdfMakerTemplate) {
        return importFromPDFMaker(pdfMakerTemplate);
    }

    // Try parsing as raw template
    try {
        const parsed = JSON.parse(jsonString);

        // Check if it's a bundle
        if (parsed.type === 'pdfmaker-bundle' && parsed.templates) {
            // Return the first template from the bundle
            if (parsed.templates.length > 0) {
                return importFromPDFMaker(parsed.templates[0]);
            }
            return { success: false, errors: ['Bundle is empty'] };
        }

        // Check if it has basic template structure
        if (parsed.name && parsed.elements) {
            const template: Template = {
                id: parsed.id || generateTemplateId(),
                name: parsed.name,
                description: parsed.description || '',
                elements: parsed.elements || [],
                pageSize: parsed.pageSize || 'A4',
                orientation: parsed.orientation || 'portrait',
                createdAt: new Date(parsed.createdAt || Date.now()),
                updatedAt: new Date(parsed.updatedAt || Date.now()),
            };

            const validation = validateTemplate(template);
            if (!validation.valid) {
                return { success: false, errors: validation.errors };
            }

            return { success: true, template };
        }

        return { success: false, errors: ['Unrecognized template format'] };
    } catch (e) {
        return {
            success: false,
            errors: [`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`]
        };
    }
}

/**
 * Import multiple templates from a bundle file
 */
export async function importTemplatesBundle(file: File): Promise<{
    success: boolean;
    templates: Template[];
    errors: string[];
}> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) {
                resolve({ success: false, templates: [], errors: ['Failed to read file'] });
                return;
            }

            try {
                const parsed = JSON.parse(content);

                if (parsed.type === 'pdfmaker-bundle' && Array.isArray(parsed.templates)) {
                    const templates: Template[] = [];
                    const errors: string[] = [];

                    parsed.templates.forEach((t: PDFMakerTemplate, index: number) => {
                        const result = importFromPDFMaker(t);
                        if (result.success && result.template) {
                            templates.push(result.template);
                        } else {
                            errors.push(`Template ${index + 1}: ${result.errors?.join(', ')}`);
                        }
                    });

                    resolve({ success: templates.length > 0, templates, errors });
                } else {
                    resolve({ success: false, templates: [], errors: ['Not a valid bundle file'] });
                }
            } catch (e) {
                resolve({
                    success: false,
                    templates: [],
                    errors: [`Parse error: ${e instanceof Error ? e.message : 'Unknown'}`]
                });
            }
        };

        reader.onerror = () => {
            resolve({ success: false, templates: [], errors: ['Error reading file'] });
        };

        reader.readAsText(file);
    });
}

/**
 * Import template from clipboard
 */
export async function importTemplateFromClipboard(): Promise<TemplateImportResult> {
    try {
        const text = await navigator.clipboard.readText();
        return importTemplateFromJSON(text);
    } catch {
        return { success: false, errors: ['Failed to read from clipboard'] };
    }
}

/**
 * Create a file input and trigger import
 */
export function triggerFileImport(
    onImport: (result: TemplateImportResult) => void,
    accept: string = '.json'
): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const result = await importTemplateFromFile(file);
            onImport(result);
        }
    };

    input.click();
}
