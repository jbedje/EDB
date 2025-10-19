import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Video,
  MessageSquare,
  Clock,
  BookOpen,
} from 'lucide-react';

interface Session {
  id: string;
  cohortId: string;
  cohortLabel: string;
  title: string;
  theme: string;
  date: string;
  time: string;
  duration: number;
  zoomLink?: string;
  whatsappLink?: string;
  notes?: string;
}

interface Cohort {
  id: string;
  label: string;
}

export default function Planning() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    cohortId: '',
    title: '',
    theme: '',
    date: '',
    time: '',
    duration: 60,
    zoomLink: '',
    whatsappLink: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, cohortsRes] = await Promise.all([
        api.get('/coaching-sessions/my-sessions'),
        api.get('/cohorts/my-cohorts'),
      ]);

      setSessions(
        Array.isArray(sessionsRes.data) ? sessionsRes.data : sessionsRes.data.data || []
      );
      setCohorts(
        Array.isArray(cohortsRes.data) ? cohortsRes.data : cohortsRes.data.data || []
      );
    } catch (error: any) {
      toast.error('Erreur lors du chargement');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cohortId || !formData.title || !formData.date || !formData.time) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingSession) {
        await api.put(`/coaching-sessions/${editingSession.id}`, formData);
        toast.success('Session modifiée avec succès');
      } else {
        await api.post('/coaching-sessions', formData);
        toast.success('Session créée avec succès');
      }

      setShowModal(false);
      setEditingSession(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setFormData({
      cohortId: session.cohortId,
      title: session.title,
      theme: session.theme,
      date: session.date,
      time: session.time,
      duration: session.duration,
      zoomLink: session.zoomLink || '',
      whatsappLink: session.whatsappLink || '',
      notes: session.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return;

    try {
      await api.delete(`/coaching-sessions/${id}`);
      toast.success('Session supprimée avec succès');
      fetchData();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      cohortId: '',
      title: '',
      theme: '',
      date: '',
      time: '',
      duration: 60,
      zoomLink: '',
      whatsappLink: '',
      notes: '',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const groupSessionsByDate = () => {
    const grouped: { [key: string]: Session[] } = {};
    sessions.forEach((session) => {
      const date = session.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(session);
    });
    return grouped;
  };

  const groupedSessions = groupSessionsByDate();
  const sortedDates = Object.keys(groupedSessions).sort();

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
          <h1 className="text-3xl font-bold text-gray-900">Planning des sessions</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos sessions de coaching, ajoutez les liens Zoom et WhatsApp
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSession(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvelle session
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Calendar size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Total sessions</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Clock size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Cette semaine</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {
              sessions.filter((s) => {
                const sessionDate = new Date(s.date);
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return sessionDate >= now && sessionDate <= weekFromNow;
              }).length
            }
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Video size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Avec Zoom</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {sessions.filter((s) => s.zoomLink).length}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <MessageSquare size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Avec WhatsApp</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {sessions.filter((s) => s.whatsappLink).length}
          </p>
        </div>
      </div>

      {/* Planning */}
      <div className="space-y-6">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <div key={date} className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary-600" />
                {formatDate(date)}
              </h2>
              <div className="space-y-3">
                {groupedSessions[date].map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{session.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {session.cohortLabel}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {session.time} ({session.duration} min)
                          </span>
                        </div>
                        {session.theme && (
                          <p className="text-sm text-gray-700 mt-2">
                            <span className="font-medium">Thème:</span> {session.theme}
                          </p>
                        )}
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-1">{session.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(session)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Liens */}
                    <div className="flex gap-3">
                      {session.zoomLink && (
                        <a
                          href={session.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm"
                        >
                          <Video size={16} />
                          Rejoindre Zoom
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {session.whatsappLink && (
                        <a
                          href={session.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          <MessageSquare size={16} />
                          Groupe WhatsApp
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune session planifiée</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 btn btn-primary"
            >
              Créer votre première session
            </button>
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingSession ? 'Modifier la session' : 'Nouvelle session'}
                  </h2>
                  <p className="text-gray-600 mt-1">Renseignez les informations de la session</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSession(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cohorte <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.cohortId}
                    onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Sélectionnez une cohorte</option>
                    {cohorts.map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="Ex: Session de trading avancé"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thème</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="input"
                    placeholder="Ex: Analyse technique"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) })
                    }
                    className="input"
                    min="15"
                    step="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien Zoom
                  </label>
                  <div className="flex items-center gap-2">
                    <Video size={18} className="text-primary-600" />
                    <input
                      type="url"
                      value={formData.zoomLink}
                      onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                      className="input flex-1"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien WhatsApp
                  </label>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-green-600" />
                    <input
                      type="url"
                      value={formData.whatsappLink}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsappLink: e.target.value })
                      }
                      className="input flex-1"
                      placeholder="https://chat.whatsapp.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Notes privées sur la session..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSession(null);
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
    </div>
  );
}
