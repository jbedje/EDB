import { useState } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Download, FileText, FileSpreadsheet, FileBox, Calendar, Filter } from 'lucide-react';

export default function Rapports() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'participants',
    format: 'CSV',
    startDate: '',
    endDate: '',
    cohortId: '',
  });

  const reportTypes = [
    {
      id: 'participants',
      label: 'Liste des participants',
      description: 'Export de tous vos apprenants avec leurs statuts et informations de contact',
      icon: FileText,
    },
    {
      id: 'coaching-status',
      label: 'Statut coaching',
      description: 'Rapport détaillé sur le statut de coaching de chaque apprenant',
      icon: FileSpreadsheet,
    },
    {
      id: 'conversion',
      label: 'Conversion',
      description: 'Analyse des conversions de coaching gratuit vers abonnements payants',
      icon: FileBox,
    },
    {
      id: 'attendance',
      label: 'Assiduité',
      description: 'Rapport sur la présence et participation de vos apprenants',
      icon: FileText,
    },
    {
      id: 'cohort-summary',
      label: 'Résumé par cohorte',
      description: 'Synthèse des performances et statistiques par cohorte',
      icon: FileSpreadsheet,
    },
  ];

  const handleExport = async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error('Veuillez sélectionner une période');
      return;
    }

    try {
      setLoading(true);
      toast.info('Génération du rapport en cours...');

      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: filters.format.toLowerCase(),
        ...(filters.cohortId && { cohortId: filters.cohortId }),
      });

      const response = await api.get(`/reports/coach/${filters.type}?${params.toString()}`, {
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
      toast.error("Erreur lors de l'export du rapport");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExport = async (type: string, format: string) => {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    setFilters({
      ...filters,
      type,
      format,
      startDate: threeMonthsAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    });

    setTimeout(() => {
      handleExport();
    }, 100);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports et exports</h1>
          <p className="text-gray-600 mt-1">
            Exportez des rapports sur vos cohortes et apprenants
          </p>
        </div>
      </div>

      {/* Exports rapides */}
      <div className="card mb-6 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <h2 className="text-lg font-semibold text-primary-900 mb-4">Exports rapides (3 derniers mois)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickExport('participants', 'CSV')}
            className="btn btn-primary text-sm flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Download size={16} />
            Liste participants (CSV)
          </button>
          <button
            onClick={() => handleQuickExport('coaching-status', 'EXCEL')}
            className="btn btn-primary text-sm flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Download size={16} />
            Statut coaching (Excel)
          </button>
          <button
            onClick={() => handleQuickExport('conversion', 'CSV')}
            className="btn btn-primary text-sm flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Download size={16} />
            Conversion (CSV)
          </button>
        </div>
      </div>

      {/* Types de rapports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            onClick={() => setFilters({ ...filters, type: report.id })}
            className={`card cursor-pointer transition-all hover:shadow-lg ${
              filters.type === report.id
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-3 rounded-lg ${
                  filters.type === report.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <report.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{report.label}</h3>
                <p className="text-sm text-gray-600">{report.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire de filtres */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={20} className="text-primary-600" />
          Paramètres d'export
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="input pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format d'export
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFilters({ ...filters, format: 'CSV' })}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  filters.format === 'CSV'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="mx-auto mb-1" size={24} />
                <p className="text-sm font-medium">CSV</p>
                <p className="text-xs text-gray-600">Excel, Numbers</p>
              </button>
              <button
                onClick={() => setFilters({ ...filters, format: 'EXCEL' })}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  filters.format === 'EXCEL'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileSpreadsheet className="mx-auto mb-1" size={24} />
                <p className="text-sm font-medium">Excel</p>
                <p className="text-xs text-gray-600">Microsoft Excel</p>
              </button>
              <button
                onClick={() => setFilters({ ...filters, format: 'PDF' })}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  filters.format === 'PDF'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileBox className="mx-auto mb-1" size={24} />
                <p className="text-sm font-medium">PDF</p>
                <p className="text-xs text-gray-600">Document</p>
              </button>
            </div>
          </div>

          {/* Bouton d'export */}
          <div className="pt-4 border-t">
            <button
              onClick={handleExport}
              disabled={loading || !filters.startDate || !filters.endDate}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Exporter le rapport
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="card mt-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Informations sur les exports</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Les rapports incluent uniquement vos cohortes et apprenants assignés</li>
          <li>• Les exports CSV sont compatibles avec Excel, Google Sheets et Numbers</li>
          <li>• Les rapports PDF incluent des graphiques et visualisations</li>
          <li>• Les données sont exportées selon la période sélectionnée</li>
          <li>
            • Les notes internes sont incluses dans les rapports (visibles uniquement par vous et
            l'équipe pédagogique)
          </li>
        </ul>
      </div>
    </div>
  );
}
