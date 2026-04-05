import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../../shared/constants';
import heroImg from '../../../assets/BusCootranar.jpg';
import logoImg from '../../../assets/LOGO-COOTRANAR-.png';
import gsap from 'gsap';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Refs para animaciones
  const logoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const eyeButtonRef = useRef<HTMLButtonElement>(null);
  const successOverlayRef = useRef<HTMLDivElement>(null);

  // Animación de entrada al montar el componente
  useEffect(() => {
    const tl = gsap.timeline();

    // Animar hero image (zoom in suave)
    if (heroRef.current) {
      tl.fromTo(
        heroRef.current,
        { scale: 1.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' },
        0
      );
    }

    // Animar logo (bounce desde arriba)
    if (logoRef.current) {
      tl.fromTo(
        logoRef.current,
        { y: -50, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
        0.3
      );
    }

    // Animar formulario (fade + slide desde abajo)
    if (formRef.current) {
      const formElements = formRef.current.querySelectorAll('.form-element');
      tl.fromTo(
        formElements,
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: 'power2.out' 
        },
        0.5
      );
    }
  }, []);

  // Animación de error (shake)
  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { x: -10, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.1, 
          repeat: 5, 
          yoyo: true,
          ease: 'power1.inOut'
        }
      );
    }
  }, [error]);

  // Toggle password visibility con animación
  const togglePasswordVisibility = () => {
    if (eyeButtonRef.current) {
      gsap.to(eyeButtonRef.current, {
        rotation: 360,
        duration: 0.4,
        ease: 'back.out(1.7)'
      });
    }
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Animación del botón al hacer click
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
    
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
      
      // Mostrar animación de éxito
      setLoginSuccess(true);
      
      // Timeline de animación de éxito
      const tl = gsap.timeline();
      
      // 1. Mostrar overlay con fade in
      if (successOverlayRef.current) {
        tl.fromTo(
          successOverlayRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );
        
        // 2. Animar el check icon
        const checkIcon = successOverlayRef.current.querySelector('.check-icon');
        if (checkIcon) {
          tl.fromTo(
            checkIcon,
            { scale: 0, rotation: -180 },
            { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' },
            '-=0.2'
          );
        }
        
        // 3. Fade out todo después de 1.5s
        tl.to(
          successOverlayRef.current,
          { opacity: 0, scale: 1.1, duration: 0.5, ease: 'power2.in' },
          '+=1'
        );
      }
      
      // Navegar después de la animación
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side: Hero Image Section */}
      <div ref={heroRef} className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
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
          <div ref={logoRef} className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <img 
                src={logoImg} 
                alt="Logo COOTRANAR" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <div className="form-element">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                Bienvenido de nuevo
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Ingresa tus credenciales para acceder a tu cuenta.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="form-element flex flex-col gap-1.5">
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
                  onFocus={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2 });
                  }}
                  onBlur={(e) => {
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-element flex flex-col gap-1.5">
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
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pr-12 text-sm focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 outline-none transition-all dark:text-white placeholder:text-slate-400"
                  style={{ paddingLeft: '3rem', paddingTop: '14px', paddingBottom: '14px' }}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2 });
                  }}
                  onBlur={(e) => {
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                  }}
                  required
                />
                <button
                  ref={eyeButtonRef}
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                  }}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="form-element flex items-center gap-2">
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
              <div ref={errorRef} className="form-element text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                {error}
              </div>
            )}

            <button
              ref={buttonRef}
              className="form-element w-full rounded-full bg-[#3b5bdb] text-sm font-bold text-white shadow-md shadow-[#3b5bdb]/25 transition-all hover:bg-[#364fc7] hover:shadow-lg hover:shadow-[#3b5bdb]/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              style={{ paddingTop: '14px', paddingBottom: '14px' }}
              type="submit"
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  gsap.to(e.currentTarget, { scale: 1.03, duration: 0.2, ease: 'back.out(1.7)' });
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="form-element text-center text-sm text-slate-500 dark:text-slate-400">
            ¿No tienes una cuenta?{' '}
            <a className="font-bold text-[#3b5bdb] hover:text-[#364fc7] hover:underline transition-colors" href="#">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>

      {/* Success Overlay */}
      {loginSuccess && (
        <div 
          ref={successOverlayRef}
          className="fixed inset-0 z-50"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 91, 219, 0.95) 0%, rgba(54, 79, 199, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '2rem'
          }}>
            {/* Logo Cootranar */}
            <div 
              className="check-icon"
              style={{
                width: '280px',
                maxWidth: '90%',
                marginBottom: '2rem',
                filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4))'
              }}
            >
              <img 
                src={logoImg} 
                alt="Logo COOTRANAR" 
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>
            
            {/* Success Text */}
            <h2 style={{ 
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              margin: '0 0 1rem 0'
            }}>
              ¡Bienvenido!
            </h2>
            <p style={{ 
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2rem',
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              margin: '0 0 2rem 0'
            }}>
              Iniciando sesión...
            </p>
            
            {/* Loading Dots */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '1rem',
                    height: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    animation: `bounce 1.4s infinite ease-in-out both`,
                    animationDelay: `${i * 0.16}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyframes for loading dots */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
          } 
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
