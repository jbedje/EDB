import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Calendar,
  Award,
  TrendingDown,
  FileText,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  // KPIs Admin
  activeCohorts: number;
  freeCoachingUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  conversionRate: number;
  failedPayments7Days: number;

  // Cohortes récentes
  recentCohorts: Array<{
    id: string;
    label: string;
    startDate: string;
    endDate: string;
    coachName: string;
    status: string;
    enrollmentCount: number;
  }>;

  // Entonnoir de conversion
  funnel: {
    enrolled: number;
    freeCoaching: number;
    paidSubscriptions: number;
  };

  // Revenus
  revenueChart: Array<{
    period: string;
    amount: number;
  }>;

  // Alertes
  alerts: Array<{
    type: 'webhook' | 'reminder' | 'cohort';
    message: string;
    count?: number;
  }>;

  // Top coaches
  topCoaches: Array<{
    id: string;
    name: string;
    studentsCount: number;
    conversionRate: number;
  }>;

  // Stats générales
  users?: any;
  cohorts?: any;
  totalRevenue?: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'cohorts' | 'subscriptions' | 'payments') => {
    try {
      toast.info(`Export ${type} en cours...`);
      const response = await api.get(`/reports/export/${type}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Export réussi');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
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
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord {user?.role === 'ADMIN' ? 'Administrateur' : ''}
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue {user?.firstName} {user?.lastName}
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('cohorts')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              Cohortes
            </button>
            <button
              onClick={() => handleExport('subscriptions')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              Abonnés
            </button>
            <button
              onClick={() => handleExport('payments')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              Paiements
            </button>
          </div>
        )}
      </div>

      {user?.role === 'ADMIN' && (
        <>
          {/* KPIs Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <KPICard
              icon={BookOpen}
              title="Cohortes actives"
              value={dashboardData?.activeCohorts || 0}
              color="blue"
            />
            <KPICard
              icon={Users}
              title="Coaching gratuit"
              value={dashboardData?.freeCoachingUsers || 0}
              color="purple"
            />
            <KPICard
              icon={CheckCircle}
              title="Abonnements actifs"
              value={dashboardData?.activeSubscriptions || 0}
              color="green"
            />
            <KPICard
              icon={DollarSign}
              title="Revenus du mois"
              value={formatCurrency(dashboardData?.monthlyRevenue || 0)}
              color="gold"
              valueSize="sm"
            />
            <KPICard
              icon={TrendingUp}
              title="Taux de conversion"
              value={`${dashboardData?.conversionRate || 0}%`}
              color="teal"
            />
            <KPICard
              icon={XCircle}
              title="Paiements échoués (7j)"
              value={dashboardData?.failedPayments7Days || 0}
              color="red"
            />
          </div>

          {/* Alertes */}
          {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
            <div className="card mb-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">Alertes système</h3>
                  <div className="space-y-1">
                    {dashboardData.alerts.map((alert, index) => (
                      <p key={index} className="text-sm text-yellow-800">
                        • {alert.message} {alert.count && `(${alert.count})`}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Cohortes récentes */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen size={20} className="text-primary-600" />
                  Cohortes récentes
                </h2>
              </div>
              <div className="space-y-3">
                {dashboardData?.recentCohorts && dashboardData.recentCohorts.length > 0 ? (
                  dashboardData.recentCohorts.map((cohort) => (
                    <div
                      key={cohort.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{cohort.label}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
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
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(cohort.startDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {cohort.enrollmentCount} apprenants
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <Award size={14} />
                          Coach: {cohort.coachName}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune cohorte récente</p>
                )}
              </div>
            </div>

            {/* Entonnoir de conversion */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary-600" />
                Entonnoir de conversion
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Inscrits</span>
                    <span className="text-lg font-bold text-gray-900">
                      {dashboardData?.funnel?.enrolled || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Coaching gratuit</span>
                    <span className="text-lg font-bold text-gray-900">
                      {dashboardData?.funnel?.freeCoaching || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full"
                      style={{
                        width: `${
                          dashboardData?.funnel?.enrolled
                            ? (dashboardData.funnel.freeCoaching / dashboardData.funnel.enrolled) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Souscriptions payantes
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {dashboardData?.funnel?.paidSubscriptions || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{
                        width: `${
                          dashboardData?.funnel?.enrolled
                            ? (dashboardData.funnel.paidSubscriptions / dashboardData.funnel.enrolled) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Taux de conversion global
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      {dashboardData?.conversionRate || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique de revenus et Top coaches */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Courbe de revenus */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-primary-600" />
                Évolution des revenus
              </h2>
              {dashboardData?.revenueChart && dashboardData.revenueChart.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.revenueChart.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-24">
                        {item.period}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-end pr-3"
                          style={{
                            width: `${
                              dashboardData.revenueChart && dashboardData.revenueChart.length > 0
                                ? (item.amount / Math.max(...dashboardData.revenueChart.map(r => r.amount))) * 100
                                : 0
                            }%`,
                          }}
                        >
                          <span className="text-xs font-semibold text-white">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune donnée de revenus</p>
              )}
            </div>

            {/* Top coaches */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award size={20} className="text-primary-600" />
                Top coaches
              </h2>
              {dashboardData?.topCoaches && dashboardData.topCoaches.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.topCoaches.map((coach, index) => (
                    <div
                      key={coach.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{coach.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {coach.studentsCount} apprenants
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp size={14} />
                              {coach.conversionRate}% conversion
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun coach actif</p>
              )}
            </div>
          </div>
        </>
      )}

      {user?.role === 'COACH' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Mes apprenants"
            value={dashboardData?.totalStudents || 0}
            color="blue"
          />
          <StatCard
            icon={MessageCircle}
            title="Sessions actives"
            value={dashboardData?.activeSessions?.length || 0}
            color="green"
          />
          <StatCard
            icon={BookOpen}
            title="Cohortes"
            value={dashboardData?.cohorts?.length || 0}
            color="purple"
          />
        </div>
      )}

      {user?.role === 'APPRENANT' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Mes cohortes"
            value={dashboardData?.cohorts?.length || 0}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Progression moyenne"
            value={`${Math.round(dashboardData?.averageProgress || 0)}%`}
            color="green"
          />
          <StatCard
            icon={MessageCircle}
            title="Coaching"
            value={dashboardData?.activeCoaching ? 'Actif' : 'Inactif'}
            color="purple"
          />
        </div>
      )}

      {(user?.role === 'COACH' || user?.role === 'APPRENANT') && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Bienvenue sur EDB</h2>
          <p className="text-gray-600">
            Votre plateforme de gestion de formation en trading et investissement.
          </p>
        </div>
      )}
    </div>
  );
}

interface KPICardProps {
  icon: any;
  title: string;
  value: string | number;
  color: string;
  valueSize?: 'sm' | 'md';
}

function KPICard({ icon: Icon, title, value, color, valueSize = 'md' }: KPICardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    gold: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={20} />
        </div>
        <p className="text-xs text-gray-600 font-medium">{title}</p>
      </div>
      <p className={`font-bold text-gray-900 ${valueSize === 'sm' ? 'text-lg' : 'text-2xl'}`}>
        {value}
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    gold: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
