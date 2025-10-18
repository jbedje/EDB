import { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Search,
  Filter,
  Eye,
  X,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Edit,
  Plus,
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

interface NotificationData {
  id: string;
  userId: string;
  type: 'EMAIL' | 'SMS' | 'IN_APP';
  status: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
  title: string;
  message: string;
  data?: any;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS';
  subject: string;
  body: string;
  variables: string[];
}

interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  emailsSent: number;
  smsSent: number;
}

const NOTIFICATION_TYPES = {
  EMAIL: 'Email',
  SMS: 'SMS',
  IN_APP: 'In-App',
};

const NOTIFICATION_STATUS = {
  PENDING: 'En attente',
  SENT: 'Envoyé',
  FAILED: 'Échoué',
  READ: 'Lu',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  READ: 'bg-blue-100 text-blue-800',
};

const STATUS_ICONS = {
  PENDING: Clock,
  SENT: CheckCircle,
  FAILED: XCircle,
  READ: Eye,
};

const TYPE_ICONS = {
  EMAIL: Mail,
  SMS: MessageSquare,
  IN_APP: Bell,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    emailsSent: 0,
    smsSent: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);

  const [sendFormData, setSendFormData] = useState({
    type: 'EMAIL',
    recipients: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
    fetchStats();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchTerm, typeFilter, statusFilter, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setNotifications(data);
      setFilteredNotifications(data);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/notifications/templates');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setTemplates(data);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/notifications/stats');
      const data = response.data.data || response.data || {};
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilter = () => {
    let filtered = [...notifications];

    if (searchTerm) {
      filtered = filtered.filter(
        (notif) =>
          notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((notif) => notif.type === typeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((notif) => notif.status === statusFilter);
    }

    setFilteredNotifications(filtered);
  };

  const handleRetry = async (notificationId: string) => {
    try {
      await api.post(`/notifications/${notificationId}/retry`);
      toast.success('Notification renvoyée avec succès');
      fetchNotifications();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du renvoi');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendFormData.recipients || !sendFormData.message) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/notifications/send', {
        type: sendFormData.type,
        recipients: sendFormData.recipients.split(',').map((r) => r.trim()),
        subject: sendFormData.subject,
        message: sendFormData.message,
      });
      toast.success('Notification envoyée avec succès');
      setShowSendModal(false);
      setSendFormData({ type: 'EMAIL', recipients: '', subject: '', message: '' });
      fetchNotifications();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
    }
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

  const getTypeIcon = (type: string) => {
    const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || Bell;
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
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Gérez les notifications et templates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Edit size={20} />
            Templates
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Send size={20} />
            Envoyer
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Envoyés</p>
              <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Échoués</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emails</p>
              <p className="text-2xl font-bold text-gray-900">{stats.emailsSent}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SMS</p>
              <p className="text-2xl font-bold text-gray-900">{stats.smsSent}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <MessageSquare className="text-teal-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input">
            <option value="">Tous les types</option>
            {Object.entries(NOTIFICATION_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(NOTIFICATION_STATUS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('');
              setStatusFilter('');
            }}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <Filter size={20} />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinataire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
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
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Aucune notification trouvée
                    </h3>
                    <p className="text-gray-600 mb-6">Commencez par envoyer une notification</p>
                    <button
                      onClick={() => setShowSendModal(true)}
                      className="btn btn-primary inline-flex items-center gap-2"
                    >
                      <Send size={20} />
                      Envoyer une notification
                    </button>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <span className="text-sm text-gray-900">
                          {NOTIFICATION_TYPES[notification.type]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notification.user ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {notification.user.firstName} {notification.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{notification.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {notification.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[notification.status]
                        }`}
                      >
                        {getStatusIcon(notification.status)}
                        {NOTIFICATION_STATUS[notification.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(notification.createdAt)}</div>
                      {notification.sentAt && (
                        <div className="text-xs text-green-600">
                          Envoyé: {formatDate(notification.sentAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowDetailsModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="Voir les détails"
                      >
                        <Eye size={18} />
                      </button>
                      {notification.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetry(notification.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Renvoyer"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails de la notification</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Statut</span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    STATUS_COLORS[selectedNotification.status]
                  }`}
                >
                  {getStatusIcon(selectedNotification.status)}
                  {NOTIFICATION_STATUS[selectedNotification.status]}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex items-center gap-2 text-gray-900">
                  {getTypeIcon(selectedNotification.type)}
                  {NOTIFICATION_TYPES[selectedNotification.type]}
                </div>
              </div>

              {selectedNotification.user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinataire
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {selectedNotification.user.firstName} {selectedNotification.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedNotification.user.email}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <p className="text-gray-900">{selectedNotification.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                  </label>
                  <p className="text-sm text-gray-900">{formatDate(selectedNotification.createdAt)}</p>
                </div>
                {selectedNotification.sentAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'envoi
                    </label>
                    <p className="text-sm text-green-600">{formatDate(selectedNotification.sentAt)}</p>
                  </div>
                )}
              </div>

              {selectedNotification.status === 'FAILED' && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      handleRetry(selectedNotification.id);
                      setShowDetailsModal(false);
                    }}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={20} />
                    Renvoyer la notification
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Envoyer une notification</h2>
              <button onClick={() => setShowSendModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSendNotification} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  required
                  value={sendFormData.type}
                  onChange={(e) => setSendFormData({ ...sendFormData, type: e.target.value })}
                  className="input"
                >
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataires (emails séparés par virgule) *
                </label>
                <input
                  type="text"
                  required
                  value={sendFormData.recipients}
                  onChange={(e) => setSendFormData({ ...sendFormData, recipients: e.target.value })}
                  className="input"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              {sendFormData.type === 'EMAIL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                  <input
                    type="text"
                    value={sendFormData.subject}
                    onChange={(e) => setSendFormData({ ...sendFormData, subject: e.target.value })}
                    className="input"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  required
                  value={sendFormData.message}
                  onChange={(e) => setSendFormData({ ...sendFormData, message: e.target.value })}
                  className="input"
                  rows={6}
                  placeholder="Votre message..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn btn-primary">
                  Envoyer
                </button>
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Templates de notifications</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aucun template disponible. Créez votre premier template!
                  </p>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-600">Type: {template.type}</p>
                        </div>
                        <button className="text-primary-600 hover:text-primary-900">
                          <Edit size={18} />
                        </button>
                      </div>
                      {template.subject && (
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Sujet:</strong> {template.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 line-clamp-2">{template.body}</p>
                      {template.variables && template.variables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.variables.map((variable, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
