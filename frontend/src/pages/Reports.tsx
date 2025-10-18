import { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Users,
  DollarSign,
  BookOpen,
  CreditCard,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

type ReportType =
  | 'cohorts'
  | 'subscriptions'
  | 'payments'
  | 'users'
  | 'revenue'
  | 'conversion';

type ExportFormat = 'CSV' | 'EXCEL' | 'PDF';

interface ReportFilter {
  type: ReportType;
  format: ExportFormat;
  startDate: string;
  endDate: string;
  cohortId?: string;
  status?: string;
}

const REPORT_TYPES = {
  cohorts: {
    label: 'Rapport des cohortes',
    icon: BookOpen,
    color: 'blue',
    description: 'Liste des cohortes avec effectifs, dates, coach et statut',
  },
  subscriptions: {
    label: 'Rapport des abonnements',
    icon: TrendingUp,
    color: 'green',
    description: 'Abonnés actifs, expirations, conversions et renouvellements',
  },
  payments: {
    label: 'Rapport des paiements',
    icon: DollarSign,
    color: 'yellow',
    description: 'Transactions par période, provider, statut et montants',
  },
  users: {
    label: 'Rapport des utilisateurs',
    icon: Users,
    color: 'purple',
    description: 'Liste des utilisateurs par rôle, statut et date d\'inscription',
  },
  revenue: {
    label: 'Rapport de revenus',
    icon: CreditCard,
    color: 'gold',
    description: 'Analyse des revenus par période, cohorte et type d\'abonnement',
  },
  conversion: {
    label: 'Rapport de conversion',
    icon: BarChart3,
    color: 'teal',
    description: 'Taux de conversion gratuit → payant par cohorte et période',
  },
};

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilter>({
    type: 'cohorts',
    format: 'CSV',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const handleExport = async () => {
    try {
      setLoading(true);
      toast.info('Génération du rapport en cours...');

      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: filters.format.toLowerCase(),
        ...(filters.cohortId && { cohortId: filters.cohortId }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await api.get(`/reports/${filters.type}?${params.toString()}`, {
        responseType: 'blob',
      });

      const extension = filters.format.toLowerCase() === 'excel' ? 'xlsx' : filters.format.toLowerCase();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `rapport_${filters.type}_${filters.startDate}_${filters.endDate}.${extension}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Rapport exporté avec succès');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExport = async (type: ReportType, format: ExportFormat) => {
    try {
      toast.info(`Export ${format} en cours...`);

      const response = await api.get(`/reports/${type}?format=${format.toLowerCase()}`, {
        responseType: 'blob',
      });

      const extension = format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Export réussi');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rapports & Exports</h1>
        <p className="text-gray-600 mt-1">
          Générez et exportez des rapports détaillés en CSV, Excel ou PDF
        </p>
      </div>

      {/* Main Export Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText size={20} className="text-primary-600" />
          Générateur de rapports personnalisés
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rapport
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as ReportType })}
              className="input"
            >
              {Object.entries(REPORT_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select
              value={filters.format}
              onChange={(e) =>
                setFilters({ ...filters, format: e.target.value as ExportFormat })
              }
              className="input"
            >
              <option value="CSV">CSV</option>
              <option value="EXCEL">Excel (.xlsx)</option>
              <option value="PDF">PDF</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input"
            />
          </div>
        </div>

        {/* Report Description */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            {(() => {
              const Icon = REPORT_TYPES[filters.type].icon;
              return <Icon size={20} className="text-gray-600 mt-0.5" />;
            })()}
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                {REPORT_TYPES[filters.type].label}
              </h3>
              <p className="text-sm text-gray-600">{REPORT_TYPES[filters.type].description}</p>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Génération en cours...
            </>
          ) : (
            <>
              <Download size={20} />
              Générer et télécharger
            </>
          )}
        </button>
      </div>

      {/* Quick Export Cards */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Exports rapides</h2>
        <p className="text-gray-600 mb-4">
          Téléchargez rapidement les données actuelles au format de votre choix
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(REPORT_TYPES).map(([key, value]) => {
          const Icon = value.icon;
          const colorClasses: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            purple: 'bg-purple-100 text-purple-600',
            gold: 'bg-yellow-100 text-yellow-600',
            teal: 'bg-teal-100 text-teal-600',
          };

          return (
            <div key={key} className="card">
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[value.color]}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{value.label}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{value.description}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickExport(key as ReportType, 'CSV')}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Download size={14} />
                  CSV
                </button>
                <button
                  onClick={() => handleQuickExport(key as ReportType, 'EXCEL')}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Download size={14} />
                  Excel
                </button>
                <button
                  onClick={() => handleQuickExport(key as ReportType, 'PDF')}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Download size={14} />
                  PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="card mt-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <FileText className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">À propos des rapports</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>CSV</strong> : Format compatible avec Excel, Google Sheets et autres
                tableurs
              </li>
              <li>
                • <strong>Excel</strong> : Fichier .xlsx avec formatage et formules
              </li>
              <li>
                • <strong>PDF</strong> : Document imprimable avec graphiques et tableaux
              </li>
              <li>• Les rapports incluent uniquement les données de la période sélectionnée</li>
              <li>• Les exports rapides utilisent la date du jour comme référence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
