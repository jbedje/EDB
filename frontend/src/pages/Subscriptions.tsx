import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CreditCard, Calendar, CheckCircle, XCircle, Clock, AlertCircle,
  DollarSign, Eye, X, Plus, RefreshCw, Trash2, TrendingUp, ToggleLeft, ToggleRight,
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Subscription {
  id: string;
  userId: string;
  type: string;
  status: string;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  user: User;
}

interface Statistics {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  pendingPayment: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

const SUBSCRIPTION_TYPES: Record<string, string> = {
  MONTHLY: 'Mensuel',
  QUARTERLY: 'Trimestriel',
  YEARLY: 'Annuel',
};

const SUBSCRIPTION_STATUS: Record<string, string> = {
  ACTIVE: 'Actif',
  EXPIRED: 'Expiré',
  CANCELLED: 'Annulé',
  PENDING_PAYMENT: 'En attente de paiement',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
};

const STATUS_ICONS: Record<string, any> = {
  ACTIVE: CheckCircle,
  EXPIRED: XCircle,
  CANCELLED: XCircle,
  PENDING_PAYMENT: Clock,
};

export default function Subscriptions() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({ userId: '', type: 'MONTHLY', price: '' });

  useEffect(() => {
    fetchSubscriptions();
    if (isAdmin) {
      fetchStatistics();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/subscriptions' : '/subscriptions/my-subscriptions';
      const response = await api.get(endpoint);
      const data = Array.isArray(response.data) ? response.data : [];
      setSubscriptions(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des abonnements');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/subscriptions/statistics');
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Erreur stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      console.log('Response complète:', response);
      console.log('Response.data:', response.data);
      console.log('Type de response.data:', Array.isArray(response.data) ? 'array' : typeof response.data);

      // L'API /users retourne directement un tableau d'utilisateurs
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setUsers(data);
      console.log('Users chargés:', data.length, data);
    } catch (error: any) {
      console.error('Erreur fetchUsers:', error);
      console.error('Error response:', error.response?.data);
      setUsers([]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/subscriptions', {
        userId: formData.userId || undefined,
        type: formData.type,
        price: parseFloat(formData.price),
      });
      toast.success('Abonnement créé avec succès');
      setShowCreateModal(false);
      setFormData({ userId: '', type: 'MONTHLY', price: '' });
      fetchSubscriptions();
      if (isAdmin) fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleCancel = async () => {
    if (!selectedSubscription) return;
    try {
      await api.put(`/subscriptions/${selectedSubscription.id}/cancel`, {
        reason: cancelReason.trim() || undefined,
      });
      toast.success('Abonnement annulé avec succès');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedSubscription(null);
      fetchSubscriptions();
      if (isAdmin) fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.put(`/subscriptions/${id}/activate`);
      toast.success('Abonnement activé');
      fetchSubscriptions();
      if (isAdmin) fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleRenew = async (id: string) => {
    try {
      await api.put(`/subscriptions/${id}/renew`);
      toast.success('Abonnement renouvelé');
      fetchSubscriptions();
      if (isAdmin) fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleToggleAutoRenew = async (subscription: Subscription) => {
    try {
      await api.put(`/subscriptions/${subscription.id}`, {
        autoRenew: !subscription.autoRenew,
      });
      const message = !subscription.autoRenew ? 'Renouvellement automatique activé' : 'Renouvellement automatique désactivé';
      toast.success(message);
      fetchSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      toast.success('Abonnement supprimé');
      fetchSubscriptions();
      if (isAdmin) fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesStatus = !statusFilter || sub.status === statusFilter;
    const matchesType = !typeFilter || sub.type === typeFilter;
    const matchesSearch = !searchQuery ||
      `${sub.user.firstName} ${sub.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
          <p className="text-gray-600 mt-1">Gérez les abonnements des apprenants</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nouvel abonnement
          </button>
        )}
      </div>

      {isAdmin && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.active}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.pendingPayment}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenu total</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(Number(statistics.totalRevenue))}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isAdmin && (
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          )}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
            <option value="">Tous les statuts</option>
            {Object.entries(SUBSCRIPTION_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input">
            <option value="">Tous les types</option>
            {Object.entries(SUBSCRIPTION_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card"><p className="text-center text-gray-500">Chargement...</p></div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="card"><p className="text-center text-gray-500">Aucun abonnement trouvé</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSubscriptions.map((subscription) => {
            const StatusIcon = STATUS_ICONS[subscription.status];
            const daysRemaining = getDaysRemaining(subscription.endDate);
            const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

            return (
              <div key={subscription.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isAdmin ? `${subscription.user.firstName} ${subscription.user.lastName}` : 'Mon abonnement'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[subscription.status]}`}>
                        <StatusIcon size={14} className="inline mr-1" />
                        {SUBSCRIPTION_STATUS[subscription.status]}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {SUBSCRIPTION_TYPES[subscription.type]}
                      </span>
                    </div>

                    {isAdmin && <p className="text-sm text-gray-600 mb-2">{subscription.user.email}</p>}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Prix</p>
                        <p className="font-semibold text-gray-900">{formatPrice(subscription.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date de début</p>
                        <p className="font-semibold text-gray-900">{formatDate(subscription.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date de fin</p>
                        <p className="font-semibold text-gray-900">{formatDate(subscription.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Jours restants</p>
                        <p className={`font-semibold ${isExpiringSoon ? 'text-orange-600' : daysRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {daysRemaining > 0 ? `${daysRemaining} jours` : 'Expiré'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        {subscription.autoRenew ? (
                          <ToggleRight className="text-green-600" size={20} />
                        ) : (
                          <ToggleLeft className="text-gray-400" size={20} />
                        )}
                        <span className="text-sm text-gray-600">
                          Renouvellement auto: {subscription.autoRenew ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {subscription.status !== 'CANCELLED' && (
                      <>
                        <button
                          onClick={() => handleToggleAutoRenew(subscription)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title={subscription.autoRenew ? 'Désactiver auto-renew' : 'Activer auto-renew'}
                        >
                          {subscription.autoRenew ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>

                        {subscription.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRenew(subscription.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Renouveler"
                          >
                            <RefreshCw size={20} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowCancelModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Annuler"
                        >
                          <XCircle size={20} />
                        </button>
                      </>
                    )}

                    {isAdmin && subscription.status === 'PENDING_PAYMENT' && (
                      <button
                        onClick={() => handleActivate(subscription.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Activer"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(subscription.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Créer un abonnement</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisateur (optionnel)
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="input"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Laissez vide pour créer un abonnement pour vous-même</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'abonnement *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                  required
                >
                  {Object.entries(SUBSCRIPTION_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (XOF) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input"
                  placeholder="Ex: 50000"
                  required
                  min="0"
                  step="1000"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelModal && selectedSubscription && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Annuler l'abonnement</h2>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <AlertCircle className="text-orange-600 mx-auto" size={48} />
              <p className="text-center text-gray-600 mt-4">
                Êtes-vous sûr de vouloir annuler cet abonnement ?
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de l'annulation (optionnel)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input"
                rows={3}
                placeholder="Expliquez pourquoi vous annulez cet abonnement..."
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary flex-1">
                Retour
              </button>
              <button onClick={handleCancel} className="btn bg-red-600 hover:bg-red-700 text-white flex-1">
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
