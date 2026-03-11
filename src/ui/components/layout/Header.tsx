import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-lg font-bold text-slate-800">Reportes Administrativos</h1>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dashboard de Ventas Consolidado</p>
      </div>
      <div className="flex items-center gap-6">
        {/* Buscador */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0D3B8E]/20 focus:border-[#0D3B8E]/30 w-56 transition-all"
            placeholder="Buscar..."
            type="text"
          />
        </div>
        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button className="size-9 flex items-center justify-center rounded hover:bg-slate-50 text-slate-500 relative transition-colors">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2.5 right-2.5 size-1.5 bg-red-500 rounded-full"></span>
          </button>
          <button className="size-9 flex items-center justify-center rounded hover:bg-slate-50 text-slate-500 transition-colors">
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
