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

  const cardBg = isDark ? '#141417' : '#ffffff';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e8edf2';
  const shimmerGradient = isDark
    ? 'linear-gradient(90deg, #27272a 0%, #3f3f46 50%, #27272a 100%)'
    : 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)';

  const boneStyle: React.CSSProperties = {
    background: shimmerGradient,
    backgroundSize: '200% 100%',
    animation: 'boneyardShimmer 1.5s infinite ease-in-out',
  };

  const SkeletonContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Inject custom keyframe */}
      <style>{`
        @keyframes boneyardShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ ...boneStyle, width: '160px', height: '24px', borderRadius: '6px', marginBottom: '8px' }} />
          <div style={{ ...boneStyle, width: '340px', height: '14px', borderRadius: '4px' }} />
        </div>
        <div style={{ ...boneStyle, width: '220px', height: '40px', borderRadius: '8px' }} />
      </div>

      {/* Filtros Skeleton */}
      <div style={{ background: cardBg, borderRadius: '12px', border: cardBorder, boxShadow: cardShadow, padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <div style={{ ...boneStyle, width: '50px', height: '11px', borderRadius: '3px', marginBottom: '8px' }} />
            <div style={{ ...boneStyle, width: '100%', height: '38px', borderRadius: '8px' }} />
          </div>
          <div>
            <div style={{ ...boneStyle, width: '50px', height: '11px', borderRadius: '3px', marginBottom: '8px' }} />
            <div style={{ ...boneStyle, width: '100%', height: '38px', borderRadius: '8px' }} />
          </div>
          <div>
            <div style={{ ...boneStyle, width: '90px', height: '11px', borderRadius: '3px', marginBottom: '8px' }} />
            <div style={{ ...boneStyle, width: '100%', height: '38px', borderRadius: '8px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}>
            <div style={{ ...boneStyle, width: '18px', height: '18px', borderRadius: '4px' }} />
            <div style={{ ...boneStyle, width: '150px', height: '14px', borderRadius: '4px' }} />
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton (3 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ background: cardBg, borderRadius: '12px', border: cardBorder, boxShadow: cardShadow, padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ ...boneStyle, width: '130px', height: '12px', borderRadius: '4px' }} />
              <div style={{ ...boneStyle, width: '22px', height: '22px', borderRadius: '6px' }} />
            </div>
            <div style={{ ...boneStyle, width: i === 1 ? '180px' : '100px', height: '32px', borderRadius: '8px', marginBottom: '16px' }} />
            <div style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f8fafc', paddingTop: '14px' }}>
              <div style={{ ...boneStyle, width: '150px', height: '12px', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico Skeleton */}
      <div style={{ background: cardBg, borderRadius: '12px', border: cardBorder, boxShadow: cardShadow, padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ ...boneStyle, width: '200px', height: '18px', borderRadius: '6px', marginBottom: '6px' }} />
            <div style={{ ...boneStyle, width: '250px', height: '12px', borderRadius: '4px' }} />
          </div>
          <div style={{ ...boneStyle, width: '120px', height: '16px', borderRadius: '10px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', padding: '0 10px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
          {[40, 65, 80, 45, 90, 70, 85, 60, 95, 50, 75, 85, 60, 40].map((heightPct, idx) => (
            <div
              key={idx}
              style={{
                ...boneStyle,
                flex: 1,
                height: `${heightPct}%`,
                borderRadius: '4px 4px 0 0',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 8px' }}>
          <div style={{ ...boneStyle, width: '80px', height: '10px', borderRadius: '3px' }} />
          <div style={{ ...boneStyle, width: '80px', height: '10px', borderRadius: '3px' }} />
        </div>
      </div>

      {/* Tabla Ventas por Oficina Skeleton */}
      <div style={{ background: cardBg, borderRadius: '12px', border: cardBorder, boxShadow: cardShadow, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ ...boneStyle, width: '220px', height: '16px', borderRadius: '5px', marginBottom: '4px' }} />
            <div style={{ ...boneStyle, width: '180px', height: '11px', borderRadius: '3px' }} />
          </div>
          <div style={{ ...boneStyle, width: '110px', height: '26px', borderRadius: '6px' }} />
        </div>

        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3, 4].map((row) => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ ...boneStyle, width: '22%', height: '14px', borderRadius: '4px' }} />
              <div style={{ ...boneStyle, width: '18%', height: '14px', borderRadius: '4px' }} />
              <div style={{ ...boneStyle, width: '15%', height: '14px', borderRadius: '4px' }} />
              <div style={{ ...boneStyle, width: '15%', height: '14px', borderRadius: '4px' }} />
              <div style={{ ...boneStyle, width: '20%', height: '14px', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Skeleton name="dashboard-page" loading={loading} fallback={SkeletonContent} animate="shimmer">
      {SkeletonContent}
    </Skeleton>
  );
};
