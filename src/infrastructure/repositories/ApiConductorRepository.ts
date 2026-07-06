import type { ConductorRepository } from '../../domain/repositories/ConductorRepository';
import type { Conductor } from '../../domain/entities/Conductor';
import { httpClient } from '../api/httpClient';

function mapEstado(c: any): 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' {
  if (c.estado) return c.estado;
  if (c.activo === false) return 'INACTIVO';
  if (c.activo === true) return 'ACTIVO';
  return 'ACTIVO';
}

export class ApiConductorRepository implements ConductorRepository {
  async findAll(): Promise<Conductor[]> {
    const response = await httpClient.get('/conductores', { params: { limit: 1000 } });
    const data = response.data;
    
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.conductores)
      ? data.conductores
      : Array.isArray(data?.data?.conductores)
      ? data.data.conductores
      : Array.isArray(data?.data)
      ? data.data
      : [];
    
    return list.map((c: any, index: number) => {
      const documento = c.documento ?? c.numerodocumento ?? c.cedula ?? c.CC;
      return {
        id: documento ? String(documento) : `temp-${index}`,
        idusuario: c.idusuario ?? c.idconductor,
        nombre: c.nombre,
        apellido: c.apellido,
        documento,
        tipoDocumento: c.tipodocumento ?? c.tipoDocumento ?? 'CC',
        licencia: c.numerolicencia ?? c.licencia,
        categoriaLicencia: c.categorialicencia ?? c.categoriaLicencia ?? '',
        vencimientoLicencia: c.fechavencimientolicencia ?? c.vencimientoLicencia ?? '',
        telefono: c.telefono,
        email: c.correoelectronico ?? c.correo ?? c.email ?? '',
        fechaContratacion: c.fechacontratacion ?? c.fechaContratacion ?? '',
        estado: mapEstado(c),
        urlLicencia: c.archivolicenciaurl ?? c.rutalicencia ?? c.ruta_licencia ?? c.url_licencia ?? c.licenciaUrl ?? c.archivolicencia ?? c.archivo_licencia ?? (typeof c.licencia === 'string' && c.licencia.startsWith('http') ? c.licencia : undefined),
        createdAt: c.createdAt ?? '',
        updatedAt: c.updatedAt ?? '',
        _raw: c,
      };
    });
  }

  async findById(id: string): Promise<Conductor | null> {
    try {
      const response = await httpClient.get(`/conductores/${id}`);
      const c = response.data?.data?.conductor ?? response.data;
      if (!c) return null;
      const documento = c.documento ?? c.numerodocumento ?? c.cedula ?? c.CC;
      return {
        id: documento ? String(documento) : String(c.idconductor ?? c.id),
        idusuario: c.idusuario ?? c.idconductor,
        nombre: c.nombre,
        apellido: c.apellido,
        documento,
        tipoDocumento: c.tipodocumento ?? c.tipoDocumento ?? 'CC',
        licencia: c.numerolicencia ?? c.licencia,
        categoriaLicencia: c.categorialicencia ?? c.categoriaLicencia ?? '',
        vencimientoLicencia: c.fechavencimientolicencia ?? c.vencimientoLicencia ?? '',
        telefono: c.telefono,
        email: c.correoelectronico ?? c.correo ?? c.email ?? '',
        fechaContratacion: c.fechacontratacion ?? c.fechaContratacion ?? '',
        estado: mapEstado(c),
        urlLicencia: c.archivolicenciaurl ?? c.rutalicencia ?? c.ruta_licencia ?? c.url_licencia ?? c.licenciaUrl ?? c.archivolicencia ?? c.archivo_licencia ?? (typeof c.licencia === 'string' && c.licencia.startsWith('http') ? c.licencia : undefined),
        createdAt: c.createdAt ?? '',
        updatedAt: c.updatedAt ?? '',
        _raw: c,
      };
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Conductor, 'id' | 'createdAt' | 'updatedAt'> | FormData): Promise<Conductor> {
    const response = await httpClient.post('/conductores', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    const c = response.data?.data?.conductor ?? response.data?.conductor ?? response.data;
    const documento = c.documento ?? c.numerodocumento ?? c.cedula ?? c.CC;
    return {
      id: documento ? String(documento) : String(c.idconductor ?? c.id),
      idusuario: c.idusuario ?? c.idconductor,
      nombre: c.nombre,
      apellido: c.apellido,
      documento,
      tipoDocumento: c.tipodocumento ?? c.tipoDocumento ?? 'CC',
      licencia: c.numerolicencia ?? c.licencia,
      categoriaLicencia: c.categorialicencia ?? c.categoriaLicencia ?? '',
      vencimientoLicencia: c.fechavencimientolicencia ?? c.vencimientoLicencia ?? '',
      telefono: c.telefono,
      email: c.correoelectronico ?? c.correo ?? c.email ?? '',
      fechaContratacion: c.fechacontratacion ?? c.fechaContratacion ?? '',
      estado: mapEstado(c),
      urlLicencia: c.archivolicenciaurl ?? c.rutalicencia ?? c.ruta_licencia ?? c.url_licencia ?? c.licenciaUrl ?? c.archivolicencia ?? c.archivo_licencia ?? (typeof c.licencia === 'string' && c.licencia.startsWith('http') ? c.licencia : undefined),
      createdAt: c.createdAt ?? '',
      updatedAt: c.updatedAt ?? '',
    };
  }

  async update(id: string, data: Partial<Conductor> | FormData): Promise<Conductor> {
    const response = await httpClient.put(`/conductores/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    const c = response.data?.data?.conductor ?? response.data?.conductor ?? response.data;
    const documento = c.documento ?? c.numerodocumento ?? c.cedula ?? c.CC;
    return {
      id: documento ? String(documento) : String(c.idconductor ?? c.id),
      idusuario: c.idusuario ?? c.idconductor,
      nombre: c.nombre,
      apellido: c.apellido,
      documento,
      tipoDocumento: c.tipodocumento ?? c.tipoDocumento ?? 'CC',
      licencia: c.numerolicencia ?? c.licencia,
      categoriaLicencia: c.categorialicencia ?? c.categoriaLicencia ?? '',
      vencimientoLicencia: c.fechavencimientolicencia ?? c.vencimientoLicencia ?? '',
      telefono: c.telefono,
      email: c.correoelectronico ?? c.correo ?? c.email ?? '',
      fechaContratacion: c.fechacontratacion ?? c.fechaContratacion ?? '',
      estado: mapEstado(c),
      urlLicencia: c.archivolicenciaurl ?? c.rutalicencia ?? c.ruta_licencia ?? c.url_licencia ?? c.licenciaUrl ?? c.archivolicencia ?? c.archivo_licencia ?? (typeof c.licencia === 'string' && c.licencia.startsWith('http') ? c.licencia : undefined),
      createdAt: c.createdAt ?? '',
      updatedAt: c.updatedAt ?? '',
    };
  }

  async delete(id: string): Promise<void> {
    await httpClient.patch(`/conductores/desactivar/${id}`);
  }

  async activate(id: string): Promise<void> {
    await httpClient.patch(`/conductores/activar/${id}`);
  }
}
