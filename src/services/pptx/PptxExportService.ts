import PptxGenJS from 'pptxgenjs';
import { DocumentElement, Template } from '@/types/editor';

/**
 * Service to handle exporting content to PowerPoint (.pptx)
 */
export class PptxExportService {
    /**
     * Export a Template to a PPTX file
     */
    static async exportToPptx(template: Template) {
        const pptx = new PptxGenJS();

        // Set Layout based on template settings
        // Default to 16:9 if presentation, otherwise allow A4 logic (though PPT is usually screen based)
        if (template.layoutType === 'presentation') {
            pptx.layout = 'LAYOUT_16x9';
        } else {
            // For docs, we arguably usually want A4, but PptxGenJS uses 'LAYOUT_4x3' or 'LAYOUT_16x9' or 'LAYOUT_WIDE' etc.
            // We can define custom layout sizes if needed: name, width, height.
            if (template.pageSize === 'A4') {
                pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
                pptx.layout = 'A4';
            } else {
                pptx.layout = 'LAYOUT_16x9'; // Fallback
            }
        }

        // Determine metadata
        pptx.title = template.name;
        pptx.author = 'DocBuilder User'; // Could be dynamic from user profile

        // Create Slides
        // Currently, our Template has `elements: DocumentElement[]` which represents ONE page/canvas. 
        // In the future data model (Phase 2), we will have `pages` or `slides` array.
        // For now, we assume the current `elements` array is ONE slide.

        const slide = pptx.addSlide();

        // Apply background
        if (template.slideProperties?.backgroundColor) {
            slide.background = { color: template.slideProperties.backgroundColor };
        }

        // Render Elements
        template.elements.forEach(element => {
            this.renderElementToSlide(slide, element);
        });

        // Save
        await pptx.writeFile({ fileName: `${template.name}.pptx` });
    }

    private static renderElementToSlide(slide: PptxGenJS.Slide, element: DocumentElement) {
        if (!element.visible) return;

        // Convert pixels to inches (approximate, since PPT uses inches by default)
        // Assuming 96 DPI for screen: 100px = ~1.04 inches.
        // PptxGenJS default measurement is Inches.
        const DPI = 96;
        const x = element.position.x / DPI;
        const y = element.position.y / DPI;
        const w = element.size.width / DPI;
        const h = element.size.height / DPI;

        const commonOptions = {
            x, y, w, h
        };

        switch (element.type) {
            case 'text':
            case 'header':
            case 'footer':
                // Text
                slide.addText(typeof element.content === 'string' ? element.content : '', {
                    ...commonOptions,
                    fontSize: element.style.fontSize,
                    bold: element.style.fontWeight === 'bold',
                    italic: element.style.fontStyle === 'italic',
                    underline: element.style.textDecoration === 'underline' ? { style: 'sng' } : undefined,
                    color: element.style.color?.replace('#', '') || '000000',
                    align: element.style.textAlign as PptxGenJS.HAlign,
                    // Background color for text box?
                    fill: element.style.backgroundColor !== 'transparent' && element.style.backgroundColor
                        ? { color: element.style.backgroundColor.replace('#', '') }
                        : undefined,
                });
                break;

            case 'image':
                // Image
                if (typeof element.content === 'string' && element.content.startsWith('http')) {
                    slide.addImage({
                        path: element.content,
                        ...commonOptions,
                    });
                }
                break;

            case 'shape':
                // Shape
                // Map our shape types to PptxGenJS shape types
                let shapeType = PptxGenJS.ShapeType.rect;
                if (element.shapeType === 'circle') shapeType = PptxGenJS.ShapeType.ellipse;
                if (element.shapeType === 'triangle') shapeType = PptxGenJS.ShapeType.triangle;

                slide.addShape(shapeType, {
                    ...commonOptions,
                    fill: { color: element.style.backgroundColor?.replace('#', '') || 'CCCCCC' },
                    line: element.style.borderColor ? { color: element.style.borderColor.replace('#', ''), width: element.style.borderWidth || 1 } : undefined,
                });
                break;

            default:
                console.warn(`Unsupported element type for PPTX export: ${element.type}`);
        }
    }
}
