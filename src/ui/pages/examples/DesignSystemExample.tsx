/**
 * Design System Example Page
 * 
 * Página de ejemplo que muestra todos los componentes del sistema de diseño
 * Útil para desarrollo, testing y documentación visual
 */

import { useState } from 'react';
import { Button, Badge, Card, Input } from '../../components/common';
import { colors, typography, spacing, rounded } from '../../../styles/design-tokens';

export const DesignSystemExample = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email.includes('@')) {
      setEmailError('Ingresa un correo válido');
      return;
    }
    setEmailError('');
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ 
      padding: spacing['3xl'], 
      backgroundColor: colors.gray50,
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['3xl'] }}>
        <h1 style={{ 
          ...typography.displayLg, 
          color: colors.gray900,
          marginBottom: spacing.sm,
        }}>
          Sistema de Diseño COOTRANAR
        </h1>
        <p style={{ 
          ...typography.bodyLg, 
          color: colors.gray600,
        }}>
          Componentes y tokens del sistema de diseño
        </p>
      </div>

      {/* Sección: Colores */}
      <Card variant="default" style={{ marginBottom: spacing['2xl'] }}>
        <h2 style={{ 
          ...typography.h2, 
          color: colors.gray800,
          marginBottom: spacing.lg,
        }}>
          Colores Corporativos
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: spacing.lg,
        }}>
          {[
            { name: 'Primary', color: colors.primary },
            { name: 'Primary Dark', color: colors.primaryDark },
            { name: 'Success', color: colors.success },
            { name: 'Warning', color: colors.warning },
            { name: 'Danger', color: colors.danger },
            { name: 'Info', color: colors.info },
            { name: 'Secondary', color: colors.secondary },
            { name: 'Purple', color: colors.purple },
          ].map(({ name, color }) => (
            <div key={name}>
              <div style={{
                width: '100%',
                height: '80px',
                backgroundColor: color,
                borderRadius: rounded.lg,
                marginBottom: spacing.sm,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }} />
              <p style={{ 
                ...typography.bodySm, 
                color: colors.gray700,
                fontWeight: 600,
              }}>
                {name}
              </p>
              <p style={{ 
                ...typography.bodyXs, 
                color: colors.gray500,
                fontFamily: 'monospace',
              }}>
                {color}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Sección: Botones */}
      <Card variant="default" style={{ marginBottom: spacing['2xl'] }}>
        <h2 style={{ 
          ...typography.h2, 
          color: colors.gray800,
          marginBottom: spacing.lg,
        }}>
          Botones
        </h2>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: spacing.lg,
          alignItems: 'center',
        }}>
          <Button variant="primary">
            Botón Primario
          </Button>
          
          <Button variant="secondary">
            Botón Secundario
          </Button>
          
          <Button variant="danger">
            Botón Peligro
          </Button>
          
          <Button variant="primary" disabled>
            Deshabilitado
          </Button>
          
          <Button 
            variant="primary" 
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
          >
            Con Loading
          </Button>
          
          <Button 
            variant="primary"
            icon={<span className="material-symbols-outlined">save</span>}
          >
            Con Icono
          </Button>
        </div>
      </Card>

      {/* Sección: Badges */}
      <Card variant="default" style={{ marginBottom: spacing['2xl'] }}>
        <h2 style={{ 
          ...typography.h2, 
          color: colors.gray800,
          marginBottom: spacing.lg,
        }}>
          Badges de Estado
        </h2>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: spacing.lg,
          alignItems: 'center',
        }}>
          <Badge variant="success">Vigente</Badge>
          <Badge variant="warning">Próximo a vencer</Badge>
          <Badge variant="danger">Vencido</Badge>
          <Badge variant="info">Información</Badge>
        </div>
      </Card>

      {/* Sección: Inputs */}
      <Card variant="default" style={{ marginBottom: spacing['2xl'] }}>
        <h2 style={{ 
          ...typography.h2, 
          color: colors.gray800,
          marginBottom: spacing.lg,
        }}>
          Campos de Entrada
        </h2>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing.lg,
        }}>
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            icon={<span className="material-symbols-outlined">email</span>}
          />
          
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            helperText="Mínimo 8 caracteres"
            icon={<span className="material-symbols-outlined">lock</span>}
          />
          
          <Input
            label="Teléfono"
            type="tel"
            placeholder="+57 300 123 4567"
            icon={<span className="material-symbols-outlined">phone</span>}
          />
        </div>
        
        <div style={{ marginTop: spacing.lg }}>
          <Button variant="primary" onClick={handleSubmit}>
            Validar Formulario
          </Button>
        </div>
      </Card>

      {/* Sección: Cards */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: spacing['2xl'],
        marginBottom: spacing['2xl'],
      }}>
        <Card variant="default">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: spacing.md,
            marginBottom: spacing.md,
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: colors.primaryLight,
              borderRadius: rounded.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.primary,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                directions_bus
              </span>
            </div>
            <div>
              <h3 style={{ ...typography.h4, color: colors.gray800, margin: 0 }}>
                Card Default
              </h3>
              <p style={{ ...typography.bodySm, color: colors.gray500, margin: 0 }}>
                Estilo estándar
              </p>
            </div>
          </div>
          <p style={{ ...typography.bodyMd, color: colors.gray700 }}>
            Este es un card con el estilo por defecto. Ideal para contenido general.
          </p>
        </Card>

        <Card variant="elevated">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: spacing.md,
            marginBottom: spacing.md,
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: colors.successLight,
              borderRadius: rounded.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.success,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                verified
              </span>
            </div>
            <div>
              <h3 style={{ ...typography.h4, color: colors.gray800, margin: 0 }}>
                Card Elevado
              </h3>
              <p style={{ ...typography.bodySm, color: colors.gray500, margin: 0 }}>
                Estilo destacado
              </p>
            </div>
          </div>
          <p style={{ ...typography.bodyMd, color: colors.gray700 }}>
            Este es un card elevado con sombra pronunciada. Ideal para modales y contenido importante.
          </p>
        </Card>
      </div>

      {/* Sección: Tipografía */}
      <Card variant="default" style={{ marginBottom: spacing['2xl'] }}>
        <h2 style={{ 
          ...typography.h2, 
          color: colors.gray800,
          marginBottom: spacing.lg,
        }}>
          Jerarquía Tipográfica
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <div>
            <p style={{ ...typography.labelCaps, color: colors.gray500, marginBottom: spacing.xs }}>
              Display XL
            </p>
            <h1 style={{ ...typography.displayXl, color: colors.gray900, margin: 0 }}>
              Título Display Extra Grande
            </h1>
          </div>
          
          <div>
            <p style={{ ...typography.labelCaps, color: colors.gray500, marginBottom: spacing.xs }}>
              H1
            </p>
            <h1 style={{ ...typography.h1, color: colors.gray900, margin: 0 }}>
              Título Principal H1
            </h1>
          </div>
          
          <div>
            <p style={{ ...typography.labelCaps, color: colors.gray500, marginBottom: spacing.xs }}>
              H2
            </p>
            <h2 style={{ ...typography.h2, color: colors.gray800, margin: 0 }}>
              Título Secundario H2
            </h2>
          </div>
          
          <div>
            <p style={{ ...typography.labelCaps, color: colors.gray500, marginBottom: spacing.xs }}>
              Body MD (Estándar)
            </p>
            <p style={{ ...typography.bodyMd, color: colors.gray700, margin: 0 }}>
              Este es el texto de cuerpo estándar. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          
          <div>
            <p style={{ ...typography.labelCaps, color: colors.gray500, marginBottom: spacing.xs }}>
              Body SM (Pequeño)
            </p>
            <p style={{ ...typography.bodySm, color: colors.gray600, margin: 0 }}>
              Este es texto de cuerpo pequeño. Ideal para metadatos y descripciones secundarias.
            </p>
          </div>
        </div>
      </Card>

      {/* Sección: Iconos */}
      <Card variant="default">
        <h2 style={{ 
          ...typography.h2, 
          color: colors.gray800,
          marginBottom: spacing.lg,
        }}>
          Iconos Material Symbols
        </h2>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: spacing.lg,
        }}>
          {[
            'directions_bus',
            'person',
            'verified',
            'shield',
            'description',
            'map',
            'payments',
            'analytics',
            'settings',
            'notifications',
            'help',
            'logout',
          ].map((icon) => (
            <div 
              key={icon}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: colors.gray100,
                borderRadius: rounded.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.gray700,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                  {icon}
                </span>
              </div>
              <p style={{ 
                ...typography.bodyXs, 
                color: colors.gray600,
                textAlign: 'center',
              }}>
                {icon}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
