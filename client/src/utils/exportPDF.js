import jsPDF from 'jspdf';

export const exportExpensesToPDF = (expenses, summary, userName) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ─── Header ─────────────────────────────────────────────────────────────────
  doc.setFillColor(99, 102, 241); // accent color
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Expense Tracker', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report for: ${userName}`, 14, 28);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    })}`,
    14, 35
  );

  // ─── Summary Section ────────────────────────────────────────────────────────
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 55);

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 60, pageWidth - 28, 28, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  doc.text('Total Spent', 20, 70);
  doc.text('Total Entries', 80, 70);
  doc.text('Top Category', 150, 70);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  doc.text(`Rs.${summary.total.toLocaleString('en-IN')}`, 20, 80);
  doc.text(`${summary.count}`, 80, 80);
  doc.text(summary.topCategory || '—', 150, 80);

  // ─── Table ──────────────────────────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Expense Details', 14, 103);

  // Table header
  const tableTop = 110;
  doc.setFillColor(99, 102, 241);
  doc.rect(14, tableTop, pageWidth - 28, 10, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Date',     20,  tableTop + 7);
  doc.text('Title',    55,  tableTop + 7);
  doc.text('Category', 120, tableTop + 7);
  doc.text('Amount',   165, tableTop + 7);

  // Table rows
  let y = tableTop + 10;
  doc.setFont('helvetica', 'normal');

  expenses.forEach((expense, index) => {
    // New page if running out of space
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 9, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);

    const dateStr = new Date(expense.date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    doc.text(dateStr,             20,  y + 6);
    // Truncate long titles
    doc.text(
      expense.title.length > 30
        ? expense.title.substring(0, 28) + '...'
        : expense.title,
      55, y + 6
    );
    doc.text(expense.category,    120, y + 6);

    // Amount in accent color
    doc.setTextColor(99, 102, 241);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs.${Number(expense.amount).toLocaleString('en-IN')}`, 165, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    y += 9;
  });

  // ─── Footer ─────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount}  •  Smart Expense Tracker`,
      pageWidth / 2, 290,
      { align: 'center' }
    );
  }

  // Save the file
  doc.save(`expenses-${new Date().toISOString().split('T')[0]}.pdf`);
};