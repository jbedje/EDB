import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import {
  BookOpen,
  Users,
  Calendar,
  Award,
  Eye,
  Edit,
  TrendingUp,
  MessageCircle,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface Cohort {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  trainingDate: string;
  status: string;
  enrollmentCount: number;
  coachingProgress: number;
  freeCoachingCount: number;
  eligibleCount: number;
  subscribedCount: number;
  conversionRate: number;
}

export default function MesCohortes() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMyCohorts();
  }, []);

  const fetchMyCohorts = async () => {
    try {
      const response = await api.get('/cohorts/my-cohorts');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setCohorts(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des cohortes');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleViewDetails = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes cohortes</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos cohortes assignées et suivez la progression de vos apprenants
          </p>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <BookOpen size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Total cohortes</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cohorts.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Users size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Total apprenants</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {cohorts.reduce((sum, c) => sum + c.enrollmentCount, 0)}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <MessageCircle size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">En coaching gratuit</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {cohorts.reduce((sum, c) => sum + (c.freeCoachingCount || 0), 0)}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
              <TrendingUp size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Conversion moyenne</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {cohorts.length > 0
              ? Math.round(
                  cohorts.reduce((sum, c) => sum + (c.conversionRate || 0), 0) / cohorts.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Liste des cohortes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cohorts.length > 0 ? (
          cohorts.map((cohort) => (
            <div
              key={cohort.id}
              className="card hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{cohort.label}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      cohort.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : cohort.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {cohort.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users size={16} />
                  <span className="font-bold">{cohort.enrollmentCount}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} className="text-primary-600" />
                  <span>Formation: {formatDate(cohort.trainingDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle size={14} className="text-primary-600" />
                  <span>
                    Coaching: {formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}
                  </span>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-700 mb-1">
                  <span>Progression coaching</span>
                  <span className="font-bold">{cohort.coachingProgress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (cohort.coachingProgress || 0) >= 80
                        ? 'bg-green-500'
                        : (cohort.coachingProgress || 0) >= 50
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${cohort.coachingProgress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Gratuit</p>
                  <p className="font-bold text-purple-900">{cohort.freeCoachingCount || 0}</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-gray-600">Éligible</p>
                  <p className="font-bold text-yellow-900">{cohort.eligibleCount || 0}</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Abonné</p>
                  <p className="font-bold text-green-900">{cohort.subscribedCount || 0}</p>
                </div>
              </div>

              {/* Taux de conversion */}
              <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Taux de conversion</span>
                  <span className="text-lg font-bold text-primary-600">
                    {cohort.conversionRate || 0}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(cohort)}
                  className="flex-1 btn btn-primary text-sm flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Voir détails
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune cohorte assignée</p>
          </div>
        )}
      </div>

      {/* Modal Détails Cohorte */}
      {showDetailsModal && selectedCohort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCohort.label}</h2>
                  <p className="text-gray-600 mt-1">Détails de la cohorte</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations générales */}
                <div className="card bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Informations générales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedCohort.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedCohort.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date de formation:</span>
                      <span className="font-medium">{formatDate(selectedCohort.trainingDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Période coaching:</span>
                      <span className="font-medium">
                        {formatDate(selectedCohort.startDate)} - {formatDate(selectedCohort.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effectif total:</span>
                      <span className="font-medium">{selectedCohort.enrollmentCount} apprenants</span>
                    </div>
                  </div>
                </div>

                {/* Statistiques détaillées */}
                <div className="card bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Statistiques</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">En coaching gratuit</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedCohort.freeCoachingCount || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Éligibles abonnement</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedCohort.eligibleCount || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Abonnés</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedCohort.subscribedCount || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Taux de conversion</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {selectedCohort.conversionRate || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 btn btn-secondary">Voir les apprenants</button>
                  <button className="flex-1 btn btn-primary">Gérer le planning</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
