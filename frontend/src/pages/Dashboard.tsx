import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import { Users, BookOpen, DollarSign, TrendingUp, MessageCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Tableau de bord - {user?.role}
      </h1>

      {user?.role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Utilisateurs"
            value={dashboardData?.users?.reduce((acc: number, u: any) => acc + u._count, 0) || 0}
            color="blue"
          />
          <StatCard
            icon={BookOpen}
            title="Cohortes actives"
            value={dashboardData?.cohorts?.find((c: any) => c.status === 'ACTIVE')?._count || 0}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            title="Revenus totaux"
            value={`${dashboardData?.totalRevenue || 0} XOF`}
            color="gold"
          />
          <StatCard
            icon={TrendingUp}
            title="Abonnements actifs"
            value={dashboardData?.activeSubscriptions || 0}
            color="purple"
          />
        </div>
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

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Bienvenue sur EDB</h2>
        <p className="text-gray-600">
          Votre plateforme de gestion de formation en trading et investissement.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    gold: 'bg-gold-100 text-gold-600',
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
