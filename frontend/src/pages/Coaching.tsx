import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  UserCheck,
  Filter,
  Eye,
  X,
  Send,
  Users as UsersIcon,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

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
  feedbackFromCoach: string | null;
  feedbackFromUser: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  cohort: {
    id: string;
    name: string;
  } | null;
}

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string | null;
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

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock,
  ACTIVE: CheckCircle,
  EXPIRED: XCircle,
  CANCELLED: AlertCircle,
};

export default function Coaching() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignCoachModal, setShowAssignCoachModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CoachingSession | null>(null);
  const [editingSession, setEditingSession] = useState<CoachingSession | null>(null);

  // Form states
  const [availableCoaches, setAvailableCoaches] = useState<Coach[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [availableCohorts, setAvailableCohorts] = useState<any[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'coach' | 'user'>('user');

  // Create/Edit form
  const [formData, setFormData] = useState({
    userId: '',
    cohortId: '',
    coachId: '',
    startDate: '',
    endDate: '',
    isFree: true,
    maxSessions: 12,
    notes: '',
  });

  const isAdmin = user?.role === 'ADMIN';
  const isCoach = user?.role === 'COACH';
  const isApprenant = user?.role === 'APPRENANT';

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let endpoint = '/coaching';

      // Apprenants voient leurs propres sessions
      if (isApprenant) {
        endpoint = '/coaching/my-sessions';
      }
      // Coachs voient les sessions qu'ils supervisent
      else if (isCoach) {
        endpoint = '/coaching/my-coaching';
      }

      const response = await api.get(endpoint);
      setSessions(response.data.data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCoaches = async () => {
    try {
      const response = await api.get('/users?role=COACH');
      setAvailableCoaches(response.data.data.filter((u: any) => u.role === 'COACH'));
    } catch (error) {
      toast.error('Erreur lors du chargement des coachs');
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    if (statusFilter) {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredSessions(filtered);
  };

  const handleAssignCoach = async () => {
    if (!selectedSession || !selectedCoachId) return;

    try {
      await api.put(`/coaching/${selectedSession.id}/assign-coach`, {
        coachId: selectedCoachId,
      });
      toast.success('Coach assigné avec succès');
      setShowAssignCoachModal(false);
      setSelectedCoachId('');
      fetchSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'assignation");
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedSession || !feedback.trim()) return;

    try {
      await api.put(`/coaching/${selectedSession.id}/feedback`, {
        feedback: feedback.trim(),
      });
      toast.success('Feedback ajouté avec succès');
      setShowFeedbackModal(false);
      setFeedback('');
      fetchSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout du feedback");
    }
  };

  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir changer le statut ?`)) return;

    try {
      await api.put(`/coaching/${sessionId}/status`, { status: newStatus });
      toast.success('Statut mis à jour');
      fetchSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const openDetailsModal = (session: CoachingSession) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const openAssignCoachModal = async (session: CoachingSession) => {
    setSelectedSession(session);
    await fetchAvailableCoaches();
    setSelectedCoachId(session.coachId || '');
    setShowAssignCoachModal(true);
  };

  const openFeedbackModal = (session: CoachingSession, type: 'coach' | 'user') => {
    setSelectedSession(session);
    setFeedbackType(type);
    setFeedback(type === 'coach' ? session.feedbackFromCoach || '' : session.feedbackFromUser || '');
    setShowFeedbackModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coaching</h1>
          <p className="text-gray-600 mt-1">
            {isApprenant && 'Vos sessions de coaching personnalisé'}
            {isCoach && 'Sessions de coaching que vous supervisez'}
            {isAdmin && 'Gestion de toutes les sessions de coaching'}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      {isApprenant && (
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Coaching gratuit de 3 mois</h3>
              <p className="text-blue-800 text-sm">
                Profitez de votre période de coaching gratuit pour poser toutes vos questions et progresser rapidement
                dans votre apprentissage de l'investissement en bourse.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input flex-1">
            <option value="">Tous les statuts</option>
            {Object.entries(COACHING_STATUS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')} className="btn btn-secondary">
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="card">
          <p className="text-center text-gray-500">Chargement...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">Aucune session de coaching trouvée</p>
          <p className="text-sm text-gray-400">
            {isApprenant && "Votre session de coaching sera créée automatiquement lors de votre inscription à une cohorte"}
            {isCoach && "Aucune session ne vous a été assignée pour le moment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const StatusIcon = STATUS_ICONS[session.status];
            const daysRemaining = getDaysRemaining(session.endDate);

            return (
              <div key={session.id} className="card hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon size={20} className="text-gray-400" />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[session.status]}`}>
                      {COACHING_STATUS[session.status as keyof typeof COACHING_STATUS]}
                    </span>
                  </div>
                  {session.isFree && (
                    <span className="bg-gold-100 text-gold-800 px-2 py-1 rounded text-xs font-medium">
                      Gratuit
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-primary-600" />
                    <span className="font-medium text-gray-900">
                      {session.user.firstName} {session.user.lastName}
                    </span>
                  </div>
                  {session.coach ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCheck size={16} className="text-green-600" />
                      <span>
                        Coach: {session.coach.firstName} {session.coach.lastName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle size={16} />
                      <span>En attente d'assignation de coach</span>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-primary-600" />
                    <span>Du {formatDate(session.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-primary-600" />
                    <span>Au {formatDate(session.endDate)}</span>
                  </div>
                  {session.status === 'ACTIVE' && daysRemaining > 0 && (
                    <div className="text-xs text-blue-600 font-medium">
                      {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                    <span>Sessions effectuées</span>
                    <span className="font-medium">
                      {session.sessionCount}
                      {session.maxSessions && ` / ${session.maxSessions}`}
                    </span>
                  </div>
                  {session.maxSessions && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((session.sessionCount / session.maxSessions) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openDetailsModal(session)}
                    className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={16} />
                    Détails
                  </button>
                  {isAdmin && !session.coachId && (
                    <button
                      onClick={() => openAssignCoachModal(session)}
                      className="btn btn-primary text-sm p-2"
                      title="Assigner un coach"
                    >
                      <UserCheck size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails de la session de coaching</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Statut</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[selectedSession.status]
                    }`}
                  >
                    {COACHING_STATUS[selectedSession.status as keyof typeof COACHING_STATUS]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type</p>
                  <p className="font-medium">
                    {selectedSession.isFree ? 'Coaching gratuit (3 mois)' : 'Coaching premium'}
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div>
                <h3 className="font-semibold mb-3">Participants</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User size={20} className="text-primary-600" />
                    <div>
                      <p className="font-medium">
                        {selectedSession.user.firstName} {selectedSession.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{selectedSession.user.email}</p>
                      <p className="text-xs text-gray-400">Apprenant</p>
                    </div>
                  </div>
                  {selectedSession.coach ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <UserCheck size={20} className="text-green-600" />
                      <div>
                        <p className="font-medium">
                          {selectedSession.coach.firstName} {selectedSession.coach.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{selectedSession.coach.email}</p>
                        <p className="text-xs text-gray-400">Coach</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-700 text-sm">
                      <AlertCircle size={16} className="inline mr-2" />
                      Aucun coach assigné pour le moment
                    </div>
                  )}
                </div>
              </div>

              {/* Dates and Progress */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date de début</p>
                  <p className="font-medium">{formatDate(selectedSession.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date de fin</p>
                  <p className="font-medium">{formatDate(selectedSession.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sessions effectuées</p>
                  <p className="font-medium">
                    {selectedSession.sessionCount}
                    {selectedSession.maxSessions && ` / ${selectedSession.maxSessions}`}
                  </p>
                </div>
                {selectedSession.cohort && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Cohorte</p>
                    <p className="font-medium">{selectedSession.cohort.name}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedSession.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedSession.notes}</p>
                </div>
              )}

              {/* Feedbacks */}
              <div>
                <h3 className="font-semibold mb-3">Feedbacks</h3>
                <div className="space-y-3">
                  {/* Feedback from User */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Feedback de l'apprenant</p>
                      {(isApprenant || isAdmin) && (
                        <button
                          onClick={() => openFeedbackModal(selectedSession, 'user')}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {selectedSession.feedbackFromUser ? 'Modifier' : 'Ajouter'}
                        </button>
                      )}
                    </div>
                    {selectedSession.feedbackFromUser ? (
                      <p className="text-gray-600 text-sm">{selectedSession.feedbackFromUser}</p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">Aucun feedback pour le moment</p>
                    )}
                  </div>

                  {/* Feedback from Coach */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Feedback du coach</p>
                      {(isCoach || isAdmin) && selectedSession.coachId && (
                        <button
                          onClick={() => openFeedbackModal(selectedSession, 'coach')}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {selectedSession.feedbackFromCoach ? 'Modifier' : 'Ajouter'}
                        </button>
                      )}
                    </div>
                    {selectedSession.feedbackFromCoach ? (
                      <p className="text-gray-600 text-sm">{selectedSession.feedbackFromCoach}</p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">Aucun feedback pour le moment</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              {(isAdmin || isCoach) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {isAdmin && !selectedSession.coachId && (
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          openAssignCoachModal(selectedSession);
                        }}
                        className="btn btn-primary text-sm"
                      >
                        <UserCheck size={16} className="mr-2" />
                        Assigner un coach
                      </button>
                    )}
                    {selectedSession.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedSession.id, 'ACTIVE')}
                        className="btn bg-green-100 hover:bg-green-200 text-green-700 text-sm"
                      >
                        Activer
                      </button>
                    )}
                    {selectedSession.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedSession.id, 'EXPIRED')}
                        className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                      >
                        Marquer comme expiré
                      </button>
                    )}
                    {selectedSession.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedSession.id, 'CANCELLED')}
                        className="btn bg-red-100 hover:bg-red-200 text-red-700 text-sm"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Coach Modal */}
      {showAssignCoachModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Assigner un coach</h2>
              <button onClick={() => setShowAssignCoachModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Session de coaching pour {selectedSession.user.firstName} {selectedSession.user.lastName}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un coach</label>
                <select
                  value={selectedCoachId}
                  onChange={(e) => setSelectedCoachId(e.target.value)}
                  className="input"
                >
                  <option value="">Choisir un coach...</option>
                  {availableCoaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.firstName} {coach.lastName} {coach.bio && `- ${coach.bio}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={handleAssignCoach} disabled={!selectedCoachId} className="flex-1 btn btn-primary">
                  Assigner
                </button>
                <button onClick={() => setShowAssignCoachModal(false)} className="flex-1 btn btn-secondary">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {feedbackType === 'coach' ? 'Feedback du coach' : "Feedback de l'apprenant"}
              </h2>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre feedback</label>
                <textarea
                  rows={6}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Partagez votre expérience, vos observations ou vos questions..."
                  className="input"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddFeedback}
                  disabled={!feedback.trim()}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Envoyer
                </button>
                <button onClick={() => setShowFeedbackModal(false)} className="flex-1 btn btn-secondary">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
