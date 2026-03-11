import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../../shared/constants';
import heroImg from '../../../assets/BusCootranar.jpg';
import logoImg from '../../../assets/LOGO-COOTRANAR-.png';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación básica
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un correo válido');
      setLoading(false);
      return;
    }

    try {
      console.log('Intentando login con:', email);
      await login(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side: Hero Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroImg}
          alt="Bus Cootranar en carretera de Nariño"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16 w-full">
          <div className="max-w-lg">
            <h1
              className="text-5xl font-extrabold text-white leading-tight mb-4"
              style={{ textShadow: '2px 3px 10px rgba(0,0,0,0.7)' }}
            >
              Viaja con seguridad por Nariño
            </h1>
            <p
              className="text-white/90 text-base leading-relaxed"
              style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.7)' }}
            >
              Conectamos los paisajes más hermosos del sur de Colombia con la comodidad que mereces.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white dark:bg-slate-900">
        <div className="w-full max-w-lg flex flex-col gap-7">
          {/* Logo & Heading */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <img 
                src={logoImg} 
                alt="Logo COOTRANAR" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                Bienvenido de nuevo
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Ingresa tus credenciales para acceder a tu cuenta.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                  mail
                </span>
                <input
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pr-4 text-sm focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 outline-none transition-all dark:text-white placeholder:text-slate-400"
                  style={{ paddingLeft: '3rem', paddingTop: '14px', paddingBottom: '14px' }}
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                  Contraseña
                </label>
                <a className="text-xs font-semibold text-[#3b5bdb] hover:text-[#364fc7] hover:underline transition-colors" href="#">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                  lock
                </span>
                <input
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pr-4 text-sm focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 outline-none transition-all dark:text-white placeholder:text-slate-400"
                  style={{ paddingLeft: '3rem', paddingTop: '14px', paddingBottom: '14px' }}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="h-4 w-4 rounded border-slate-300 text-[#3b5bdb] focus:ring-[#3b5bdb] cursor-pointer accent-[#3b5bdb]"
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none" htmlFor="remember">
                Recordar sesión
              </label>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                {error}
              </div>
            )}

            <button
              className="w-full rounded-full bg-[#3b5bdb] text-sm font-bold text-white shadow-md shadow-[#3b5bdb]/25 transition-all hover:bg-[#364fc7] hover:shadow-lg hover:shadow-[#3b5bdb]/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ paddingTop: '14px', paddingBottom: '14px' }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            ¿No tienes una cuenta?{' '}
            <a className="font-bold text-[#3b5bdb] hover:text-[#364fc7] hover:underline transition-colors" href="#">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
