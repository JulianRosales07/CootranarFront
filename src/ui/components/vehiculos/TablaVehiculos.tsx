import { useState } from 'react';
import { vehiculosApi } from '../../services/vehiculosApi';
import ModalEditarVehiculo from './ModalEditarVehiculo';

export default function TablaVehiculos({ vehiculos, paginacion, onCambiarPagina, onToggleEstado, onVerDetalle, cargando }: any) {
  const [procesando, setProcesando] = useState<number | null>(null);
  const [vehiculoEditar, setVehiculoEditar] = useState<any>(null);

  const handleToggleEstado = async (vehiculo: any) => {
    if (window.confirm(`¿Está seguro de ${vehiculo.activo ? 'desactivar' : 'activar'} este vehículo?`)) {
      setProcesando(vehiculo.idvehiculo);
      try {
        if (vehiculo.activo) {
          await vehiculosApi.desactivar(vehiculo.idvehiculo);
        } else {
          await vehiculosApi.activar(vehiculo.idvehiculo);
        }
        onToggleEstado();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error al cambiar estado');
      } finally {
        setProcesando(null);
      }
    }
  };

  if (cargando) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D3B8E]"></div>
        <p className="mt-4 text-gray-500">Cargando vehículos...</p>
      </div>
    );
  }

  if (!vehiculos || vehiculos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <span className="material-symbols-outlined text-gray-300 text-[64px]">directions_bus</span>
        <p className="mt-4 text-gray-500">No se encontraron vehículos</p>
      </div>
    );
  }

  return (
    <>
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-lg">Flota de Vehículos</h3>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span>Filtrar</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Exportar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 tracking-wider">Nº Móvil</th>
                <th className="px-6 py-4 tracking-wider">Placa</th>
                <th className="px-6 py-4 tracking-wider">Tipo Servicio</th>
                <th className="px-6 py-4 tracking-wider">Tipo Bus</th>
                <th className="px-6 py-4 tracking-wider">Modelo</th>
                <th className="px-6 py-4 tracking-wider">Capacidad</th>
                <th className="px-6 py-4 tracking-wider text-center">Pisos</th>
                <th className="px-6 py-4 tracking-wider">Propietario</th>
                <th className="px-6 py-4 tracking-wider text-center">Estado</th>
                <th className="px-6 py-4 tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehiculos.map((vehiculo: any) => (
                <tr key={vehiculo.idvehiculo} className="hover:bg-gray-50 transition-colors h-16">
                  <td className="px-6 py-3 font-bold text-gray-800">{vehiculo.numeromovil}</td>
                  <td className="px-6 py-3 font-mono text-gray-600">{vehiculo.placa}</td>
                  <td className="px-6 py-3">{vehiculo.nombretiposervicio || '-'}</td>
                  <td className="px-6 py-3">{vehiculo.nombretipobus || '-'}</td>
                  <td className="px-6 py-3">{vehiculo.anio || '-'}</td>
                  <td className="px-6 py-3">{vehiculo.capacidad}</td>
                  <td className="px-6 py-3 text-center">{vehiculo.cantidadpisos}</td>
                  <td className="px-6 py-3">
                    {vehiculo.nombrepropietario && vehiculo.apellidopropietario
                      ? `${vehiculo.nombrepropietario} ${vehiculo.apellidopropietario}`
                      : '-'}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vehiculo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {vehiculo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleEstado(vehiculo)}
                        disabled={procesando === vehiculo.idvehiculo}
                        className={`p-1 rounded transition-colors ${
                          vehiculo.activo
                            ? 'text-red-500 hover:text-red-700'
                            : 'text-green-500 hover:text-green-700'
                        } disabled:opacity-50`}
                        title={vehiculo.activo ? 'Desactivar' : 'Activar'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {vehiculo.activo ? 'block' : 'check_circle'}
                        </span>
                      </button>
                      <button
                        onClick={() => setVehiculoEditar(vehiculo)}
                        className="text-amber-500 hover:text-amber-700 p-1 rounded transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => onVerDetalle && onVerDetalle(vehiculo)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginacion && (
          <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-sm text-gray-500">
              Mostrando <span className="font-medium text-gray-800">{((paginacion.paginaActual - 1) * paginacion.porPagina) + 1}</span> a{' '}
              <span className="font-medium text-gray-800">
                {paginacion.total > 0 ? Math.min(paginacion.paginaActual * paginacion.porPagina, paginacion.total) : 0}
              </span> de{' '}
              <span className="font-medium text-gray-800">{paginacion.total}</span> vehículos
            </p>
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => onCambiarPagina(paginacion.paginaActual - 1)}
                disabled={paginacion.paginaActual === 1}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              {[...Array(paginacion.totalPaginas)].map((_, i) => {
                const pagina = i + 1;
                if (
                  pagina === 1 ||
                  pagina === paginacion.totalPaginas ||
                  (pagina >= paginacion.paginaActual - 1 && pagina <= paginacion.paginaActual + 1)
                ) {
                  return (
                    <button
                      key={pagina}
                      onClick={() => onCambiarPagina(pagina)}
                      className={`h-8 w-8 text-sm font-medium rounded-md flex items-center justify-center transition-colors ${
                        pagina === paginacion.paginaActual
                          ? 'bg-[#0D3B8E] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pagina}
                    </button>
                  );
                } else if (pagina === paginacion.paginaActual - 2 || pagina === paginacion.paginaActual + 2) {
                  return <span key={pagina} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
              <button
                onClick={() => onCambiarPagina(paginacion.paginaActual + 1)}
                disabled={paginacion.paginaActual === paginacion.totalPaginas}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </nav>
          </div>
        )}
      </section>

      <ModalEditarVehiculo
        vehiculo={vehiculoEditar}
        onCerrar={() => setVehiculoEditar(null)}
        onActualizado={() => { setVehiculoEditar(null); onToggleEstado(); }}
      />
    </>
  );
}
