/**
 * PDF Generator Service - Real PDF generation using jsPDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export interface PDFOptions {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    orientation?: 'portrait' | 'landscape';
    format?: 'a4' | 'letter';
}

export interface PDFSection {
    type: 'heading' | 'text' | 'table' | 'image' | 'list' | 'spacer';
    content?: any;
    style?: any;
}

/**
 * Generate PDF from sections
 */
export async function generatePDF(
    sections: PDFSection[],
    filename: string = 'document.pdf',
    options: PDFOptions = {}
): Promise<void> {
    try {
        const doc = new jsPDF({
            orientation: options.orientation || 'portrait',
            unit: 'mm',
            format: options.format || 'a4'
        });
        
        // Set document properties
        if (options.title) doc.setProperties({ title: options.title });
        if (options.author) doc.setProperties({ author: options.author });
        if (options.subject) doc.setProperties({ subject: options.subject });
        if (options.keywords) doc.setProperties({ keywords: options.keywords });
        
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        
        for (const section of sections) {
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }
            
            switch (section.type) {
                case 'heading':
                    doc.setFontSize(section.style?.fontSize || 16);
                    doc.setFont('helvetica', 'bold');
                    doc.text(section.content, margin, yPosition);
                    yPosition += 10;
                    break;
                    
                case 'text': {
                    doc.setFontSize(section.style?.fontSize || 12);
                    doc.setFont('helvetica', 'normal');
                    const lines = doc.splitTextToSize(section.content, pageWidth - 2 * margin);
                    doc.text(lines, margin, yPosition);
                    yPosition += lines.length * 7;
                    break;
                }
                    
                case 'table':
                    autoTable(doc, {
                        startY: yPosition,
                        head: section.content.headers ? [section.content.headers] : undefined,
                        body: section.content.rows,
                        margin: { left: margin, right: margin },
                        styles: {
                            fontSize: 10,
                            cellPadding: 3
                        },
                        headStyles: {
                            fillColor: [66, 139, 202],
                            textColor: 255,
                            fontStyle: 'bold'
                        }
                    });
                    yPosition = (doc as any).lastAutoTable.finalY + 10;
                    break;
                    
                case 'image':
                    if (section.content.url) {
                        try {
                            const imgData = await loadImage(section.content.url);
                            const imgWidth = section.content.width || 100;
                            const imgHeight = section.content.height || 75;
                            doc.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
                            yPosition += imgHeight + 10;
                        } catch (error) {
                            console.error('Failed to load image:', error);
                        }
                    }
                    break;
                    
                case 'list':
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    section.content.items.forEach((item: string, index: number) => {
                        doc.text(`• ${item}`, margin + 5, yPosition);
                        yPosition += 7;
                    });
                    yPosition += 5;
                    break;
                    
                case 'spacer':
                    yPosition += section.content?.height || 10;
                    break;
            }
        }
        
        // Add footer with page numbers
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }
        
        // Save PDF
        doc.save(filename);
        toast.success('PDF generated successfully!');
    } catch (error) {
        console.error('PDF generation error:', error);
        toast.error('Failed to generate PDF');
        throw error;
    }
}

/**
 * Generate Site Inspection Report PDF
 */
export async function generateInspectionReport(data: {
    location: string;
    date: Date;
    weather: string;
    temperature: string;
    photos: Array<{ url: string; caption: string }>;
    checklist: Array<{ task: string; completed: boolean; notes: string }>;
    notes: string;
}): Promise<void> {
    const sections: PDFSection[] = [
        {
            type: 'heading',
            content: 'Daily Site Inspection Report',
            style: { fontSize: 20 }
        },
        {
            type: 'spacer',
            content: { height: 5 }
        },
        {
            type: 'text',
            content: `Location: ${data.location}`
        },
        {
            type: 'text',
            content: `Date: ${data.date.toLocaleDateString()} ${data.date.toLocaleTimeString()}`
        },
        {
            type: 'text',
            content: `Weather: ${data.weather}, ${data.temperature}`
        },
        {
            type: 'spacer',
            content: { height: 10 }
        },
        {
            type: 'heading',
            content: 'Inspection Checklist',
            style: { fontSize: 14 }
        },
        {
            type: 'table',
            content: {
                headers: ['Task', 'Status', 'Notes'],
                rows: data.checklist.map(item => [
                    item.task,
                    item.completed ? '✓ Complete' : '✗ Incomplete',
                    item.notes || '-'
                ])
            }
        },
        {
            type: 'spacer',
            content: { height: 10 }
        },
        {
            type: 'heading',
            content: 'Inspector Notes',
            style: { fontSize: 14 }
        },
        {
            type: 'text',
            content: data.notes || 'No additional notes.'
        }
    ];
    
    // Add photos if available
    if (data.photos.length > 0) {
        sections.push({
            type: 'spacer',
            content: { height: 10 }
        });
        sections.push({
            type: 'heading',
            content: 'Site Photos',
            style: { fontSize: 14 }
        });
        
        for (const photo of data.photos.slice(0, 3)) { // Limit to 3 photos
            sections.push({
                type: 'image',
                content: {
                    url: photo.url,
                    width: 150,
                    height: 100
                }
            });
            sections.push({
                type: 'text',
                content: photo.caption,
                style: { fontSize: 10 }
            });
            sections.push({
                type: 'spacer',
                content: { height: 5 }
            });
        }
    }
    
    await generatePDF(
        sections,
        `inspection-report-${data.date.toISOString().split('T')[0]}.pdf`,
        {
            title: 'Site Inspection Report',
            author: 'CortexBuild',
            subject: 'Daily Site Inspection'
        }
    );
}

/**
 * Generate Safety Incident Report PDF
 */
export async function generateIncidentReport(data: {
    type: string;
    severity: string;
    description: string;
    location: string;
    reporter: string;
    date: Date;
}): Promise<void> {
    const sections: PDFSection[] = [
        {
            type: 'heading',
            content: 'Safety Incident Report',
            style: { fontSize: 20 }
        },
        {
            type: 'spacer',
            content: { height: 10 }
        },
        {
            type: 'table',
            content: {
                rows: [
                    ['Incident Type', data.type],
                    ['Severity Level', data.severity.toUpperCase()],
                    ['Location', data.location],
                    ['Reported By', data.reporter],
                    ['Date & Time', data.date.toLocaleString()]
                ]
            }
        },
        {
            type: 'spacer',
            content: { height: 10 }
        },
        {
            type: 'heading',
            content: 'Incident Description',
            style: { fontSize: 14 }
        },
        {
            type: 'text',
            content: data.description
        }
    ];
    
    await generatePDF(
        sections,
        `incident-report-${data.date.toISOString().split('T')[0]}.pdf`,
        {
            title: 'Safety Incident Report',
            author: 'CortexBuild',
            subject: 'Safety Incident'
        }
    );
}

/**
 * Generate Timesheet PDF
 */
export async function generateTimesheetPDF(data: {
    crewMembers: Array<{
        name: string;
        role: string;
        totalHours: number;
        overtimeHours: number;
    }>;
    weekEnding: Date;
}): Promise<void> {
    const sections: PDFSection[] = [
        {
            type: 'heading',
            content: 'Weekly Timesheet',
            style: { fontSize: 20 }
        },
        {
            type: 'text',
            content: `Week Ending: ${data.weekEnding.toLocaleDateString()}`
        },
        {
            type: 'spacer',
            content: { height: 10 }
        },
        {
            type: 'table',
            content: {
                headers: ['Name', 'Role', 'Regular Hours', 'Overtime Hours', 'Total Hours'],
                rows: data.crewMembers.map(member => [
                    member.name,
                    member.role,
                    (member.totalHours - member.overtimeHours).toFixed(1),
                    member.overtimeHours.toFixed(1),
                    member.totalHours.toFixed(1)
                ])
            }
        }
    ];
    
    await generatePDF(
        sections,
        `timesheet-${data.weekEnding.toISOString().split('T')[0]}.pdf`,
        {
            title: 'Weekly Timesheet',
            author: 'CortexBuild',
            subject: 'Labor Hours'
        }
    );
}

/**
 * Load image as base64
 */
async function loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
    });
}
