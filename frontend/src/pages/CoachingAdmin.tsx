import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  UserCheck,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../lib/api';

interface CoachingSession {
  id: string;
  userId: string;
  cohortId: string | null;
  coachId: string | null;
  status: string;
  startDate: string;
  endDate: string;
  isFree: boolean;
  sessionCount: number;
  maxSessions: number | null;
  notes: string | null;
  user: { id: string; firstName: string; lastName: string; email: string };
  coach: { id: string; firstName: string; lastName: string } | null;
  cohort: { id: string; label: string } | null;
}

const COACHING_STATUS = {
  PENDING: 'En attente',
  ACTIVE: 'Actif',
  EXPIRED: 'Expiré',
  CANCELLED: 'Annulé',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function CoachingAdmin() {
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<CoachingSession | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CoachingSession | null>(null);

  // Listes déroulantes
  const [users, setUsers] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);

  // Formulaire
  const [formData, setFormData] = useState({
    userId: '',
    cohortId: '',
    coachId: '',
    startDate: '',
    endDate: '',
    isFree: true,
    maxSessions: 12,
    status: 'ACTIVE',
    notes: '',
  });

  useEffect(() => {
    fetchSessions();
    fetchDropdownData();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/coaching');
      setSessions(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [usersRes, coachesRes, cohortsRes] = await Promise.all([
        api.get('/users?role=APPRENANT'),
        api.get('/users?role=COACH'),
        api.get('/cohorts'),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || []);
      setCoaches(Array.isArray(coachesRes.data) ? coachesRes.data : coachesRes.data.data || []);
      setCohorts(Array.isArray(cohortsRes.data) ? cohortsRes.data : cohortsRes.data.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      cohortId: '',
      coachId: '',
      startDate: '',
      endDate: '',
      isFree: true,
      maxSessions: 12,
      status: 'ACTIVE',
      notes: '',
    });
    setEditingSession(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (session: CoachingSession) => {
    setEditingSession(session);
    setFormData({
      userId: session.userId,
      cohortId: session.cohortId || '',
      coachId: session.coachId || '',
      startDate: session.startDate.split('T')[0],
      endDate: session.endDate.split('T')[0],
      isFree: session.isFree,
      maxSessions: session.maxSessions || 12,
      status: session.status,
      notes: session.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.startDate || !formData.endDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const payload = {
        ...formData,
        cohortId: formData.cohortId || null,
        coachId: formData.coachId || null,
        maxSessions: formData.maxSessions || null,
        notes: formData.notes || null,
      };

      if (editingSession) {
        await api.put(`/coaching/${editingSession.id}`, payload);
        toast.success('Session modifiée avec succès');
      } else {
        await api.post('/coaching', payload);
        toast.success('Session créée avec succès');
      }

      setShowModal(false);
      resetForm();
      fetchSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return;

    try {
      await api.delete(`/coaching/${id}`);
      toast.success('Session supprimée avec succès');
      fetchSessions();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleViewDetails = (session: CoachingSession) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des sessions de coaching</h1>
          <p className="text-gray-600 mt-1">
            Créer, modifier et gérer toutes les sessions de coaching
          </p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nouvelle session
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Apprenant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Coach
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Cohorte
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Période
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.user.firstName} {session.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{session.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {session.coach ? (
                        <p className="text-sm text-gray-900">
                          {session.coach.firstName} {session.coach.lastName}
                        </p>
                      ) : (
                        <span className="text-sm text-orange-600">Non assigné</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {session.cohort ? (
                        <p className="text-sm text-gray-900">{session.cohort.label}</p>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p>{formatDate(session.startDate)}</p>
                        <p className="text-gray-600">au {formatDate(session.endDate)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          session.isFree ? 'bg-gold-100 text-gold-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {session.isFree ? 'Gratuit' : 'Premium'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          STATUS_COLORS[session.status]
                        }`}
                      >
                        {COACHING_STATUS[session.status as keyof typeof COACHING_STATUS]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(session)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(session)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Aucune session de coaching
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingSession ? 'Modifier la session' : 'Nouvelle session de coaching'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Apprenant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apprenant <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="input"
                    required
                    disabled={!!editingSession}
                  >
                    <option value="">Sélectionner un apprenant</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Coach */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
                  <select
                    value={formData.coachId}
                    onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                    className="input"
                  >
                    <option value="">Aucun coach (à assigner plus tard)</option>
                    {coaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.firstName} {coach.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cohorte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cohorte</label>
                  <select
                    value={formData.cohortId}
                    onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
                    className="input"
                  >
                    <option value="">Aucune cohorte</option>
                    {cohorts.map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                {/* Type et Sessions max */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.isFree.toString()}
                      onChange={(e) =>
                        setFormData({ ...formData, isFree: e.target.value === 'true' })
                      }
                      className="input"
                    >
                      <option value="true">Gratuit</option>
                      <option value="false">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sessions max
                    </label>
                    <input
                      type="number"
                      value={formData.maxSessions}
                      onChange={(e) =>
                        setFormData({ ...formData, maxSessions: parseInt(e.target.value) })
                      }
                      className="input"
                      min="1"
                    />
                  </div>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    {Object.entries(COACHING_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Notes internes sur la session..."
                  />
                </div>
              </div>

              <div className="border-t px-6 py-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingSession ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Details */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails de la session</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info générale */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Apprenant</p>
                  <p className="font-medium">
                    {selectedSession.user.firstName} {selectedSession.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedSession.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coach</p>
                  {selectedSession.coach ? (
                    <p className="font-medium">
                      {selectedSession.coach.firstName} {selectedSession.coach.lastName}
                    </p>
                  ) : (
                    <span className="text-orange-600">Non assigné</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cohorte</p>
                  <p className="font-medium">
                    {selectedSession.cohort?.label || 'Aucune cohorte'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full ${
                      selectedSession.isFree ? 'bg-gold-100 text-gold-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedSession.isFree ? 'Gratuit' : 'Premium'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                      STATUS_COLORS[selectedSession.status]
                    }`}
                  >
                    {COACHING_STATUS[selectedSession.status as keyof typeof COACHING_STATUS]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sessions</p>
                  <p className="font-medium">
                    {selectedSession.sessionCount}
                    {selectedSession.maxSessions && ` / ${selectedSession.maxSessions}`}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Période</p>
                <div className="flex items-center gap-2 text-sm">
                  <span>Du {formatDate(selectedSession.startDate)}</span>
                  <span>au {formatDate(selectedSession.endDate)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedSession.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedSession.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
