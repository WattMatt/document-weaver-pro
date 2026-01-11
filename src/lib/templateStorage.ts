import { Template } from '@/types/editor';

const STORAGE_KEY = 'pdfmaker_templates';
const STORAGE_VERSION = '1.0';

interface StorageData {
    version: string;
    lastUpdated: string;
    templates: Template[];
}

/**
 * Save a single template to localStorage
 */
export function saveTemplate(template: Template): void {
    const data = loadStorageData();
    const index = data.templates.findIndex((t) => t.id === template.id);

    if (index >= 0) {
        data.templates[index] = template;
    } else {
        data.templates.push(template);
    }

    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Load all templates from localStorage
 */
export function loadTemplates(): Template[] {
    const data = loadStorageData();
    return data.templates.map(hydrateDates);
}

/**
 * Delete a template by ID
 */
export function deleteTemplate(id: string): boolean {
    const data = loadStorageData();
    const index = data.templates.findIndex((t) => t.id === id);

    if (index >= 0) {
        data.templates.splice(index, 1);
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    }

    return false;
}

/**
 * Get a single template by ID
 */
export function getTemplate(id: string): Template | null {
    const templates = loadTemplates();
    return templates.find((t) => t.id === id) || null;
}

/**
 * Clear all templates from storage
 */
export function clearAllTemplates(): void {
    const data: StorageData = {
        version: STORAGE_VERSION,
        lastUpdated: new Date().toISOString(),
        templates: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Export all templates as a JSON string
 */
export function exportAllAsJSON(): string {
    const data = loadStorageData();
    return JSON.stringify(data, null, 2);
}

/**
 * Import templates from JSON string
 */
export function importFromJSON(jsonString: string): { success: boolean; count: number; errors: string[] } {
    const errors: string[] = [];

    try {
        const parsed = JSON.parse(jsonString);

        if (!parsed.templates || !Array.isArray(parsed.templates)) {
            errors.push('Invalid format: templates array not found');
            return { success: false, count: 0, errors };
        }

        const data = loadStorageData();
        let importCount = 0;

        parsed.templates.forEach((template: Template) => {
            if (template.id && template.name) {
                const existing = data.templates.findIndex((t) => t.id === template.id);
                if (existing >= 0) {
                    data.templates[existing] = hydrateDates(template);
                } else {
                    data.templates.push(hydrateDates(template));
                }
                importCount++;
            }
        });

        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        return { success: true, count: importCount, errors };
    } catch (e) {
        errors.push(`Parse error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        return { success: false, count: 0, errors };
    }
}

/**
 * Get storage info
 */
export function getStorageInfo(): { count: number; lastUpdated: string | null } {
    const data = loadStorageData();
    return {
        count: data.templates.length,
        lastUpdated: data.lastUpdated,
    };
}

// Internal helpers

function loadStorageData(): StorageData {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.version && parsed.templates) {
                return parsed;
            }
        }
    } catch {
        // Storage corrupted, reset
    }

    return {
        version: STORAGE_VERSION,
        lastUpdated: new Date().toISOString(),
        templates: [],
    };
}

function hydrateDates(template: Template): Template {
    return {
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
    };
}
