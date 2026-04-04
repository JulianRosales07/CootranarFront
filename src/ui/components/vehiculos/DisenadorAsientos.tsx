import { useState, useEffect, useRef } from 'react';

interface DisenadorAsientosProps {
  capacidad: number;
  onChange: (distribucion: any) => void;
  valorInicial?: any[];
}

export default function DisenadorAsientos({ capacidad, onChange, valorInicial }: DisenadorAsientosProps) {
  // Función auxiliar para generar la distribución inicial basada en la capacidad
  const generarDistribucion = (cap: number) => {
    if (!cap || cap <= 0) return [];
    const nuevosAsientos = [];
    // Un bus estándar tiene filas de 4 asientos (2-pasillo-2)
    // El pasillo está en la columna central (index 2)
    const tieneFila5AlFinal = (cap % 4 !== 0) && (cap > 4);
    const rows = tieneFila5AlFinal ? Math.ceil((cap - 5) / 4) + 1 : Math.ceil(cap / 4);
    
    let numeroAsiento = 0;
    let slotId = 1;
    
    for (let r = 0; r < rows; r++) {
      const esUltimaFila = r === rows - 1;
      const filaDeCinco = esUltimaFila && tieneFila5AlFinal;
      
      for (let c = 0; c < 5; c++) {
        // El pasillo está en la columna 2, excepto si la fila es de 5 asientos
        const esCeldaPasillo = c === 2 && !filaDeCinco;
        
        if (esCeldaPasillo) {
          nuevosAsientos.push({ 
            id: slotId++, 
            numero: null, 
            vacio: true, 
            esPasillo: true,
            esBano: false,
            esPoltrona: false
          });
        } else {
          // Es un espacio potencial para un asiento
          if (numeroAsiento < cap) {
            numeroAsiento++;
            nuevosAsientos.push({ 
              id: slotId++, 
              numero: numeroAsiento, 
              vacio: false, 
              esPasillo: false,
              esBano: false,
              esPoltrona: false
            });
          } else {
            // Espacio de asiento pero ya completamos la capacidad (vacio)
            nuevosAsientos.push({ 
              id: slotId++, 
              numero: null, 
              vacio: true, 
              esPasillo: false,
              esBano: false,
              esPoltrona: false
            });
          }
        }
      }
    }
    return nuevosAsientos;
  };

  // Función para re-numerar asientos de forma secuencial (corrige saltos como 2 -> 4)
  const renumerarAsientos = (arr: any[]) => {
    let nextNum = 1;
    return arr.map(a => {
      if (!a.esPasillo && !a.vacio && !a.esBano) {
        return { ...a, numero: nextNum++ };
      }
      return { ...a, numero: null };
    });
  };

  const [asientos, setAsientos] = useState<any[]>(() => {
    let base = [];
    if (valorInicial && Array.isArray(valorInicial) && valorInicial.length > 0) {
      base = valorInicial;
    } else {
      base = generarDistribucion(capacidad);
    }
    // Siempre aplicamos una re-numeración al inicio para corregir datos antiguos corruptos
    return renumerarAsientos(base);
  });

  const [nextId, setNextId] = useState(() => {
    const arr = asientos.length > 0 ? asientos : [];
    if (arr.length > 0) {
      return Math.max(...arr.map((a: any) => a.id || 0), 0) + 1;
    }
    return capacidad + 1;
  });

  // Efecto para actualizar los asientos si la capacidad cambia desde el paso anterior
  const isUpdatingFromCapacity = useRef(false);
  
  useEffect(() => {
    if (capacidad > 0) {
      setAsientos(prev => {
        const cantActual = prev.filter(a => !a.esPasillo && !a.vacio && !a.esBano).length;
        if (cantActual !== capacidad) {
          isUpdatingFromCapacity.current = true;
          const nuevaDistribucion = generarDistribucion(capacidad);
          setNextId(nuevaDistribucion.length + 1);
          // Usar requestAnimationFrame para asegurar que el flag se resetea después del render
          requestAnimationFrame(() => {
            isUpdatingFromCapacity.current = false;
          });
          return nuevaDistribucion;
        }
        return prev;
      });
    }
  }, [capacidad]);

  const [modo, setModo] = useState<'normal' | 'editar' | 'vaciar' | 'baño' | 'poltrona'>('normal');
  const columnas = 5;

  // Notificar al padre solo cuando los asientos cambien, usando un ref para evitar bucles
  const prevAsientosRef = useRef<string>('');
  
  useEffect(() => {
    if (onChange && asientos.length > 0 && !isUpdatingFromCapacity.current) {
      const asientosStr = JSON.stringify(asientos);
      if (asientosStr !== prevAsientosRef.current) {
        prevAsientosRef.current = asientosStr;
        onChange({ distribucion: asientos, columnas });
      }
    }
  }, [asientos, onChange, columnas]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    if (modo === 'editar' || modo === 'baño') return;
    e.dataTransfer.setData('sourceId', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
    if (modo === 'editar' || modo === 'baño') return;
    e.preventDefault();
    const sourceIdStr = e.dataTransfer.getData('sourceId');
    if (!sourceIdStr) return;
    const sourceId = parseInt(sourceIdStr, 10);
    
    if (sourceId === targetId) return;

    setAsientos(prev => {
      const newAsientos = [...prev];
      const sourceIdx = newAsientos.findIndex(a => a.id === sourceId);
      const targetIdx = newAsientos.findIndex(a => a.id === targetId);

      if (sourceIdx !== -1 && targetIdx !== -1) {
        const temp = { ...newAsientos[sourceIdx] };
        newAsientos[sourceIdx] = {
           ...newAsientos[sourceIdx],
           numero: newAsientos[targetIdx].numero,
           esPasillo: newAsientos[targetIdx].esPasillo,
           vacio: newAsientos[targetIdx].vacio,
           esBano: newAsientos[targetIdx].esBano
        };
        newAsientos[targetIdx] = {
           ...newAsientos[targetIdx],
           numero: temp.numero,
           esPasillo: temp.esPasillo,
           vacio: temp.vacio,
           esBano: temp.esBano
        };
      }
      return newAsientos;
    });
  };

  const interactuarAsiento = (id: number) => {
    if (modo === 'editar') return;
    const asiento = asientos.find(a => a.id === id);
    if (!asiento) return;

    if (modo === 'vaciar') {
      setAsientos(prev => {
        const next = prev.map(a =>
          a.id === id ? { ...a, esPasillo: !a.esPasillo, vacio: !a.esPasillo, esBano: false, esPoltrona: false } : a
        );
        return renumerarAsientos(next);
      });
    } else if (modo === 'poltrona') {
      // Alternar el estado de poltrona solo si es un asiento válido (no pasillo, no vacío, no baño)
      if (!asiento.esPasillo && !asiento.vacio && !asiento.esBano) {
        setAsientos(prev =>
          prev.map(a =>
            a.id === id ? { ...a, esPoltrona: !a.esPoltrona } : a
          )
        );
      }
    } else if (modo === 'baño') {
      const idx = asientos.findIndex(a => a.id === id);
      if (idx === -1) return;
      const col = idx % 5;
      
      let idsToToggle: number[] = [id];
      if (col === 0) idsToToggle.push(asientos[idx + 1]?.id);
      else if (col === 1) idsToToggle.push(asientos[idx - 1]?.id);
      else if (col === 3) idsToToggle.push(asientos[idx + 1]?.id);
      else if (col === 4) idsToToggle.push(asientos[idx - 1]?.id);
      
      setAsientos(prev => {
        const next = prev.map(a =>
          idsToToggle.includes(a.id) ? { 
            ...a, 
            esBano: !a.esBano, 
            esPasillo: false, 
            vacio: true, 
            numero: null,
            esPoltrona: false
          } : a
        );
        return renumerarAsientos(next);
      });
    }
  };

  const cambiarNumeroEnVivo = (id: number, nuevoNum: string) => {
    setAsientos(prev => prev.map(a =>
      a.id === id ? { ...a, numero: nuevoNum, vacio: false, esBano: false, esPoltrona: a.esPoltrona || false } : a
    ));
  };

  const agregarAsiento = () => {
    setAsientos(prev => {
      let nuevos = [...prev];
      let nid = nextId;
      const colIndex = nuevos.length % 5;
      if (colIndex === 2) {
        nuevos.push({ id: nid++, esPasillo: true, vacio: true, numero: null, esBano: false, esPoltrona: false });
      }
      nuevos.push({ id: nid++, esPasillo: false, vacio: false, numero: Math.max(0, ...prev.filter(a => !a.esPasillo && !a.esBano && !isNaN(Number(a.numero))).map(a => Number(a.numero))) + 1, esBano: false, esPoltrona: false });
      setNextId(nid);
      return nuevos;
    });
  };

  const eliminarUltimo = () => {
    setAsientos(prev => {
      if (prev.length === 0) return prev;
      let nuevos = [...prev];
      nuevos.pop();
      if (nuevos.length > 0 && nuevos[nuevos.length - 1].esPasillo) {
        nuevos.pop();
      }
      return nuevos;
    });
  };

  const toggleAsientoCentralFondo = () => {
    setAsientos(prev => {
      let lastCentralIndex = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (i % 5 === 2) {
          lastCentralIndex = i;
          break;
        }
      }
      if (lastCentralIndex !== -1) {
        let nuevos = [...prev];
        const target = nuevos[lastCentralIndex];
        const willBeSeat = target.esPasillo;
        nuevos[lastCentralIndex] = {
          ...target,
          esPasillo: !willBeSeat,
          vacio: !willBeSeat,
          esBano: false,
          esPoltrona: false,
          numero: willBeSeat
            ? (Math.max(0, ...prev.filter(x => !x.esPasillo && !x.esBano && !isNaN(Number(x.numero))).map(x => Number(x.numero))) + 1)
            : null
        };
        return nuevos;
      }
      return prev;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        
        {/* ENCABEZADO Y HERRAMIENTAS PREMIUM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #e0e7ff', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <span className="material-symbols-outlined" style={{ color: '#4f46e5', fontSize: '24px' }}>airline_seat_recline_extra</span>
                    </div>
                    Distribución del Bus
                  </h3>
                  <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>Diseña la estructura interna arrastrando o usando las herramientas de abajo.</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {/* GRUPO 1: Modificadores estructurales */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '12px', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={agregarAsiento}
                        className="hover:bg-white hover:text-green-700 hover:shadow-sm"
                        style={{ cursor: 'pointer', display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 'bold', color: '#475569', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', transition: 'all 0.2s', minWidth: 'max-content' }}
                        title="Añade un nuevo asiento al final">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>add_circle</span> Añadir
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }}></div>
                    <button
                        type="button"
                        onClick={eliminarUltimo}
                        className="hover:bg-white hover:text-red-700 hover:shadow-sm"
                        style={{ cursor: 'pointer', display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 'bold', color: '#475569', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', transition: 'all 0.2s', minWidth: 'max-content' }}
                        title="Elimina el último asiento añadido">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>do_not_disturb_on</span> Quitar
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }}></div>
                    <button
                        type="button"
                        onClick={toggleAsientoCentralFondo}
                        className="hover:bg-white hover:text-indigo-700 hover:shadow-sm"
                        style={{ cursor: 'pointer', display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 'bold', color: '#475569', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', transition: 'all 0.2s', minWidth: 'max-content' }}
                        title="Activa silla central exclusiva en la última fila">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>weekend</span> +Fondo
                    </button>
                </div>

                {/* GRUPO 2: Modos de Herramientas */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '12px', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={() => setModo(modo === 'poltrona' ? 'normal' : 'poltrona')}
                        className={modo === 'poltrona' ? 'shadow-sm' : 'hover:bg-white hover:text-amber-700'}
                        style={{ cursor: 'pointer', display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 'bold', color: modo === 'poltrona' ? '#d97706' : '#475569', backgroundColor: modo === 'poltrona' ? '#fffbeb' : 'transparent', border: modo === 'poltrona' ? '1px solid #fde68a' : '1px solid transparent', borderRadius: '8px', transition: 'all 0.2s', minWidth: 'max-content' }}
                        title="Marca asientos como poltrona (asientos premium)">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>airline_seat_recline_extra</span> Poltrona
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }}></div>
                    <button
                        type="button"
                        onClick={() => setModo(modo === 'editar' ? 'normal' : 'editar')}
                        className={modo === 'editar' ? 'shadow-sm' : 'hover:bg-white hover:text-blue-700'}
                        style={{ cursor: 'pointer', display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 'bold', color: modo === 'editar' ? '#1d4ed8' : '#475569', backgroundColor: modo === 'editar' ? '#ffffff' : 'transparent', border: modo === 'editar' ? '1px solid #bfdbfe' : '1px solid transparent', borderRadius: '8px', transition: 'all 0.2s', minWidth: 'max-content' }}
                        title="Modifica numeración">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>edit_document</span> Editar
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }}></div>
                    <button
                        type="button"
                        onClick={() => setModo(modo === 'vaciar' ? 'normal' : 'vaciar')}
                        className={modo === 'vaciar' ? 'shadow-sm' : 'hover:bg-white hover:text-red-700'}
                        style={{ cursor: 'pointer', display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 'bold', color: modo === 'vaciar' ? '#b91c1c' : '#475569', backgroundColor: modo === 'vaciar' ? '#fef2f2' : 'transparent', border: modo === 'vaciar' ? '1px solid #fecaca' : '1px solid transparent', borderRadius: '8px', transition: 'all 0.2s', minWidth: 'max-content' }}
                        title="Activa modo borrador de asientos">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>ink_eraser</span> Vaciar
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }}></div>
                    <button
                        type="button"
                        onClick={() => setModo(modo === 'baño' ? 'normal' : 'baño')}
                        className={modo === 'baño' ? 'shadow-sm' : 'hover:bg-white hover:text-purple-700'}
                        style={{ cursor: 'pointer', display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 'bold', color: modo === 'baño' ? '#7e22ce' : '#475569', backgroundColor: modo === 'baño' ? '#faf5ff' : 'transparent', border: modo === 'baño' ? '1px solid #e9d5ff' : '1px solid transparent', borderRadius: '8px', transition: 'all 0.2s', minWidth: 'max-content' }}
                        title="Asignar baño a una posición">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>wc</span> Baño
                    </button>
                </div>
            </div>
        </div>

        {/* ÁREA DE DISEÑO RESPONSIVA */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', minHeight: '500px', padding: '40px 24px', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundColor: '#f8fafc' }}>
            
            {/* CARROCERÍA DEL BUS */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px', backgroundColor: '#ffffff', borderRadius: '48px', padding: '24px 20px 28px 20px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.15)', border: '8px solid #f1f5f9' }}>
                
                {/* Sombra de Toldo / Parabrisas */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '180px', height: '40px', background: 'linear-gradient(to bottom, rgba(226, 232, 240, 0.6), transparent)', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px' }}></div>
                
                {/* Zona de Cabina */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', marginTop: '12px', paddingBottom: '20px', borderBottom: '2px dashed #e2e8f0', position: 'relative' }}>
                    <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #334155, #0f172a)', color: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transform: 'rotate(-12deg)', border: '4px solid #f8fafc' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>steering_wheel_heat</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', opacity: 0.6 }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#64748b', letterSpacing: '0.25em' }}>FRENTE</span>
                        <div style={{ width: '40px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '9999px', marginTop: '6px' }}></div>
                    </div>
                </div>

                {/* GRID DE ASIENTOS CON GRID NATIVO */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnas}, 1fr)`, rowGap: '12px', columnGap: '8px', paddingBottom: '12px' }}>
                    {asientos.map((asiento, idx) => {
                        const esAsientoReal = !asiento.esPasillo && !asiento.vacio && !asiento.esBano;
                        const esBaño = asiento.esBano;
                        const col = idx % 5;
                        
                        // Lógica de detección de par para span 2
                        const esParteIzquierda = esBaño && (col === 0 || col === 3) && asientos[idx + 1]?.esBano;
                        const esParteDerecha = esBaño && (col === 1 || col === 4) && asientos[idx - 1]?.esBano;

                        // Si es la parte derecha de un baño doble, no lo renderizamos (el span 2 del anterior ocupará su lugar)
                        if (esParteDerecha) return null;

                        const bgColor = esBaño
                           ? '#faf5ff'
                           : asiento.esPasillo 
                               ? (modo === 'vaciar' ? 'rgba(254, 226, 226, 0.8)' : 'transparent')
                               : (asiento.vacio ? '#f8fafc' : (asiento.esPoltrona ? 'linear-gradient(to bottom, #fef3c7, #fde68a)' : 'linear-gradient(to bottom, #ffffff, #f1f5f9)'));
                        
                        const borderColor = esBaño
                           ? '2px solid #d8b4fe'
                           : asiento.esPasillo
                               ? (modo === 'vaciar' ? '2px dashed #fca5a5' : '1px solid transparent')
                               : (asiento.vacio ? '2px dashed #cbd5e1' : (asiento.esPoltrona ? '2px solid #f59e0b' : '1px solid #e2e8f0'));

                        const colorTxt = esBaño ? '#7e22ce' : (asiento.esPasillo ? 'transparent' : (asiento.vacio ? '#94a3b8' : (asiento.esPoltrona ? '#92400e' : '#334155')));

                        return (
                            <div
                                key={asiento.id}
                                onClick={() => interactuarAsiento(asiento.id)}
                                draggable={modo === 'normal'}
                                onDragStart={(e) => handleDragStart(e, asiento.id)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, asiento.id)}
                                className="group hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                                style={{
                                    position: 'relative',
                                    aspectRatio: esParteIzquierda ? 'auto' : '1',
                                    gridColumn: esParteIzquierda ? 'span 2' : 'auto',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 900,
                                    userSelect: 'none',
                                    background: bgColor,
                                    border: borderColor,
                                    boxSizing: 'border-box',
                                    color: colorTxt,
                                    boxShadow: (esAsientoReal || esBaño) ? '0 2px 4px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.05)' : 'none',
                                    transform: 'translateY(0)',
                                    cursor: (modo === 'editar' || modo === 'baño' || modo === 'vaciar' || modo === 'poltrona') ? 'pointer' : 'grab',
                                    padding: '0 8px',
                                    minHeight: '40px',
                                    width: '100%',
                                    outline: 'none',
                                    overflow: 'visible' // Para que no corte el borde de 2px
                                }}
                            >
                                {/* ICONO DE BAÑO */}
                                {esBaño ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>wc</span>
                                        {esParteIzquierda && <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>BAÑO</span>}
                                    </div>
                                ) : (
                                    /* INPUT INLINE EN TIEMPO REAL */
                                    modo === 'editar' && !asiento.esPasillo ? (
                                        <input 
                                            type="text" 
                                            value={asiento.numero || ''}
                                            onChange={(e) => cambiarNumeroEnVivo(asiento.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ 
                                                width: '85%', height: '85%', textAlign: 'center', 
                                                background: '#e0e7ff', border: '1px solid #6366f1', 
                                                borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', 
                                                color: '#1e3a8a', padding: '0', margin: 0, outline: 'none' 
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {!asiento.esPasillo && (asiento.vacio ? 'X' : asiento.numero)}
                                            {asiento.esPoltrona && !asiento.vacio && !asiento.esPasillo && (
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#f59e0b' }}>star</span>
                                            )}
                                        </div>
                                    )
                                )}
                                
                                {/* Reflexión 3D superior del asiento */}
                                {(esAsientoReal || esBaño) && modo === 'normal' && (
                                    <div style={{ position: 'absolute', top: '2px', width: '70%', height: '3px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '9999px', pointerEvents: 'none' }}></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        {/* PIE DE PÁGINA (ESTADÍSTICAS) */}
        <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9', padding: '16px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                Visualización de Asignación
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '1px', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '2px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '9999px' }}></div>
                    </div>
                    <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>
                        Disponibles: <span style={{ color: '#0f172a' }}>{asientos.filter(a => !a.esPasillo && !a.vacio && !a.esBano).length}</span>
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(to bottom, #fef3c7, #fde68a)', border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <span className="material-symbols-outlined" style={{ fontSize: '10px', color: '#92400e' }}>star</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>
                        Poltronas: <span style={{ color: '#0f172a' }}>{asientos.filter(a => a.esPoltrona && !a.vacio && !a.esPasillo && !a.esBano).length}</span>
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#faf5ff', border: '1px solid #d8b4fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <span className="material-symbols-outlined" style={{ fontSize: '10px', color: '#7e22ce' }}>wc</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                        Baños: {asientos.filter((a, idx) => a.esBano && (idx % 5 === 0 || idx % 5 === 3)).length}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1' }}></div>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                        Ocultos: {asientos.filter(a => !a.esPasillo && a.vacio && !a.esBano).length}
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
}
