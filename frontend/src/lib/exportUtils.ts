/**
 * Utility functions for exporting data to various formats
 */

/**
 * Export data to CSV format
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param columns - Optional: specific columns to export with custom headers
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: Array<{ key: keyof T; header: string }>
) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine headers
  let headers: string[];
  let keys: (keyof T)[];

  if (columns) {
    headers = columns.map((col) => col.header);
    keys = columns.map((col) => col.key);
  } else {
    keys = Object.keys(data[0]) as (keyof T)[];
    headers = keys as string[];
  }

  // Create CSV content
  const csvContent = [
    // Headers
    headers.map((h) => `"${h}"`).join(','),
    // Data rows
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key];
          // Handle different data types
          if (value === null || value === undefined) {
            return '""';
          }
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(data: T, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Export table to Excel format (using HTML table method)
 * For more advanced Excel features, consider using libraries like xlsx or exceljs
 */
export function exportTableToExcel(
  tableId: string,
  filename: string,
  sheetName: string = 'Sheet1'
) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with id "${tableId}" not found`);
    return;
  }

  // Create Excel file content
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${sheetName}</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
    </head>
    <body>
      ${table.outerHTML}
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${filename}.xls`);
}

/**
 * Export data to Excel format (CSV method - more compatible)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: Array<{ key: keyof T; header: string }>
) {
  // Excel accepts CSV with .xlsx extension
  exportToCSV(data, filename, columns);
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Format data for export (remove unwanted fields, format dates, etc.)
 */
export function prepareDataForExport<T extends Record<string, any>>(
  data: T[],
  options: {
    excludeFields?: (keyof T)[];
    dateFields?: (keyof T)[];
    dateFormat?: (date: Date) => string;
  } = {}
): any[] {
  const {
    excludeFields = [],
    dateFields = [],
    dateFormat = (date) => date.toLocaleDateString('fr-FR'),
  } = options;

  return data.map((item) => {
    const cleaned: any = {};

    Object.keys(item).forEach((key) => {
      // Skip excluded fields
      if (excludeFields.includes(key as keyof T)) {
        return;
      }

      let value = item[key];

      // Format date fields
      if (dateFields.includes(key as keyof T) && value) {
        value = dateFormat(new Date(value));
      }

      // Remove null/undefined
      if (value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    });

    return cleaned;
  });
}

/**
 * Export button component helper
 */
export interface ExportConfig<T> {
  data: T[];
  filename: string;
  format: 'csv' | 'excel' | 'json';
  columns?: Array<{ key: keyof T; header: string }>;
  prepareData?: (data: T[]) => any[];
}

export function handleExport<T extends Record<string, any>>(config: ExportConfig<T>) {
  const { data, filename, format, columns, prepareData } = config;

  const exportData = prepareData ? prepareData(data) : data;

  switch (format) {
    case 'csv':
      exportToCSV(exportData, filename, columns as any);
      break;
    case 'excel':
      exportToExcel(exportData, filename, columns as any);
      break;
    case 'json':
      exportToJSON(exportData, filename);
      break;
    default:
      console.error(`Unsupported export format: ${format}`);
  }
}
