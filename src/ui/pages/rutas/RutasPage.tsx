import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Badge } from '../../components/common/Badge';

export const RutasPage = () => {
  const [modoTarifa, setModoTarifa] = useState<'normal' | 'alto'>('normal');

  // Datos mock para las rutas
  const rutasMock = [
    {
      codigo: '#R-2023-001',
      agenciaOrigen: 'Terminal Pasto',
      agenciaDestino: 'Terminal Cali',
      duracion: '8h 30m',
      distancia: '384 km',
      estado: 'Activo',
    },
    {
      codigo: '#R-2023-002',
      agenciaOrigen: 'Terminal Ipiales',
      agenciaDestino: 'Terminal Pasto',
      duracion: '2h 15m',
      distancia: '90 km',
      estado: 'Activo',
    },
    {
      codigo: '#R-2023-003',
      agenciaOrigen: 'Terminal Bogotá',
      agenciaDestino: 'Terminal Pasto',
      duracion: '18h 00m',
      distancia: '850 km',
      estado: 'Inactivo',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header con Modo de Tarifas */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Rutas</h1>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
              Inicio &gt; Operaciones &gt; Rutas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Modo Global de Tarifas:
              </span>
              <button
                onClick={() => setModoTarifa('normal')}
                className={`px-4 py-2 text-xs font-bold rounded transition-colors ${
                  modoTarifa === 'normal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tráfico Normal
              </button>
              <button
                onClick={() => setModoTarifa('alto')}
                className={`px-4 py-2 text-xs font-bold rounded transition-colors ${
                  modoTarifa === 'alto'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tráfico Alto
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded transition-colors relative">
                <span className="material-symbols-outlined text-slate-600">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-100 rounded transition-colors">
                <span className="material-symbols-outlined text-slate-600">settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Formulario Añadir Nueva Ruta */}
        <div className="bg-white rounded border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-blue-600">add_road</span>
            <h2 className="text-lg font-bold text-slate-800">Añadir Nueva Ruta</h2>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Agencia Origen */}
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Agencia Origen <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Seleccionar Agencia...</option>
                <option>Terminal Pasto</option>
                <option>Terminal Ipiales</option>
                <option>Terminal Tumaco</option>
                <option>Terminal Cali</option>
              </select>
            </div>

            {/* Agencia Destino */}
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Agencia Destino <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Seleccionar Agencia...</option>
                <option>Terminal Pasto</option>
                <option>Terminal Cali</option>
                <option>Terminal Bogotá</option>
                <option>Terminal Popayán</option>
              </select>
            </div>

            {/* Duración Aproximada */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Duración Aproximada <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: 4h 30m"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                </button>
              </div>
            </div>

            {/* Distancia en km */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Distancia en km <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: 120"
                  className="w-full pl-8 pr-12 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  Ej:
                </span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                  km
                </span>
              </div>
            </div>

            {/* Vía / Observaciones */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Vía / Observaciones <span className="text-slate-400 text-[10px]">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Vía Panamericana"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">save</span>
              Guardar Ruta
            </button>
          </div>
        </div>

        {/* Listado de Rutas */}
        <div className="bg-white rounded border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">list</span>
              <h2 className="text-base font-bold text-slate-800">Listado de Rutas</h2>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">filter_alt</span>
                Filtrar
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">download</span>
                Exportar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left">Código Ruta</th>
                  <th className="px-6 py-3 text-left">Agencia Origen</th>
                  <th className="px-6 py-3 text-left">Agencia Destino</th>
                  <th className="px-6 py-3 text-center">Duración</th>
                  <th className="px-6 py-3 text-center">Distancia</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rutasMock.map((ruta, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-700 font-semibold">{ruta.codigo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{ruta.agenciaOrigen}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{ruta.agenciaDestino}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-slate-600">{ruta.duracion}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-slate-600">{ruta.distancia}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={ruta.estado === 'Activo' ? 'success' : 'danger'}>
                        {ruta.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          Administrar Tarifas
                        </button>
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500">Mostrando 1 a 3 de 12 rutas</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-semibold text-slate-400 border border-slate-200 rounded hover:bg-white transition-colors">
                Anterior
              </button>
              <button className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 border border-blue-600 rounded">
                1
              </button>
              <button className="px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200 rounded hover:bg-white transition-colors">
                2
              </button>
              <button className="px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200 rounded hover:bg-white transition-colors">
                ...
              </button>
              <button className="px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200 rounded hover:bg-white transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
