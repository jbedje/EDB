import { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  durationUnit: 'MONTH' | 'YEAR';
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlanStats {
  totalPlans: number;
  activePlans: number;
  totalSubscribers: number;
  monthlyRevenue: number;
}

const SUBSCRIPTION_TYPES = {
  MENSUEL: 'Mensuel',
  TRIMESTRIEL: 'Trimestriel',
  SEMESTRIEL: 'Semestriel',
  ANNUEL: 'Annuel',
};

const DURATION_UNITS = {
  MONTH: 'Mois',
  YEAR: 'An(s)',
};

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<PlanStats>({
    totalPlans: 0,
    activePlans: 0,
    totalSubscribers: 0,
    monthlyRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'MENSUEL',
    description: '',
    price: '',
    currency: 'XOF',
    duration: '1',
    durationUnit: 'MONTH' as 'MONTH' | 'YEAR',
    features: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
    fetchStats();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscription-plans');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setPlans(data);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast.error('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/subscription-plans/stats');
      const data = response.data.data || response.data || {};
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/subscription-plans', {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration: parseInt(formData.duration),
        durationUnit: formData.durationUnit,
        features: formData.features.split('\n').filter((f) => f.trim()),
        isActive: formData.isActive,
      });
      toast.success('Plan créé avec succès');
      setShowCreateModal(false);
      resetForm();
      fetchPlans();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      await api.put(`/subscription-plans/${selectedPlan.id}`, {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration: parseInt(formData.duration),
        durationUnit: formData.durationUnit,
        features: formData.features.split('\n').filter((f) => f.trim()),
        isActive: formData.isActive,
      });
      toast.success('Plan mis à jour avec succès');
      setShowEditModal(false);
      resetForm();
      fetchPlans();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return;

    try {
      await api.delete(`/subscription-plans/${planId}`);
      toast.success('Plan supprimé avec succès');
      fetchPlans();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      await api.patch(`/subscription-plans/${plan.id}/toggle-active`);
      toast.success(
        `Plan ${plan.isActive ? 'désactivé' : 'activé'} avec succès`
      );
      fetchPlans();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      description: plan.description,
      price: plan.price.toString(),
      currency: plan.currency,
      duration: plan.duration.toString(),
      durationUnit: plan.durationUnit,
      features: plan.features.join('\n'),
      isActive: plan.isActive,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'MENSUEL',
      description: '',
      price: '',
      currency: 'XOF',
      duration: '1',
      durationUnit: 'MONTH',
      features: '',
      isActive: true,
    });
    setSelectedPlan(null);
  };

  const formatCurrency = (amount: number, currency: string = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plans d'abonnement</h1>
          <p className="text-gray-600 mt-1">Gérez les plans et tarifs</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau plan
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total plans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlans}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plans actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.activePlans}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Abonnés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus/mois</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(stats.monthlyRevenue)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun plan trouvé</h3>
            <p className="text-gray-600 mb-6">Commencez par créer votre premier plan</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Créer un plan
            </button>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`card relative ${
                !plan.isActive ? 'opacity-60 bg-gray-50' : ''
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{SUBSCRIPTION_TYPES[plan.type as keyof typeof SUBSCRIPTION_TYPES]}</p>
                </div>
                <div className="flex items-center gap-2">
                  {plan.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      Actif
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                      Inactif
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primary-600">
                    {formatCurrency(plan.price, plan.currency)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  par {plan.duration} {DURATION_UNITS[plan.durationUnit]}
                </p>
              </div>

              {/* Description */}
              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              )}

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 btn btn-secondary text-sm"
                  title="Voir les détails"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => openEditModal(plan)}
                  className="flex-1 btn btn-secondary text-sm"
                  title="Modifier"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleToggleActive(plan)}
                  className={`flex-1 btn text-sm ${
                    plan.isActive ? 'btn-secondary' : 'btn-primary'
                  }`}
                  title={plan.isActive ? 'Désactiver' : 'Activer'}
                >
                  {plan.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="flex-1 btn btn-secondary text-red-600 text-sm"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {showCreateModal ? 'Créer un plan' : 'Modifier le plan'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={showCreateModal ? handleCreate : handleUpdate}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du plan *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Ex: Plan Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  {Object.entries(SUBSCRIPTION_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Description du plan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input"
                    placeholder="XOF"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durée *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unité</label>
                  <select
                    value={formData.durationUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationUnit: e.target.value as 'MONTH' | 'YEAR',
                      })
                    }
                    className="input"
                  >
                    {Object.entries(DURATION_UNITS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonctionnalités (une par ligne)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="input"
                  rows={6}
                  placeholder="Accès illimité au contenu&#10;Support prioritaire&#10;Analyses avancées"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Plan actif
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn btn-primary">
                  {showCreateModal ? 'Créer le plan' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails du plan</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Statut</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPlan.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedPlan.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPlan.name}</h3>
                <p className="text-gray-600">
                  {SUBSCRIPTION_TYPES[selectedPlan.type as keyof typeof SUBSCRIPTION_TYPES]}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                  <span className="text-lg text-gray-600 font-normal ml-2">
                    / {selectedPlan.duration} {DURATION_UNITS[selectedPlan.durationUnit]}
                  </span>
                </p>
              </div>

              {selectedPlan.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900">{selectedPlan.description}</p>
                </div>
              )}

              {selectedPlan.features && selectedPlan.features.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fonctionnalités
                  </label>
                  <div className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                  </label>
                  <p className="text-sm text-gray-900">{formatDate(selectedPlan.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dernière modification
                  </label>
                  <p className="text-sm text-gray-900">{formatDate(selectedPlan.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
