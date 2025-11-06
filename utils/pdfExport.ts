import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PlatformMetrics {
    totalUsers: number;
    activeUsers: number;
    totalCompanies: number;
    activeCompanies: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalProjects: number;
    activeProjects: number;
    systemHealth: string;
    uptime: number;
}

interface ChartData {
    labels: string[];
    values: number[];
}

export const exportMetricsToPDF = (metrics: PlatformMetrics, chartData?: ChartData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CortexBuild', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Platform Metrics Report', 20, 30);

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 30, { align: 'right' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Summary Section
    let yPos = 55;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Platform Overview', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Metrics Grid
    const metricsData = [
        ['Metric', 'Value', 'Status'],
        ['Total Users', metrics.totalUsers.toString(), '✓'],
        ['Active Users', metrics.activeUsers.toString(), '✓'],
        ['Total Companies', metrics.totalCompanies.toString(), '✓'],
        ['Active Companies', metrics.activeCompanies.toString(), '✓'],
        ['Total Revenue', `$${metrics.totalRevenue.toFixed(2)}`, '✓'],
        ['Monthly Revenue', `$${metrics.monthlyRevenue.toFixed(2)}`, '✓'],
        ['Total Projects', metrics.totalProjects.toString(), '✓'],
        ['Active Projects', metrics.activeProjects.toString(), '✓'],
        ['System Health', metrics.systemHealth, metrics.systemHealth === 'healthy' ? '✓' : '⚠'],
        ['Uptime', `${metrics.uptime}%`, metrics.uptime >= 99 ? '✓' : '⚠']
    ];

    autoTable(doc, {
        startY: yPos,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'grid',
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 5
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 },
            1: { cellWidth: 60 },
            2: { halign: 'center', cellWidth: 30 }
        }
    });

    // Key Insights Section
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Insights', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const insights = [
        `• User Engagement: ${((metrics.activeUsers / Math.max(metrics.totalUsers, 1)) * 100).toFixed(1)}% of users are active`,
        `• Company Activity: ${((metrics.activeCompanies / Math.max(metrics.totalCompanies, 1)) * 100).toFixed(1)}% of companies are active`,
        `• Average Revenue per Company: $${(metrics.totalRevenue / Math.max(metrics.totalCompanies, 1)).toFixed(2)}`,
        `• Project Utilization: ${((metrics.activeProjects / Math.max(metrics.totalProjects, 1)) * 100).toFixed(1)}% of projects are active`,
        `• System Status: ${metrics.systemHealth.toUpperCase()} with ${metrics.uptime}% uptime`
    ];

    insights.forEach((insight, index) => {
        doc.text(insight, 20, yPos + (index * 7));
    });

    // Chart Section (if provided)
    if (chartData && chartData.labels.length > 0) {
        yPos += insights.length * 7 + 15;

        if (yPos > pageHeight - 80) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Trend Analysis', 20, yPos);

        yPos += 10;

        // Simple bar chart representation
        const chartTableData = chartData.labels.map((label, index) => [
            label,
            chartData.values[index].toString(),
            '█'.repeat(Math.min(Math.floor(chartData.values[index] / 10), 20))
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Period', 'Value', 'Visual']],
            body: chartTableData,
            theme: 'striped',
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: [255, 255, 255]
            },
            styles: {
                fontSize: 9
            }
        });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            'CortexBuild Platform - Confidential',
            20,
            pageHeight - 10
        );
    }

    // Save the PDF
    doc.save(`platform-metrics-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportAuditLogToPDF = (logs: any[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CortexBuild', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Audit Log Report', 20, 30);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 30, { align: 'right' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Audit Logs Table
    const tableData = logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.user_name,
        log.action,
        log.resource_type,
        log.status,
        log.ip_address
    ]);

    autoTable(doc, {
        startY: 50,
        head: [['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 8,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 30 }
        }
    });

    // Summary
    const yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, yPos);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Events: ${logs.length}`, 20, yPos + 10);
    doc.text(`Success: ${logs.filter(l => l.status === 'success').length}`, 20, yPos + 17);
    doc.text(`Failures: ${logs.filter(l => l.status === 'failure').length}`, 20, yPos + 24);
    doc.text(`Warnings: ${logs.filter(l => l.status === 'warning').length}`, 20, yPos + 31);

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            'CortexBuild Platform - Confidential',
            20,
            pageHeight - 10
        );
    }

    doc.save(`audit-log-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportUserReportToPDF = (users: any[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CortexBuild', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('User Report', 20, 30);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 30, { align: 'right' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Users Table
    const tableData = users.map(user => [
        user.name || 'N/A',
        user.email,
        user.role,
        user.company_name || 'N/A',
        user.status || 'active'
    ]);

    autoTable(doc, {
        startY: 50,
        head: [['Name', 'Email', 'Role', 'Company', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 4
        }
    });

    // Summary
    const yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, yPos);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Users: ${users.length}`, 20, yPos + 10);
    
    const roleCount: Record<string, number> = {};
    users.forEach(user => {
        roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });

    let summaryY = yPos + 17;
    Object.entries(roleCount).forEach(([role, count]) => {
        doc.text(`${role}: ${count}`, 20, summaryY);
        summaryY += 7;
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            'CortexBuild Platform - Confidential',
            20,
            pageHeight - 10
        );
    }

    doc.save(`user-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

