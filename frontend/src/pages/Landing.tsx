import { Link } from 'react-router-dom';
import { TrendingUp, Users, BookOpen, Award, ArrowRight, CheckCircle, Star } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="École de la Bourse" className="h-12" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#formations" className="text-gray-700 hover:text-primary-600 transition">
                Formations
              </a>
              <a href="#apropos" className="text-gray-700 hover:text-primary-600 transition">
                Qui sommes-nous ?
              </a>
              <a href="#temoignages" className="text-gray-700 hover:text-primary-600 transition">
                Témoignages
              </a>
              <Link
                to="/login"
                className="btn btn-primary"
              >
                Se former en ligne
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#1e2757] via-[#242c64] to-[#1a1f4a] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Votre argent mérite mieux que{' '}
              <span className="inline-block bg-white text-[#242c64] px-4 py-2 rounded">
                3,5%*
              </span>
            </h1>
            <p className="text-2xl md:text-3xl mb-4 text-yellow-400 font-semibold">
              Apprenez comment investir
            </p>
            <p className="text-xl md:text-2xl mb-8">
              et <span className="text-yellow-400 font-semibold">gagnez davantage grâce à la BRVM</span>
            </p>
            <p className="text-sm mb-8 opacity-90">
              *Taux d'intérêt créditeur pour les comptes d'épargne simples, dans l'UEMOA
            </p>
            <a
              href="#formations"
              className="inline-flex items-center gap-2 bg-yellow-400 text-[#242c64] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105"
            >
              Nos formations
              <ArrowRight size={20} />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">500+</div>
              <div className="text-sm opacity-90 mt-1">Apprenants formés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">95%</div>
              <div className="text-sm opacity-90 mt-1">Taux de satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">3 mois</div>
              <div className="text-sm opacity-90 mt-1">Coaching gratuit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">100%</div>
              <div className="text-sm opacity-90 mt-1">En ligne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#242c64] mb-6">
              Notre Mission
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Rendre <span className="text-yellow-600 font-semibold">l'investissement en bourse</span> simple
              et accessible à tous, en vous accompagnant pas à pas dans votre parcours d'investisseur.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="formations" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#242c64] mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Une formation complète pour maîtriser l'investissement en bourse
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-[#242c64] mb-4">
                Formations pratiques
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Des cours structurés et faciles à suivre, adaptés aux débutants comme aux investisseurs confirmés.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-[#242c64] mb-4">
                Coaching personnalisé
              </h3>
              <p className="text-gray-600 leading-relaxed">
                3 mois de coaching gratuit avec un expert pour vous accompagner dans vos premiers investissements.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <TrendingUp size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-[#242c64] mb-4">
                Résultats concrets
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nos apprenants obtiennent des rendements réguliers et maîtrisent les stratégies d'investissement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#242c64] mb-12 text-center">
              Ce que vous allez apprendre
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Les fondamentaux de la bourse et de la BRVM',
                'Comment analyser une entreprise avant d\'investir',
                'Les stratégies de gestion des risques',
                'Comment construire un portefeuille diversifié',
                'L\'analyse technique et fondamentale',
                'Comment passer vos premiers ordres en bourse',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={24} />
                  <span className="text-gray-700 text-lg">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="temoignages" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#242c64] mb-4">
              Témoignages
            </h2>
            <p className="text-gray-600 text-lg">
              Ce que nos apprenants disent de nous
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Grâce à l'École de la Bourse, j'ai pu réaliser un rendement de 8,18% en seulement 15 jours.
                La formation est claire et les coachs sont toujours disponibles."
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">AB</span>
                </div>
                <div>
                  <div className="font-semibold text-[#242c64]">Abdoul B.</div>
                  <div className="text-sm text-gray-500">Comptable</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Je n'avais aucune connaissance en bourse. Maintenant je gère mon portefeuille en toute confiance
                avec un rendement annuel de 9,95%."
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">MK</span>
                </div>
                <div>
                  <div className="font-semibold text-[#242c64]">Marie K.</div>
                  <div className="text-sm text-gray-500">Fonctionnaire</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Formation excellente ! Les modules sont bien structurés et le coaching personnalisé fait vraiment
                la différence. Je recommande vivement."
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">JD</span>
                </div>
                <div>
                  <div className="font-semibold text-[#242c64]">Jean D.</div>
                  <div className="text-sm text-gray-500">Chef magasinier</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#1e2757] via-[#242c64] to-[#1a1f4a] text-white">
        <div className="container mx-auto px-6 text-center">
          <Award size={64} className="mx-auto mb-6 text-yellow-400" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer votre parcours d'investisseur ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez des centaines d'apprenants qui ont transformé leur avenir financier
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-yellow-400 text-[#242c64] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105"
          >
            Commencer maintenant
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="apropos" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/logo.png" alt="École de la Bourse" className="h-12 mb-4 brightness-0 invert" />
              <p className="text-gray-400 text-sm">
                Votre partenaire pour réussir en bourse
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Formations</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-yellow-400 transition">Trading Basics</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Analyse Technique</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Gestion des Risques</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">À propos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-yellow-400 transition">Qui sommes-nous ?</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Notre équipe</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition">Partenaires</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: contact@ecoledelabourse.com</li>
                <li>Téléphone: +225 XX XX XX XX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 École de la Bourse. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
