import { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  Calendar,
  DollarSign,
  Package,
  ArrowRight,
  X,
  AlertCircle,
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

const PAYMENT_METHODS = {
  CINETPAY: 'CinetPay',
  ORANGE_MONEY: 'Orange Money',
  WAVE: 'Wave',
  BANK_TRANSFER: 'Virement Bancaire',
};

export default function AvailablePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [createdSubscriptionId, setCreatedSubscriptionId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CINETPAY');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscription-plans');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      // Afficher seulement les plans actifs
      setPlans(data.filter((plan: Plan) => plan.isActive));
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast.error('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      // Créer l'abonnement (statut PENDING_PAYMENT par défaut)
      const response = await api.post('/subscriptions', {
        type: selectedPlan.type,
        price: selectedPlan.price,
      });

      const subscription = response.data;
      setCreatedSubscriptionId(subscription.id);

      toast.success('Abonnement créé avec succès');
      setShowSubscribeModal(false);

      // Ouvrir le modal de paiement
      setShowPaymentModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la souscription');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !createdSubscriptionId) return;

    try {
      // Initier le paiement (statut PENDING par défaut)
      await api.post('/payments/initiate', {
        subscriptionId: createdSubscriptionId,
        amount: selectedPlan.price,
        method: paymentMethod,
      });

      toast.success('Paiement initié avec succès. Veuillez procéder au paiement.');
      setShowPaymentModal(false);
      setSelectedPlan(null);
      setCreatedSubscriptionId(null);
      setPaymentMethod('CINETPAY');

      // Rediriger vers la page des abonnements
      setTimeout(() => {
        window.location.href = '/app/subscriptions';
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'initiation du paiement');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Plans d'abonnement</h1>
        <p className="text-gray-600 mt-1">Choisissez le plan qui vous convient</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun plan disponible</h3>
            <p className="text-gray-600">Les plans d'abonnement seront bientôt disponibles</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="card relative hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary-500"
            >
              {/* Popular badge (for first active plan as example) */}
              {plan.type === 'MENSUEL' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Populaire
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600">
                  {SUBSCRIPTION_TYPES[plan.type as keyof typeof SUBSCRIPTION_TYPES]}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary-600">
                    {formatCurrency(plan.price, plan.currency)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  par {plan.duration} {DURATION_UNITS[plan.durationUnit]}
                </p>
              </div>

              {/* Description */}
              {plan.description && (
                <p className="text-sm text-gray-600 mb-6 text-center">{plan.description}</p>
              )}

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowSubscribeModal(true);
                }}
                className="w-full btn btn-primary flex items-center justify-center gap-2 mt-auto"
              >
                Souscrire maintenant
                <ArrowRight size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Subscribe Confirmation Modal */}
      {showSubscribeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Confirmer la souscription</h2>
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedPlan.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{selectedPlan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary-600">
                    {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                  </span>
                  <span className="text-sm text-gray-600">
                    / {selectedPlan.duration} {DURATION_UNITS[selectedPlan.durationUnit]}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      Important
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Après confirmation, vous serez dirigé vers la page de paiement pour finaliser votre abonnement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
                <button onClick={handleSubscribe} className="flex-1 btn btn-primary">
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Procéder au paiement</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Montant à payer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Pour: {selectedPlan.name}
                </p>
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
                  <strong>Note:</strong> Le paiement sera initié et vous recevrez les instructions pour finaliser la transaction via la méthode choisie.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="flex-1 btn btn-primary flex items-center justify-center gap-2">
                  <CreditCard size={18} />
                  Payer maintenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
