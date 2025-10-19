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
  CreditCard,
  Search,
  ExternalLink,
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
        <>
          {/* KPIs Coach */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              icon={BookOpen}
              title="Cohortes actives"
              value={dashboardData?.activeCohortsCount || 0}
              color="blue"
            />
            <KPICard
              icon={Users}
              title="Coaching gratuit"
              value={dashboardData?.freeCoachingCount || 0}
              color="purple"
            />
            <KPICard
              icon={Clock}
              title="Échéances (14j)"
              value={dashboardData?.upcomingDeadlines14 || 0}
              color="gold"
            />
            <KPICard
              icon={TrendingUp}
              title="Taux de conversion"
              value={`${dashboardData?.coachConversionRate || 0}%`}
              color="green"
            />
          </div>

          {/* Recherche rapide */}
          <div className="card mb-6">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un apprenant (nom, email)..."
                className="flex-1 outline-none text-gray-900"
              />
              <button className="btn btn-primary">Rechercher</button>
            </div>
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Mes Cohortes */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-primary-600" />
                Mes cohortes
              </h2>
              <div className="space-y-3">
                {dashboardData?.myCohortes && dashboardData.myCohortes.length > 0 ? (
                  dashboardData.myCohortes.map((cohort: any) => (
                    <div
                      key={cohort.id}
                      className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-blue-900">{cohort.label}</h3>
                          <p className="text-sm text-blue-700">
                            {formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-200 text-blue-800 font-medium">
                          {cohort.enrollmentCount} apprenants
                        </span>
                      </div>

                      {/* Barre de progression coaching */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-blue-700 mb-1">
                          <span>Coaching en cours</span>
                          <span>{cohort.coachingProgress || 0}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${cohort.coachingProgress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <button className="w-full btn btn-primary text-sm">
                        Voir les détails
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune cohorte assignée</p>
                )}
              </div>
            </div>

            {/* Échéances à venir */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary-600" />
                Échéances à venir
              </h2>
              <div className="space-y-2">
                {dashboardData?.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0 ? (
                  dashboardData.upcomingDeadlines.map((deadline: any) => (
                    <div
                      key={deadline.studentId}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{deadline.studentName}</p>
                          <p className="text-sm text-gray-600">{deadline.email}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              deadline.daysRemaining <= 1
                                ? 'bg-red-100 text-red-800'
                                : deadline.daysRemaining <= 7
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            J-{deadline.daysRemaining}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(deadline.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune échéance à venir</p>
                )}
              </div>
            </div>
          </div>

          {/* Planning & Conversion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Planning à 7 jours */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary-600" />
                Planning à 7 jours
              </h2>
              <div className="space-y-3">
                {dashboardData?.upcomingSessions && dashboardData.upcomingSessions.length > 0 ? (
                  dashboardData.upcomingSessions.map((session: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{session.title}</h3>
                          <p className="text-sm text-gray-600">{session.cohortLabel}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-800">
                          {session.date}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {session.zoomLink && (
                          <a
                            href={session.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-900"
                          >
                            <ExternalLink size={14} />
                            Zoom
                          </a>
                        )}
                        {session.whatsappLink && (
                          <a
                            href={session.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-900"
                          >
                            <ExternalLink size={14} />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune session planifiée</p>
                )}
              </div>
            </div>

            {/* Conversion par cohorte */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary-600" />
                Conversion par cohorte
              </h2>
              <div className="space-y-4">
                {dashboardData?.cohortConversions && dashboardData.cohortConversions.length > 0 ? (
                  dashboardData.cohortConversions.map((cohort: any) => (
                    <div key={cohort.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{cohort.label}</span>
                        <span className="text-lg font-bold text-primary-600">
                          {cohort.conversionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            cohort.conversionRate >= 50
                              ? 'bg-green-500'
                              : cohort.conversionRate >= 30
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${cohort.conversionRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{cohort.freeCount} gratuit</span>
                        <span>{cohort.paidCount} payants</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune donnée de conversion</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {user?.role === 'APPRENANT' && (
        <>
          {/* KPIs Apprenant */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              icon={Clock}
              title="Coaching gratuit"
              value={dashboardData?.coachingDaysRemaining !== undefined
                ? `J-${dashboardData.coachingDaysRemaining}`
                : 'Inactif'}
              color={dashboardData?.coachingDaysRemaining && dashboardData.coachingDaysRemaining < 14 ? 'red' : 'purple'}
            />
            <KPICard
              icon={CheckCircle}
              title="Statut abonnement"
              value={dashboardData?.subscriptionStatus || 'Aucun'}
              color={dashboardData?.subscriptionStatus === 'ACTIVE' ? 'green' : 'gold'}
            />
            <KPICard
              icon={Calendar}
              title="Prochaine échéance"
              value={dashboardData?.nextDueDate
                ? new Date(dashboardData.nextDueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                : '-'}
              color="blue"
            />
            <KPICard
              icon={DollarSign}
              title="Total payé (12 mois)"
              value={formatCurrency(dashboardData?.totalPaid12Months || 0)}
              color="teal"
              valueSize="sm"
            />
          </div>

          {/* Grille principale apprenants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Ma Cohorte */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-primary-600" />
                Ma cohorte
              </h2>
              {dashboardData?.myCohort ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <h3 className="font-bold text-lg text-primary-900 mb-2">
                      {dashboardData.myCohort.label}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} className="text-primary-600" />
                        <span>
                          Du {formatDate(dashboardData.myCohort.startDate)} au {formatDate(dashboardData.myCohort.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Award size={16} className="text-primary-600" />
                        <span>Coach: {dashboardData.myCohort.coachName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users size={16} className="text-primary-600" />
                        <span>{dashboardData.myCohort.participants} participants</span>
                      </div>
                    </div>
                  </div>

                  {dashboardData.myCohort.zoomLinks && dashboardData.myCohort.zoomLinks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Sessions de coaching</h4>
                      <div className="space-y-2">
                        {dashboardData.myCohort.zoomLinks.map((link: any, index: number) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{link.title}</p>
                              <p className="text-sm text-gray-600">{link.date}</p>
                            </div>
                            <TrendingUp size={16} className="text-primary-600" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune cohorte assignée</p>
              )}
            </div>

            {/* Mon Coaching */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-primary-600" />
                Mon coaching gratuit
              </h2>
              {dashboardData?.myCoaching ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Statut</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        dashboardData.myCoaching.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {dashboardData.myCoaching.isActive ? 'Actif' : 'Expiré'}
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Début</span>
                      <span>Aujourd'hui</span>
                      <span>Fin</span>
                    </div>
                    <div className="relative">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            dashboardData.myCoaching.progress >= 90
                              ? 'bg-red-500'
                              : dashboardData.myCoaching.progress >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${dashboardData.myCoaching.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatDate(dashboardData.myCoaching.startDate)}</span>
                      <span className="font-bold text-primary-600">
                        {dashboardData.coachingDaysRemaining} jours restants
                      </span>
                      <span>{formatDate(dashboardData.myCoaching.endDate)}</span>
                    </div>
                  </div>

                  {dashboardData.coachingDaysRemaining && dashboardData.coachingDaysRemaining <= 14 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Votre coaching gratuit expire bientôt ! Pensez à souscrire un abonnement.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun coaching actif</p>
              )}
            </div>
          </div>

          {/* Mes Abonnements & Paiements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Mon Abonnement */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-primary-600" />
                Mon abonnement
              </h2>
              {dashboardData?.mySubscription ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-primary-900">
                          {dashboardData.mySubscription.planName}
                        </h3>
                        <p className="text-sm text-primary-700">{dashboardData.mySubscription.type}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          dashboardData.mySubscription.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : dashboardData.mySubscription.status === 'EXPIRED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {dashboardData.mySubscription.status}
                      </span>
                    </div>

                    <div className="text-3xl font-bold text-primary-900 mb-2">
                      {formatCurrency(dashboardData.mySubscription.price)}
                    </div>

                    {dashboardData.mySubscription.features && (
                      <ul className="space-y-1 mb-4">
                        {dashboardData.mySubscription.features.slice(0, 3).map((feature: string, index: number) => (
                          <li key={index} className="text-sm text-primary-800 flex items-center gap-2">
                            <CheckCircle size={14} className="text-primary-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="text-sm text-primary-700">
                      Renouvellement: {formatDate(dashboardData.mySubscription.renewDate)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 btn btn-primary text-sm">
                      Renouveler
                    </button>
                    <button className="flex-1 btn btn-secondary text-sm">
                      Changer de plan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Aucun abonnement actif</p>
                  <button className="btn btn-primary">Choisir un plan</button>
                </div>
              )}
            </div>

            {/* Mes Paiements */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-primary-600" />
                Mes paiements récents
              </h2>
              {dashboardData?.recentPayments && dashboardData.recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              payment.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {formatDate(payment.date)} • {payment.method}
                        </p>
                      </div>
                      <button className="text-primary-600 hover:text-primary-900">
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="w-full btn btn-secondary text-sm">
                    Voir tout l'historique
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun paiement</p>
              )}
            </div>
          </div>

          {/* Notifications récentes */}
          {dashboardData?.recentNotifications && dashboardData.recentNotifications.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell size={20} className="text-primary-600" />
                Notifications récentes
              </h2>
              <div className="space-y-2">
                {dashboardData.recentNotifications.map((notification: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Bell size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(notification.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
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
