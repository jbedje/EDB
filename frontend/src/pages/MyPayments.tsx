import { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

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
  subscription?: {
    id: string;
    type: string;
  };
}

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
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-blue-100 text-blue-800 border-blue-200',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_ICONS = {
  PENDING: Clock,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  REFUNDED: CreditCard,
  CANCELLED: XCircle,
};

export default function MyPayments() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CINETPAY');

  useEffect(() => {
    fetchMyPayments();
  }, []);

  const fetchMyPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/my-payments');
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setPayments(data);
    } catch (error: any) {
      console.error('Erreur fetchMyPayments:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      // Mettre à jour le paiement avec la nouvelle méthode si nécessaire
      await api.put(`/payments/${selectedPayment.id}`, {
        method: paymentMethod,
      });

      toast.success('Paiement initié. Veuillez suivre les instructions de paiement.');
      setShowPayModal(false);
      setSelectedPayment(null);
      fetchMyPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du paiement');
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
    return <Icon size={20} />;
  };

  // Séparer les paiements en attente et les autres
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const otherPayments = payments.filter((p) => p.status !== 'PENDING');

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mes paiements</h1>
        <p className="text-gray-600 mt-1">Gérez vos paiements et demandes de paiement</p>
      </div>

      {/* Pending Payments Section */}
      {pendingPayments.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-yellow-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Demandes de paiement en attente</h2>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {pendingPayments.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPayments.map((payment) => (
              <div
                key={payment.id}
                className="card border-2 border-yellow-200 bg-yellow-50 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <DollarSign className="text-yellow-600" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {PAYMENT_METHODS[payment.method as keyof typeof PAYMENT_METHODS]}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
                      STATUS_COLORS[payment.status as keyof typeof STATUS_COLORS]
                    }`}
                  >
                    {getStatusIcon(payment.status)}
                    {PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS]}
                  </span>
                </div>

                {payment.subscription && (
                  <div className="mb-4 p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Abonnement</p>
                    <p className="font-medium text-gray-900">{payment.subscription.type}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs text-gray-500">Demandé le</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(payment.createdAt)}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setPaymentMethod(payment.method);
                      setShowPayModal(true);
                    }}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Procéder au paiement
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowDetailsModal(true);
                    }}
                    className="btn btn-secondary p-2"
                    title="Voir les détails"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Payments Section */}
      {otherPayments.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Historique des paiements</h2>

          <div className="card">
            <div className="space-y-3">
              {otherPayments.map((payment) => {
                const StatusIcon = STATUS_ICONS[payment.status as keyof typeof STATUS_ICONS] || Clock;
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        payment.status === 'COMPLETED' ? 'bg-green-100' :
                        payment.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <StatusIcon className={`${
                          payment.status === 'COMPLETED' ? 'text-green-600' :
                          payment.status === 'FAILED' ? 'text-red-600' : 'text-gray-600'
                        }`} size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                              STATUS_COLORS[payment.status as keyof typeof STATUS_COLORS]
                            }`}
                          >
                            {PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {PAYMENT_METHODS[payment.method as keyof typeof PAYMENT_METHODS]} • {formatDate(payment.createdAt)}
                        </p>
                        {payment.subscription && (
                          <p className="text-xs text-gray-500 mt-1">
                            Abonnement: {payment.subscription.type}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetailsModal(true);
                      }}
                      className="btn btn-secondary text-sm p-2"
                      title="Voir les détails"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {payments.length === 0 && (
        <div className="card text-center py-12">
          <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun paiement</h3>
          <p className="text-gray-600">Vous n'avez aucun paiement pour le moment</p>
        </div>
      )}

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
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
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
              {selectedPayment.transactionId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Transaction
                    </label>
                    <p className="text-sm font-mono text-gray-900">
                      {selectedPayment.transactionId}
                    </p>
                  </div>
                  {selectedPayment.providerReference && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Référence fournisseur
                      </label>
                      <p className="text-sm font-mono text-gray-900">
                        {selectedPayment.providerReference}
                      </p>
                    </div>
                  )}
                </div>
              )}

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

      {/* Pay Modal */}
      {showPayModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Procéder au paiement</h2>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleProceedPayment} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Montant à payer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </p>
                {selectedPayment.subscription && (
                  <p className="text-sm text-gray-600 mt-1">
                    Pour: {selectedPayment.subscription.type}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement *
                </label>
                <select
                  required
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input"
                >
                  {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Vous serez redirigé vers la page de paiement pour finaliser la transaction via la méthode choisie.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="flex-1 btn btn-primary flex items-center justify-center gap-2">
                  <CreditCard size={18} />
                  Confirmer le paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
