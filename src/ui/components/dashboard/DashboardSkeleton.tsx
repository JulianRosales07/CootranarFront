import React from 'react';
import { Skeleton } from 'boneyard-js/react';
import { useSidebar } from '../../context/SidebarContext';

const cardShadow = '0 1px 3px 0 rgba(0,0,0,0.02), 0 1px 2px -1px rgba(0,0,0,0.02)';

interface DashboardSkeletonProps {
  loading?: boolean;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ loading = true }) => {
  const { theme } = useSidebar();
  const isDark = theme === 'dark';

  const boneBg = isDark ? '#27272a' : '#f1f5f9';
  const cardBg = isDark ? '#141417' : '#ffffff';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e8edf2';

  return (
    <Skeleton name="dashboard-page" loading={loading} animate="shimmer">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', animation: 'fadeIn 0.2s ease-out' }}>
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ width: '160px', height: '24px', backgroundColor: boneBg, borderRadius: '6px', marginBottom: '6px' }} />
            <div style={{ width: '320px', height: '14px', backgroundColor: boneBg, borderRadius: '4px' }} />
          </div>
          <div style={{ width: '210px', height: '38px', backgroundColor: boneBg, borderRadius: '8px' }} />
        </div>

        {/* Filtros Skeleton */}
        <div style={{ background: cardBg, borderRadius: '12px', border: cardBorder, boxShadow: cardShadow, padding: '18px 22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <div style={{ width: '60px', height: '11px', backgroundColor: boneBg, borderRadius: '3px', marginBottom: '6px' }} />
              <div style={{ width: '100%', height: '36px', backgroundColor: boneBg, borderRadius: '8px' }} />
            </div>
            <div>
              <div style={{ width: '60px', height: '11px', backgroundColor: boneBg, borderRadius: '3px', marginBottom: '6px' }} />
              <div style={{ width: '100%', height: '36px', backgroundColor: boneBg, borderRadius: '8px' }} />
            </div>
            <div>
              <div style={{ width: '100px', height: '11px', backgroundColor: boneBg, borderRadius: '3px', marginBottom: '6px' }} />
              <div style={{ width: '100%', height: '36px', backgroundColor: boneBg, borderRadius: '8px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px' }}>
              <div style={{ width: '18px', height: '18px', backgroundColor: boneBg, borderRadius: '4px' }} />
              <div style={{ width: '140px', height: '13px', backgroundColor: boneBg, borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* KPI Cards Skeleton (3 Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: cardBg, borderRadius: '12px', border: cardBorder, boxShadow: cardShadow, padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '130px', height: '12px', backgroundColor: boneBg, borderRadius: '4px' }} />
                <div style={{ width: '22px', height: '22px', backgroundColor: boneBg, borderRadius: '6px' }} />
              </div>
              <div style={{ width: i === 1 ? '180px' : '100px', height: '32px', backgroundColor: boneBg, borderRadius: '8px', marginBottom: '16px' }} />
              <div style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f8fafc', paddingTop: '14px' }}>
                <div style={{ width: '150px', height: '12px', backgroundColor: boneBg, borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico Skeleton */}
        <div style={{ background: cardBg, borderRadius: '12px', border: cardBorder, boxShadow: cardShadow, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ width: '200px', height: '18px', backgroundColor: boneBg, borderRadius: '6px', marginBottom: '6px' }} />
              <div style={{ width: '250px', height: '12px', backgroundColor: boneBg, borderRadius: '4px' }} />
            </div>
            <div style={{ width: '120px', height: '16px', backgroundColor: boneBg, borderRadius: '10px' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', padding: '0 10px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
            {[40, 65, 80, 45, 90, 70, 85, 60, 95, 50, 75, 85, 60, 40].map((heightPct, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${heightPct}%`,
                  backgroundColor: boneBg,
                  borderRadius: '4px 4px 0 0',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 8px' }}>
            <div style={{ width: '80px', height: '10px', backgroundColor: boneBg, borderRadius: '3px' }} />
            <div style={{ width: '80px', height: '10px', backgroundColor: boneBg, borderRadius: '3px' }} />
          </div>
        </div>

        {/* Tabla Ventas por Oficina Skeleton */}
        <div style={{ background: cardBg, borderRadius: '12px', border: cardBorder, boxShadow: cardShadow, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ width: '220px', height: '16px', backgroundColor: boneBg, borderRadius: '5px', marginBottom: '4px' }} />
              <div style={{ width: '180px', height: '11px', backgroundColor: boneBg, borderRadius: '3px' }} />
            </div>
            <div style={{ width: '110px', height: '26px', backgroundColor: boneBg, borderRadius: '6px' }} />
          </div>

          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3, 4].map((row) => (
              <div key={row} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ width: '22%', height: '14px', backgroundColor: boneBg, borderRadius: '4px' }} />
                <div style={{ width: '18%', height: '14px', backgroundColor: boneBg, borderRadius: '4px' }} />
                <div style={{ width: '15%', height: '14px', backgroundColor: boneBg, borderRadius: '4px' }} />
                <div style={{ width: '15%', height: '14px', backgroundColor: boneBg, borderRadius: '4px' }} />
                <div style={{ width: '20%', height: '14px', backgroundColor: boneBg, borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Skeleton>
  );
};
