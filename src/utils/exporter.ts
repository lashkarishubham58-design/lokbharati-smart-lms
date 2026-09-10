/**
 * Helper utilities for exporting data to CSV / Excel and printable PDF reports
 */

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printFormattedPDFReport(title: string, subtitle: string, headers: string[], dataRows: string[][]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print/export PDF reports.');
    return;
  }

  const tableHeaderHTML = headers.map((h) => `<th style="border: 1px solid #cbd5e1; padding: 10px; background-color: #f1f5f9; text-align: left; font-size: 13px; font-weight: 600; color: #1e293b;">${h}</th>`).join('');
  const tableRowsHTML = dataRows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="border: 1px solid #cbd5e1; padding: 10px; font-size: 13px; color: #334155;">${cell}</td>`
          )
          .join('')}</tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Lokbharti University</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #0f172a; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: 700; color: #1e3a8a; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
          .meta { text-align: right; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Lokbharti University</div>
            <div class="subtitle">${title} | ${subtitle}</div>
          </div>
          <div class="meta">
            <div>Generated On: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
            <div>Official ERP Record</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>${tableHeaderHTML}</tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
        <div class="footer">
          Lokbharti University Smart LMS & Mini ERP System • Confidential Academic Document
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
