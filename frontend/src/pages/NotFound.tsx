import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg">
            <Search size={64} className="text-gray-400" />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page introuvable
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <button
            onClick={() => navigate('/app')}
            className="btn btn-primary flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Aller à l'accueil
          </button>
        </div>

        {/* Helpful Links */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Pages qui pourraient vous intéresser:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/app')}
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Tableau de bord
            </button>
            <button
              onClick={() => navigate('/app/cohorts')}
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Cohortes
            </button>
            <button
              onClick={() => navigate('/app/subscriptions')}
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Abonnements
            </button>
            <button
              onClick={() => navigate('/app/profile')}
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Profil
            </button>
          </div>
        </div>

        {/* Support Info */}
        <p className="text-sm text-gray-500 mt-8">
          Besoin d'aide?{' '}
          <a href="mailto:support@edb.com" className="text-primary-600 hover:underline">
            Contactez le support
          </a>
        </p>
      </div>
    </div>
  );
}
