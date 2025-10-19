import { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, FileText, ChevronDown } from 'lucide-react';
import { handleExport, ExportConfig } from '../lib/exportUtils';
import { toast } from 'sonner';

interface ExportButtonProps<T> {
  data: T[];
  filename: string;
  columns?: Array<{ key: keyof T; header: string }>;
  prepareData?: (data: T[]) => any[];
  formats?: ('csv' | 'excel' | 'json')[];
  variant?: 'button' | 'dropdown';
  className?: string;
}

/**
 * Reusable Export Button Component
 * Supports CSV, Excel, and JSON export formats
 */
export default function ExportButton<T extends Record<string, any>>({
  data,
  filename,
  columns,
  prepareData,
  formats = ['csv', 'excel', 'json'],
  variant = 'dropdown',
  className = '',
}: ExportButtonProps<T>) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExportClick = (format: 'csv' | 'excel' | 'json') => {
    try {
      if (data.length === 0) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      const config: ExportConfig<T> = {
        data,
        filename,
        format,
        columns,
        prepareData,
      };

      handleExport(config);
      toast.success(`Export ${format.toUpperCase()} réussi`);
      setShowDropdown(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const formatIcons = {
    csv: FileText,
    excel: FileSpreadsheet,
    json: FileJson,
  };

  const formatLabels = {
    csv: 'CSV',
    excel: 'Excel',
    json: 'JSON',
  };

  // Single format button
  if (variant === 'button' && formats.length === 1) {
    const format = formats[0];
    const Icon = formatIcons[format];

    return (
      <button
        onClick={() => handleExportClick(format)}
        className={`btn btn-secondary flex items-center gap-2 ${className}`}
      >
        <Icon size={18} />
        Exporter {formatLabels[format]}
      </button>
    );
  }

  // Dropdown for multiple formats
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`btn btn-secondary flex items-center gap-2 ${className}`}
      >
        <Download size={18} />
        Exporter
        <ChevronDown size={16} />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {formats.map((format) => {
              const Icon = formatIcons[format];
              return (
                <button
                  key={format}
                  onClick={() => handleExportClick(format)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Icon size={16} className="text-gray-500" />
                  <span>Exporter en {formatLabels[format]}</span>
                </button>
              );
            })}

            <div className="border-t border-gray-200 mt-1 pt-1 px-4 py-2">
              <p className="text-xs text-gray-500">
                {data.length} élément{data.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
