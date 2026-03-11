import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />
      {/* Main content area - scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: '256px' }}>
        <Header />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {children}
          </div>
          <footer className="py-6 px-8 border-t border-slate-200 flex justify-between items-center bg-white mt-4">
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">
              © 2024 Cootranar - Sistema de Gestión Administrativa
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-[#0D3B8E] text-[10px] font-bold uppercase tracking-widest transition-colors">
                Soporte Técnico
              </a>
              <a href="#" className="text-slate-400 hover:text-[#0D3B8E] text-[10px] font-bold uppercase tracking-widest transition-colors">
                Documentación
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
