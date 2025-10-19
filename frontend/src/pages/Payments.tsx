import { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Eye,
  DollarSign,
  User,
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Ban
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

// Types
interface PaymentData {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionId?: string;
  providerReference?: string;
  failureReason?: string;
  paidAt?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subscription?: {
    id: string;
    type: string;
  };
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SubscriptionData {
  id: string;
  type: string;
  price: number;
}

interface StatsData {
  totalRevenue: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

// Constants
const PAYMENT_METHODS = {
  CINETPAY: 'CinetPay',
  ORANGE_MONEY: 'Orange Money',
  WAVE: 'Wave',
  BANK_TRANSFER: 'Virement Bancaire',
};

const PAYMENT_STATUS = {
  PENDING: 'En attente',
  COMPLETED: 'Complété',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé',
  CANCELLED: 'Annulé',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const STATUS_ICONS = {
  PENDING: Clock,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  REFUNDED: RefreshCw,
  CANCELLED: Ban,
};

export default function Payments() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalRevenue: 0,
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    subscriptionId: '',
    amount: '',
    method: 'CINETPAY',
  });

  useEffect(() => {
    fetchPayments();
    fetchUsers();
    fetchSubscriptions();
    fetchStats();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchTerm, statusFilter, methodFilter, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments');
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setPayments(data);
      setFilteredPayments(data);
    } catch (error: any) {
      console.error('Erreur fetchPayments:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setUsers(data);
    } catch (error: any) {
      console.error('Erreur fetchUsers:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setSubscriptions(data);
    } catch (error: any) {
      console.error('Erreur fetchSubscriptions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/payments/stats');
      const data = response.data.data || response.data || {};
      setStats(data);
    } catch (error: any) {
      console.error('Erreur fetchStats:', error);
    }
  };

  const handleFilter = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.amount.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    // Method filter
    if (methodFilter) {
      filtered = filtered.filter((payment) => payment.method === methodFilter);
    }

    setFilteredPayments(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.amount || !formData.method) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/payments/initiate', {
        userId: formData.userId,
        subscriptionId: formData.subscriptionId || undefined,
        amount: parseFloat(formData.amount),
        method: formData.method,
      });
      toast.success('Paiement initié avec succès (statut: EN ATTENTE)');
      setShowCreateModal(false);
      setFormData({ userId: '', subscriptionId: '', amount: '', method: 'CINETPAY' });
      fetchPayments();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'initiation du paiement');
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedPayment || !newStatus) {
      toast.error('Veuillez sélectionner un statut');
      return;
    }

    try {
      await api.put(`/payments/${selectedPayment.id}/status`, { status: newStatus });
      toast.success('Statut du paiement mis à jour avec succès');
      setShowChangeStatusModal(false);
      setNewStatus('');
      setSelectedPayment(null);
      fetchPayments();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;

    try {
      await api.delete(`/payments/${paymentId}`);
      toast.success('Paiement supprimé avec succès');
      fetchPayments();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    return <Icon size={16} />;
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
          <h1 className="text-3xl font-bold text-gray-900">Paiements</h1>
          <p className="text-gray-600 mt-1">Gérez les paiements et transactions</p>
        </div>
        <button
          onClick={() => {
            setFormData({ userId: '', subscriptionId: '', amount: '', method: 'CINETPAY' });
            setShowCreateModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau paiement
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenu total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPayments}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Complétés</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completedPayments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingPayments}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Échoués</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.failedPayments}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="input"
          >
            <option value="">Toutes les méthodes</option>
            {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setMethodFilter('');
            }}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <Filter size={20} />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Aucun paiement trouvé
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Commencez par créer un nouveau paiement
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary inline-flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Nouveau paiement
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.user?.firstName} {payment.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{payment.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      {payment.subscription && (
                        <div className="text-xs text-gray-500">{payment.subscription.type}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {PAYMENT_METHODS[payment.method as keyof typeof PAYMENT_METHODS]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[payment.status as keyof typeof STATUS_COLORS]
                        }`}
                      >
                        {getStatusIcon(payment.status)}
                        {PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {payment.transactionId || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.createdAt)}
                      </div>
                      {payment.paidAt && (
                        <div className="text-xs text-green-600">
                          Payé: {formatDate(payment.paidAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Voir les détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setNewStatus(payment.status);
                            setShowChangeStatusModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Changer le statut"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails du paiement</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Statut</span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    STATUS_COLORS[selectedPayment.status as keyof typeof STATUS_COLORS]
                  }`}
                >
                  {getStatusIcon(selectedPayment.status)}
                  {PAYMENT_STATUS[selectedPayment.status as keyof typeof PAYMENT_STATUS]}
                </span>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant
                  </label>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Méthode de paiement
                  </label>
                  <p className="text-gray-900">
                    {PAYMENT_METHODS[selectedPayment.method as keyof typeof PAYMENT_METHODS]}
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisateur
                </label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {selectedPayment.user?.firstName} {selectedPayment.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedPayment.user?.email}</p>
                </div>
              </div>

              {/* Subscription Info */}
              {selectedPayment.subscription && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Abonnement
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {selectedPayment.subscription.type}
                    </p>
                    <p className="text-sm text-gray-600">ID: {selectedPayment.subscriptionId}</p>
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Transaction
                  </label>
                  <p className="text-sm font-mono text-gray-900">
                    {selectedPayment.transactionId || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Référence fournisseur
                  </label>
                  <p className="text-sm font-mono text-gray-900">
                    {selectedPayment.providerReference || '-'}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                  </label>
                  <p className="text-sm text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                {selectedPayment.paidAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de paiement
                    </label>
                    <p className="text-sm text-green-600">{formatDate(selectedPayment.paidAt)}</p>
                  </div>
                )}
              </div>

              {/* Failure Reason */}
              {selectedPayment.failureReason && (
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Raison de l'échec
                  </label>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-900">{selectedPayment.failureReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Initier un paiement</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisateur *
                </label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="input"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abonnement (optionnel)
                </label>
                <select
                  value={formData.subscriptionId}
                  onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
                  className="input"
                >
                  <option value="">Aucun abonnement</option>
                  {subscriptions.map((subscription) => (
                    <option key={subscription.id} value={subscription.id}>
                      {subscription.type} - {formatCurrency(subscription.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (XOF) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input"
                  placeholder="Ex: 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement *
                </label>
                <select
                  required
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="input"
                >
                  {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn btn-primary">
                  Initier le paiement
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showChangeStatusModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Changer le statut du paiement</h2>
              <button
                onClick={() => setShowChangeStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Paiement de <span className="font-medium">{formatCurrency(selectedPayment.amount)}</span> pour{' '}
                  <span className="font-medium">
                    {selectedPayment.user?.firstName} {selectedPayment.user?.lastName}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau statut *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input"
                  required
                >
                  {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Le changement de statut aura un impact sur les abonnements et statistiques.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowChangeStatusModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
                <button onClick={handleChangeStatus} className="flex-1 btn btn-primary">
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
