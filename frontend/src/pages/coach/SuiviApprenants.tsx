import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Edit,
  Save,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cohortLabel: string;
  status: 'FREE_COACHING' | 'ELIGIBLE' | 'SUBSCRIBED' | 'EXPIRED';
  coachingStartDate: string;
  coachingEndDate: string;
  daysRemaining: number;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  lastPaymentDate?: string;
  totalPaid?: number;
  attendance: number;
  notes?: string;
  progress?: number;
}

export default function SuiviApprenants() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users/my-students');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setStudents(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des apprenants');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setNotesText(student.notes || '');
    setEditingNotes(false);
    setShowDetailsModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedStudent) return;

    try {
      await api.put(`/users/${selectedStudent.id}/notes`, { notes: notesText });
      toast.success('Notes sauvegardées avec succès');
      setEditingNotes(false);

      // Mettre à jour l'apprenant dans la liste
      setStudents(
        students.map((s) => (s.id === selectedStudent.id ? { ...s, notes: notesText } : s))
      );
      setSelectedStudent({ ...selectedStudent, notes: notesText });
    } catch (error: any) {
      toast.error('Erreur lors de la sauvegarde des notes');
    }
  };

  const handleMarkAttendance = async (studentId: string, present: boolean) => {
    try {
      await api.post(`/users/${studentId}/attendance`, { present });
      toast.success(present ? 'Présence marquée' : 'Absence marquée');
      fetchStudents();
    } catch (error: any) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      FREE_COACHING: 'bg-purple-100 text-purple-800',
      ELIGIBLE: 'bg-yellow-100 text-yellow-800',
      SUBSCRIBED: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
    };
    const labels = {
      FREE_COACHING: 'Coaching gratuit',
      ELIGIBLE: 'Éligible',
      SUBSCRIBED: 'Abonné',
      EXPIRED: 'Expiré',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
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

  const stats = {
    total: students.length,
    freeCoaching: students.filter((s) => s.status === 'FREE_COACHING').length,
    eligible: students.filter((s) => s.status === 'ELIGIBLE').length,
    subscribed: students.filter((s) => s.status === 'SUBSCRIBED').length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suivi des apprenants</h1>
          <p className="text-gray-600 mt-1">
            Suivez la progression de vos apprenants et gérez leurs notes privées
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Users size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Total apprenants</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Clock size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Coaching gratuit</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.freeCoaching}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <AlertCircle size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Éligibles</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.eligible}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <CheckCircle size={20} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Abonnés</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.subscribed}</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 flex items-center gap-3">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="flex-1 outline-none text-gray-900"
            />
          </div>

          {/* Filtre statut */}
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input min-w-[200px]"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="FREE_COACHING">Coaching gratuit</option>
              <option value="ELIGIBLE">Éligible abonnement</option>
              <option value="SUBSCRIBED">Abonné</option>
              <option value="EXPIRED">Expiré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des apprenants */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Apprenant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Cohorte
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Coaching
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Assiduité
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{student.cohortLabel}</p>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(student.status)}</td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatDate(student.coachingStartDate)} - {formatDate(student.coachingEndDate)}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            student.daysRemaining <= 7
                              ? 'text-red-600'
                              : student.daysRemaining <= 14
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}
                        >
                          J-{student.daysRemaining}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              student.attendance >= 80
                                ? 'bg-green-500'
                                : student.attendance >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${student.attendance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">{student.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="btn btn-secondary text-sm flex items-center gap-2"
                      >
                        <Eye size={16} />
                        Voir fiche
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Aucun apprenant trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails Apprenant */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedStudent.email}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Informations générales */}
                <div className="card bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users size={18} className="text-primary-600" />
                    Informations générales
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cohorte:</span>
                      <span className="font-medium">{selectedStudent.cohortLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Téléphone:</span>
                      <span className="font-medium">{selectedStudent.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      {getStatusBadge(selectedStudent.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assiduité:</span>
                      <span className="font-medium">{selectedStudent.attendance}%</span>
                    </div>
                  </div>
                </div>

                {/* Coaching */}
                <div className="card bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-primary-600" />
                    Coaching gratuit
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Début:</span>
                      <span className="font-medium">{formatDate(selectedStudent.coachingStartDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fin:</span>
                      <span className="font-medium">{formatDate(selectedStudent.coachingEndDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jours restants:</span>
                      <span
                        className={`font-bold ${
                          selectedStudent.daysRemaining <= 7
                            ? 'text-red-600'
                            : selectedStudent.daysRemaining <= 14
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        J-{selectedStudent.daysRemaining}
                      </span>
                    </div>
                    {selectedStudent.progress !== undefined && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Progression:</span>
                          <span className="font-medium">{selectedStudent.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${selectedStudent.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Abonnement */}
                {selectedStudent.status === 'SUBSCRIBED' && (
                  <div className="card bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard size={18} className="text-primary-600" />
                      Abonnement
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium">{selectedStudent.subscriptionPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut:</span>
                        <span className="font-medium text-green-600">
                          {selectedStudent.subscriptionStatus}
                        </span>
                      </div>
                      {selectedStudent.lastPaymentDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dernier paiement:</span>
                          <span className="font-medium">
                            {formatDate(selectedStudent.lastPaymentDate)}
                          </span>
                        </div>
                      )}
                      {selectedStudent.totalPaid && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total payé:</span>
                          <span className="font-medium">
                            {formatCurrency(selectedStudent.totalPaid)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes internes */}
              <div className="card bg-yellow-50 border-yellow-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText size={18} className="text-yellow-600" />
                    Notes internes (privées)
                  </h3>
                  {!editingNotes ? (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="btn btn-secondary text-sm flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNotes}
                        className="btn btn-primary text-sm flex items-center gap-2"
                      >
                        <Save size={16} />
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(false);
                          setNotesText(selectedStudent.notes || '');
                        }}
                        className="btn btn-secondary text-sm flex items-center gap-2"
                      >
                        <X size={16} />
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
                {editingNotes ? (
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    rows={6}
                    placeholder="Ajoutez des notes sur cet apprenant (progrès, points d'attention, objectifs, etc.)"
                  />
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {notesText || 'Aucune note pour cet apprenant'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
