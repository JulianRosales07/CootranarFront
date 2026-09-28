import React, { useState, useMemo } from 'react';
import type { EcommerceAnalyticsResponse, EcommerceTransaccionDetalle } from '../../../application/dto/ReporteDTO';
import { formatPeso, formatNumero, formatFechaHora, exportarExcel } from '../../../shared/utils/reporteFormat';
import type { ColumnaExport } from '../../../shared/utils/reporteFormat';


interface DashboardEcommerceViewProps {
  data: EcommerceAnalyticsResponse | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

const BLUE = '#0D3B8E';
const BLUE_LIGHT = '#eff6ff';
const GREEN = '#16a34a';
const GREEN_BG = '#f0fdf4';
const AMBER = '#d97706';
const AMBER_BG = '#fffbeb';
const cardShadow = '0 1px 3px 0 rgba(0,0,0,0.02), 0 1px 2px -1px rgba(0,0,0,0.02)';

export const DashboardEcommerceView: React.FC<DashboardEcommerceViewProps> = ({
  data,
  isLoading,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'APROBADO' | 'PENDIENTE'>('TODOS');

  const kpis = data?.kpis;
  const funnel = data?.funnel;
  const comp = data?.comparativaCanales;
  const evaluacion = data?.evaluacion;
  const topRutas = data?.topRutas ?? [];
  const horas = data?.horasInteraccion ?? [];
  const transacciones = data?.transacciones ?? [];
  const fidelizacion = data?.fidelizacion;

  // Filtrado de transacciones
  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter((t) => {
      const coincideEstado = filtroEstado === 'TODOS' || t.estado === filtroEstado;
      const q = busqueda.toLowerCase().trim();
      const coincideTexto =
        !q ||
        t.referencia?.toLowerCase().includes(q) ||
        t.nombrecliente?.toLowerCase().includes(q) ||
        t.correocliente?.toLowerCase().includes(q) ||
        t.origennombre?.toLowerCase().includes(q) ||
        t.destinonombre?.toLowerCase().includes(q) ||
        t.pasajeros?.toLowerCase().includes(q);
      return coincideEstado && coincideTexto;
    });
  }, [transacciones, busqueda, filtroEstado]);

  // Exportar detalle ecommerce a Excel
  const handleExportarExcel = () => {
    const columnas: ColumnaExport<EcommerceTransaccionDetalle>[] = [
      { key: 'referencia', label: 'Referencia Wompi' },
      { key: 'fechacreacion', label: 'Fecha y Hora' },
      { key: 'nombrecliente', label: 'Cliente Comprador' },
      { key: 'correocliente', label: 'Correo' },
      { key: 'origennombre', label: 'Origen' },
      { key: 'destinonombre', label: 'Destino' },
      { key: 'nombreruta', label: 'Ruta' },
      { key: 'cantidadasientos', label: 'Asientos', numero: true },
      { key: 'pasajeros', label: 'Pasajeros' },
      { key: 'monto', label: 'Monto Total', moneda: true },
      { key: 'estado', label: 'Estado' },
    ];

    exportarExcel(
      `interacciones-ecommerce-${data?.filtrosAplicados?.fechaDesde || 'inicio'}-a-${data?.filtrosAplicados?.fechaHasta || 'hoy'}`,
      columnas,
      transaccionesFiltradas,
      {
        nombreHoja: 'Interacciones E-commerce',
        hojasExtra: [
          {
            nombre: 'Resumen Ejecutivo',
            filas: [
              ['Canal', 'Plataforma E-commerce Cootranar'],
              ['Periodo', `${data?.filtrosAplicados?.fechaDesde || 'Inicio'} a ${data?.filtrosAplicados?.fechaHasta || 'Hoy'}`],
              ['Total Ventas Online', kpis?.total_ingresos ?? 0],
              ['Tiquetes Vendidos Online', kpis?.tiquetes_vendidos ?? 0],
              ['Ticket Promedio', kpis?.promedio_tiquete ?? 0],
              ['Total Intentos Checkout', funnel?.total_intentos ?? 0],
              ['Checkouts Aprobados', funnel?.aprobados ?? 0],
              ['Tasa de Conversión Checkout', `${funnel?.tasaConversion ?? 0}%`],
              ['Cuota de Volumen Digital', `${comp?.penetracionVolumen ?? 0}%`],
              ['Clientes Registrados Plataforma', fidelizacion?.total_clientes_registrados ?? 0],
              ['Generado el', new Date().toLocaleString('es-CO')],
            ],
          },
        ],
      }
    );
  };

  // Máximo para el gráfico de horas
  const maxHora = useMemo(() => {
    return Math.max(...horas.map((h) => h.total_interacciones), 1);
  }, [horas]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '12px 0' }}>
        <div style={{ height: '140px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: '110px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Banner de Diagnóstico "¿Está dando buenos resultados?" ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px -3px rgba(0,0,0,0.04)',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                background: evaluacion?.color === GREEN ? GREEN_BG : evaluacion?.color === AMBER ? AMBER_BG : '#f1f5f9',
                color: evaluacion?.color || BLUE,
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                {evaluacion?.estado === 'POSITIVO' ? 'trending_up' : 'insights'}
              </span>
              {evaluacion?.badge || 'Rendimiento Digital'}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>• Análisis de efectividad y flujo comercial</span>
          </div>

          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Resultados de la Plataforma E-commerce
          </h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            {evaluacion?.mensaje}
          </p>
        </div>

        {/* Indicadores rápidos de impacto */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'white',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid #e8edf2',
            boxShadow: cardShadow,
          }}
        >
          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>
              Cuota de Ventas
            </p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: BLUE, margin: '4px 0 0 0' }}>
              {comp?.penetracionVolumen ?? 0}%
            </p>
            <span style={{ fontSize: '10px', color: '#64748b' }}>del total de tiquetes</span>
          </div>

          <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />

          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>
              Conversión Wompi
            </p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: GREEN, margin: '4px 0 0 0' }}>
              {funnel?.tasaConversion ?? 0}%
            </p>
            <span style={{ fontSize: '10px', color: '#64748b' }}>efectividad en checkout</span>
          </div>

          <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />

          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>
              Clientes Web
            </p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
              {fidelizacion?.total_clientes_registrados ?? 0}
            </p>
            <span style={{ fontSize: '10px', color: '#64748b' }}>registrados</span>
          </div>
        </div>
      </div>

      {/* ── 2. Tarjetas KPI de E-commerce ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        {/* KPI 1: Ingresos E-commerce */}
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
              Recaudación E-commerce
            </p>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#3b82f6' }}>shopping_cart</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {formatPeso(kpis?.total_ingresos)}
            </h3>
            <span style={{ fontSize: '11px', fontWeight: 700, color: BLUE }}>COP</span>
          </div>
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f8fafc', fontSize: '12px', color: '#64748b' }}>
            Ticket promedio: <strong style={{ color: '#0f172a' }}>{formatPeso(kpis?.promedio_tiquete)}</strong>
          </div>
        </div>

        {/* KPI 2: Tiquetes Vendidos */}
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
              Tiquetes Online
            </p>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#10b981' }}>confirmation_number</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {formatNumero(kpis?.tiquetes_vendidos)}
            </h3>
            <span style={{ fontSize: '11px', fontWeight: 700, color: GREEN }}>PASAJES</span>
          </div>
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f8fafc', fontSize: '12px', color: '#64748b' }}>
            Emitidos en <strong style={{ color: '#0f172a' }}>{kpis?.viajes_con_ventas ?? 0} viajes</strong> distintos
          </div>
        </div>

        {/* KPI 3: Checkouts y Tasa de Conversión */}
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
              Checkouts Aprobados
            </p>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#8b5cf6' }}>point_of_sale</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {formatNumero(funnel?.aprobados)}
            </h3>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed' }}>
              / {formatNumero(funnel?.total_intentos)} INTENTOS
            </span>
          </div>
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f8fafc', fontSize: '12px', color: '#64748b' }}>
            Tasa de éxito: <strong style={{ color: GREEN }}>{funnel?.tasaConversion ?? 0}%</strong>
          </div>
        </div>

        {/* KPI 4: Fidelización Millas en E-commerce */}
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
              Fidelización y Millas
            </p>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#f59e0b' }}>loyalty</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {formatNumero(fidelizacion?.total_millas_redimidas)}
            </h3>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706' }}>MILLAS</span>
          </div>
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f8fafc', fontSize: '12px', color: '#64748b' }}>
            Redimidas en <strong style={{ color: '#0f172a' }}>{fidelizacion?.total_canjes ?? 0} cupones</strong>
          </div>
        </div>
      </div>

      {/* ── 3. Embudo de Conversión (Funnel de Compra del Cliente) ── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Embudo de Interacción y Flujo de Compra (Conversion Funnel)
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
              Paso a paso desde que el cliente inicia el pago en la pasarela Wompi hasta la emisión del tiquete
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Monto intentado: <strong>{formatPeso(funnel?.monto_total_intentado)}</strong>
            </span>
          </div>
        </div>

        {/* Pasos del embudo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', position: 'relative' }}>
          {/* Paso 1: Checkouts Iniciados */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>shopping_bag</span>
              Paso 1: Checkouts Iniciados
            </div>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '12px 0 4px 0' }}>
              {formatNumero(funnel?.total_intentos)}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              100% de sesiones que abrieron la pasarela de pago
            </p>
            <div style={{ marginTop: '12px', height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: '#64748b' }} />
            </div>
          </div>

          {/* Paso 2: Pagos Aprobados */}
          <div
            style={{
              background: GREEN_BG,
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: GREEN, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
              Paso 2: Pagos Aprobados
            </div>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#14532d', margin: '12px 0 4px 0' }}>
              {formatNumero(funnel?.aprobados)}
            </p>
            <p style={{ fontSize: '12px', color: '#166534', margin: 0 }}>
              {funnel?.tasaConversion ?? 0}% convirtieron con éxito ({formatPeso(funnel?.monto_aprobado)})
            </p>
            <div style={{ marginTop: '12px', height: '6px', width: '100%', background: '#bbf7d0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(funnel?.tasaConversion ?? 0, 100)}%`, background: GREEN }} />
            </div>
          </div>

          {/* Paso 3: Tiquetes Emitidos */}
          <div
            style={{
              background: BLUE_LIGHT,
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: BLUE, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>airplane_ticket</span>
              Paso 3: Tiquetes Generados
            </div>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', margin: '12px 0 4px 0' }}>
              {formatNumero(kpis?.tiquetes_vendidos)}
            </p>
            <p style={{ fontSize: '12px', color: '#1e40af', margin: 0 }}>
              Pasajes emitidos a {kpis?.clientes_compradores ?? 0} usuarios compradores
            </p>
            <div style={{ marginTop: '12px', height: '6px', width: '100%', background: '#bfdbfe', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: BLUE }} />
            </div>
          </div>

          {/* Paso 4 / Abandono: Pendientes / No culminados */}
          <div
            style={{
              background: AMBER_BG,
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: AMBER, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pending_actions</span>
              Pendientes / Abandonados
            </div>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#78350f', margin: '12px 0 4px 0' }}>
              {formatNumero(funnel?.pendientes)}
            </p>
            <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
              {funnel?.tasaAbandono ?? 0}% de intenciones sin completar en pasarela
            </p>
            <div style={{ marginTop: '12px', height: '6px', width: '100%', background: '#fde68a', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(funnel?.tasaAbandono ?? 0, 100)}%`, background: AMBER }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Comparativa de Canales y Horarios de Interacción ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Comparativa E-commerce vs Taquilla */}
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, padding: '24px 28px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Comparativa de Canales: Online vs Taquilla
          </h4>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', marginBottom: '20px' }}>
            Participación de la plataforma digital frente a la venta presencial
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Barra de Tiquetes */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Volumen de Tiquetes</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>
                  E-commerce {comp?.penetracionVolumen ?? 0}% vs Taquilla {Math.max(0, 100 - (comp?.penetracionVolumen ?? 0))}%
                </span>
              </div>
              <div style={{ height: '14px', width: '100%', background: '#f1f5f9', borderRadius: '7px', display: 'flex', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${comp?.penetracionVolumen ?? 0}%`,
                    background: BLUE,
                    transition: 'width 0.4s ease',
                  }}
                  title={`E-commerce: ${comp?.penetracionVolumen ?? 0}%`}
                />
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(0, 100 - (comp?.penetracionVolumen ?? 0))}%`,
                    background: '#cbd5e1',
                  }}
                  title={`Taquilla: ${Math.max(0, 100 - (comp?.penetracionVolumen ?? 0))}%`}
                />
              </div>
            </div>

            {/* Barra de Ingresos */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Recaudo en Pesos (COP)</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>
                  E-commerce {comp?.penetracionIngresos ?? 0}% vs Taquilla {Math.max(0, 100 - (comp?.penetracionIngresos ?? 0))}%
                </span>
              </div>
              <div style={{ height: '14px', width: '100%', background: '#f1f5f9', borderRadius: '7px', display: 'flex', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${comp?.penetracionIngresos ?? 0}%`,
                    background: GREEN,
                    transition: 'width 0.4s ease',
                  }}
                  title={`E-commerce: ${comp?.penetracionIngresos ?? 0}%`}
                />
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(0, 100 - (comp?.penetracionIngresos ?? 0))}%`,
                    background: '#cbd5e1',
                  }}
                  title={`Taquilla: ${Math.max(0, 100 - (comp?.penetracionIngresos ?? 0))}%`}
                />
              </div>
            </div>

            {/* Leyenda y detalles */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: BLUE, display: 'inline-block' }} />
                <span>E-commerce: <strong>{formatNumero(kpis?.tiquetes_vendidos)} tiquetes</strong> ({formatPeso(kpis?.total_ingresos)})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#cbd5e1', display: 'inline-block' }} />
                <span>Taquillas Físicas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hábitos de Interacción: Horas de mayor actividad */}
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Horas de Mayor Interacción en la Web
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                Momento del día con más sesiones e intenciones de compra
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: BLUE, background: BLUE_LIGHT, padding: '3px 8px', borderRadius: '4px' }}>
              00h - 23h
            </span>
          </div>

          {horas.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No hay interacciones registradas en el periodo.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '4px', paddingTop: '10px' }}>
              {Array.from({ length: 24 }).map((_, h) => {
                const registro = horas.find((item) => item.hora === h);
                const valor = registro?.total_interacciones || 0;
                const exitosas = registro?.compras_exitosas || 0;
                const pct = maxHora > 0 ? (valor / maxHora) * 100 : 0;

                return (
                  <div
                    key={h}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
                    title={`${h}:00 hrs: ${valor} interacciones (${exitosas} compras)`}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(pct, valor > 0 ? 8 : 2)}%`,
                        background: exitosas > 0 ? BLUE : '#cbd5e1',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    {h % 4 === 0 && (
                      <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>
                        {h}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Top Rutas Más Vendidas por la Web ── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Top Rutas Más Compradas en E-commerce
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Destinos con mayor preferencia por clientes online
            </p>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
            {topRutas.length} destinos demandados
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '12px 24px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'left' }}>Trayecto (Origen ➔ Destino)</th>
                <th style={{ padding: '12px 24px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Tiquetes Vendidos</th>
                <th style={{ padding: '12px 24px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Ticket Promedio</th>
                <th style={{ padding: '12px 24px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Total Facturado Online</th>
              </tr>
            </thead>
            <tbody>
              {topRutas.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No hay ventas registradas en el periodo consultado.
                  </td>
                </tr>
              ) : (
                topRutas.map((r, i) => (
                  <tr
                    key={`${r.origen}-${r.destino}-${i}`}
                    style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                      <span style={{ color: BLUE }}>{r.origen}</span>
                      <span style={{ margin: '0 8px', color: '#94a3b8' }}>➔</span>
                      <span>{r.destino}</span>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'center', fontSize: '13.5px', fontWeight: 700, color: '#334155' }}>
                      <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: '12px' }}>
                        {formatNumero(r.tiquetes)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>
                      {formatPeso(r.promediotiquete)}
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      {formatPeso(r.totalingresos)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. Detalle de Transacciones e Interacciones Recientes ── */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Flujo de Transacciones y Compras en E-commerce
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Registro de sesiones y pedidos generados desde la tienda online
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Buscador */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cliente, referencia o ruta..."
                style={{
                  padding: '7px 12px 7px 32px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  outline: 'none',
                  width: '240px',
                }}
              />
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '7px', fontSize: '17px', color: '#94a3b8' }}>
                search
              </span>
            </div>

            {/* Filtro estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              style={{
                padding: '7px 10px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                color: '#334155',
                outline: 'none',
              }}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="APROBADO">Solo Aprobados</option>
              <option value="PENDIENTE">Solo Pendientes</option>
            </select>

            {/* Botón Excel */}
            {transaccionesFiltradas.length > 0 && (
              <button
                onClick={handleExportarExcel}
                style={{
                  color: BLUE,
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Exportar Excel
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '12px 20px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'left' }}>Referencia Wompi</th>
                <th style={{ padding: '12px 20px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'left' }}>Fecha y Hora</th>
                <th style={{ padding: '12px 20px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'left' }}>Cliente / Pasajeros</th>
                <th style={{ padding: '12px 20px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'left' }}>Trayecto</th>
                <th style={{ padding: '12px 20px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Asientos</th>
                <th style={{ padding: '12px 20px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
                <th style={{ padding: '12px 20px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {transaccionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No se encontraron transacciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                transaccionesFiltradas.map((t) => (
                  <tr
                    key={t.idpagowompi}
                    style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '12.5px', fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>
                      {t.referencia}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12px', color: '#64748b' }}>
                      {formatFechaHora(t.fechacreacion)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                        {t.nombrecliente}
                      </p>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {t.correocliente || t.pasajeros}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12.5px', color: '#334155' }}>
                      <strong>{t.origennombre}</strong>
                      <span style={{ margin: '0 6px', color: '#94a3b8' }}>➔</span>
                      <strong>{t.destinonombre}</strong>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                      {t.cantidadasientos || 1}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                      {formatPeso(t.monto)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '6px',
                          padding: '4px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: t.estado === 'APROBADO' ? GREEN_BG : AMBER_BG,
                          color: t.estado === 'APROBADO' ? GREEN : AMBER,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          {t.estado === 'APROBADO' ? 'check_circle' : 'hourglass_top'}
                        </span>
                        {t.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
