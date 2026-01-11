import { v4 as uuidv4 } from 'uuid';
import {
    Template,
    DocumentElement,
    PDFMakerTemplate,
    TemplateMetadata,
    TemplateSettings,
    DynamicFieldDefinition,
    TemplateExportOptions,
    TemplateManifest,
    TemplateImportResult,
} from '@/types/editor';

// Schema version for compatibility tracking
export const PDFMAKER_SCHEMA_VERSION = '1.0';

// Default page margins in mm
const DEFAULT_MARGINS = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
};

/**
 * Extract dynamic fields from template elements
 */
export function extractDynamicFields(elements: DocumentElement[]): DynamicFieldDefinition[] {
    const dynamicFields: DynamicFieldDefinition[] = [];
    const fieldNames = new Set<string>();

    elements.forEach((element) => {
        // Check for dynamic-field type elements
        if (element.type === 'dynamic-field' && element.dynamicField) {
            if (!fieldNames.has(element.dynamicField)) {
                fieldNames.add(element.dynamicField);
                dynamicFields.push({
                    name: element.dynamicField,
                    type: 'string',
                    required: false,
                    defaultValue: '',
                    description: `Dynamic field from element: ${element.id}`,
                });
            }
        }

        // Also check content for {{field}} patterns
        if (element.content) {
            const pattern = /\{\{([^}]+)\}\}/g;
            let match;
            while ((match = pattern.exec(element.content)) !== null) {
                const fieldName = match[1].trim();
                if (!fieldNames.has(fieldName)) {
                    fieldNames.add(fieldName);
                    dynamicFields.push({
                        name: fieldName,
                        type: 'string',
                        required: false,
                        defaultValue: '',
                        description: `Extracted from content in element: ${element.id}`,
                    });
                }
            }
        }
    });

    return dynamicFields;
}

/**
 * Generate a unique template ID
 */
export function generateTemplateId(): string {
    return uuidv4();
}

/**
 * Create default template metadata
 */
export function createDefaultMetadata(): TemplateMetadata {
    return {
        version: '1.0.0',
        tags: [],
        category: 'General',
    };
}

/**
 * Create default template settings
 */
export function createDefaultSettings(template: Template): TemplateSettings {
    return {
        pageSize: template.pageSize,
        orientation: template.orientation,
        margins: { ...DEFAULT_MARGINS },
    };
}

/**
 * Export a template to PDFMaker format
 */
export function exportForPDFMaker(
    template: Template,
    options: TemplateExportOptions = {}
): PDFMakerTemplate {
    const {
        includeMetadata = true,
        includeDynamicFields = true,
        schemaVersion = PDFMAKER_SCHEMA_VERSION,
    } = options;

    const metadata: TemplateMetadata = includeMetadata
        ? {
            version: '1.0.0',
            tags: [],
            category: template.sourceApp ? template.sourceApp : 'Custom',
        }
        : { version: '1.0.0' };

    const dynamicFields = includeDynamicFields
        ? extractDynamicFields(template.elements)
        : [];

    return {
        schemaVersion,
        type: 'pdfmaker-template',
        exportedAt: new Date().toISOString(),
        template: {
            id: template.id,
            name: template.name,
            description: template.description,
            metadata,
            settings: createDefaultSettings(template),
            elements: template.elements,
            dynamicFields,
        },
    };
}

/**
 * Convert PDFMaker format back to internal Template format
 */
export function importFromPDFMaker(data: PDFMakerTemplate): TemplateImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate schema version
    if (!data.schemaVersion) {
        warnings.push('Missing schema version, assuming compatibility');
    }

    // Validate required fields
    if (!data.template) {
        errors.push('Missing template data');
        return { success: false, errors };
    }

    if (!data.template.name) {
        errors.push('Template name is required');
    }

    if (!data.template.elements || !Array.isArray(data.template.elements)) {
        errors.push('Template elements must be an array');
    }

    if (errors.length > 0) {
        return { success: false, errors, warnings };
    }

    // Convert to internal Template format
    const template: Template = {
        id: data.template.id || generateTemplateId(),
        name: data.template.name,
        description: data.template.description,
        elements: data.template.elements,
        pageSize: data.template.settings?.pageSize || 'A4',
        orientation: data.template.settings?.orientation || 'portrait',
        createdAt: new Date(),
        updatedAt: new Date(),
        sourceApp: data.template.metadata?.category || 'Imported',
        layoutType: 'document',
    };

    return { success: true, template, warnings };
}

/**
 * Validate a template structure
 */
export function validateTemplate(template: Template): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.id) {
        errors.push('Template ID is required');
    }

    if (!template.name || template.name.trim() === '') {
        errors.push('Template name is required');
    }

    if (!Array.isArray(template.elements)) {
        errors.push('Template elements must be an array');
    } else {
        template.elements.forEach((element, index) => {
            if (!element.id) {
                errors.push(`Element at index ${index} is missing an ID`);
            }
            if (!element.type) {
                errors.push(`Element at index ${index} is missing a type`);
            }
            if (!element.position) {
                errors.push(`Element at index ${index} is missing position`);
            }
            if (!element.size) {
                errors.push(`Element at index ${index} is missing size`);
            }
        });
    }

    const validPageSizes = ['A4', 'Letter', 'Legal'];
    if (!validPageSizes.includes(template.pageSize)) {
        errors.push(`Invalid page size: ${template.pageSize}`);
    }

    const validOrientations = ['portrait', 'landscape'];
    if (!validOrientations.includes(template.orientation)) {
        errors.push(`Invalid orientation: ${template.orientation}`);
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Create a manifest for multiple templates
 */
export function createTemplateManifest(templates: Template[]): TemplateManifest {
    return {
        schemaVersion: PDFMAKER_SCHEMA_VERSION,
        type: 'pdfmaker-manifest',
        exportedAt: new Date().toISOString(),
        count: templates.length,
        templates: templates.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            metadata: {
                version: '1.0.0',
                category: t.sourceApp || 'Custom',
            },
        })),
    };
}

/**
 * Serialize template for export (with pretty print option)
 */
export function serializeTemplate(
    pdfMakerTemplate: PDFMakerTemplate,
    minify: boolean = false
): string {
    return JSON.stringify(pdfMakerTemplate, null, minify ? 0 : 2);
}

/**
 * Parse JSON string to PDFMaker template
 */
export function parseTemplateJSON(jsonString: string): PDFMakerTemplate | null {
    try {
        const parsed = JSON.parse(jsonString);
        if (parsed.type === 'pdfmaker-template') {
            return parsed as PDFMakerTemplate;
        }
        return null;
    } catch {
        return null;
    }
}
