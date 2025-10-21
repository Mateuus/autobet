import Link from 'next/link';
import { ArrowRight, Shield, Zap, BarChart3, Users } from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: 'Segurança Total',
      description: 'Seus dados e credenciais são protegidos com criptografia de ponta a ponta.'
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: 'Automação Inteligente',
      description: 'Gerencie múltiplas contas simultaneamente com estratégias automatizadas.'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-600" />,
      title: 'Analytics Avançado',
      description: 'Relatórios detalhados e insights para otimizar suas estratégias.'
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: 'Multi-Contas',
      description: 'Conecte todas as suas contas de apostas em uma única plataforma.'
    }
  ];

  const supportedPlatforms = [
    { name: 'Lotogreen', logo: '🟢' },
    { name: 'McGames', logo: '🎮' },
    { name: 'EstrelaBet', logo: '⭐' },
    { name: 'JogoDeOuro', logo: '🏆' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              AutoBet
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto animate-fade-in">
              A plataforma mais avançada para gerenciar suas contas de apostas de forma inteligente e automatizada
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link 
                href="/register" 
                className="btn-primary bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link 
                href="/login" 
                className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o AutoBet?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnologia de ponta para maximizar seus resultados nas apostas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Plataformas Suportadas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conecte suas contas das principais casas de apostas do Brasil
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {supportedPlatforms.map((platform, index) => (
              <div key={index} className="card-hover text-center animate-fade-in">
                <div className="text-4xl mb-4">{platform.logo}</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {platform.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para revolucionar suas apostas?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se a milhares de usuários que já otimizaram seus resultados com o AutoBet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="btn-primary bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            >
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Link>
            <Link 
              href="/demo" 
              className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3 rounded-lg font-semibold transition-all duration-200"
            >
              Ver Demonstração
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Usuários Ativos</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-green-600 mb-2">R$ 2M+</div>
              <div className="text-gray-600">Volume Gerenciado</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Garantido</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
