'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SITES = [
  { id: 'lotogreen', platform: 'biahosted', name: 'Lotogreen', siteUrl: 'https://lotogreen.bet.br' },
  { id: 'mcgames', platform: 'biahosted', name: 'McGames', siteUrl: 'https://mcgames.bet.br' },
  { id: 'estrelabet', platform: 'biahosted', name: 'EstrelaBet', siteUrl: 'https://www.estrelabet.bet.br' },
  { id: 'jogodeouro', platform: 'biahosted', name: 'JogoDeOuro', siteUrl: 'https://jogodeouro.bet.br' }
];

export function AddAccountModal({ isOpen, onClose, onSuccess }: AddAccountModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    platform: '',
    site: '',
    name: '',
    email: '',
    password: '',
    siteUrl: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSiteChange = (siteId: string) => {
    const site = SITES.find(s => s.id === siteId);
    setFormData(prev => ({
      ...prev,
      platform: site?.platform || 'biahosted',
      site: siteId,
      name: site?.name || '',
      siteUrl: site?.siteUrl || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Conta adicionada com sucesso!');
        setTimeout(() => {
          onSuccess();
          onClose();
          // Reset form
          setFormData({
            platform: '',
            site: '',
            name: '',
            email: '',
            password: '',
            siteUrl: ''
          });
        }, 1500);
      } else {
        setError(data.error || 'Erro ao adicionar conta');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Adicionar Nova Conta</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* Platform (readonly) - só aparece quando site é selecionado */}
          {formData.site && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plataforma
              </label>
              <input
                type="text"
                value={formData.platform}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          )}

          {/* Site Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site de Apostas *
            </label>
            <select
              name="site"
              value={formData.site}
              onChange={(e) => handleSiteChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Selecione um site</option>
              {SITES.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Conta *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ex: Minha Conta Lotogreen"
            />
          </div>

          {/* Login (Email ou CPF) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login *
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Email ou CPF"
            />
            <p className="text-xs text-gray-500 mt-1">
              Digite seu email ou CPF (apenas números)
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Site URL (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Site
            </label>
            <input
              type="url"
              name="siteUrl"
              value={formData.siteUrl}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adicionando...
                </div>
              ) : (
                'Adicionar Conta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
