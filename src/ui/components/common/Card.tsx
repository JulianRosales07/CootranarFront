/**
 * Card Component - COOTRANAR Design System
 * 
 * Componente de tarjeta para contenedores de contenido
 * @see ../../../DESIGN.md
 */

import type { CSSProperties, ReactNode } from 'react';
import { components } from '../../../styles/design-tokens';

export interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated';
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export const Card = ({
  children,
  variant = 'default',
  className = '',
  style = {},
  onClick,
}: CardProps) => {
  // Seleccionar estilos según variante
  const baseStyles = variant === 'elevated' 
    ? components.cardElevated 
    : components.cardDefault;

  return (
    <div
      className={className}
      style={{
        ...baseStyles,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
