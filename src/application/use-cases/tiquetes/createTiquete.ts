import type { TiqueteRepository } from '@/domain/repositories/TiqueteRepository';
import type { CreateTiqueteDTO } from '@/application/dto/TiqueteDTO';
import type { Tiquete } from '@/domain/entities/Tiquete';

export const createTiquete = async (
  repo: TiqueteRepository,
  data: CreateTiqueteDTO,
): Promise<Tiquete> => {
  return repo.save({
    origen: data.origen,
    destino: data.destino,
    fechaViaje: new Date(data.fechaViaje),
    pasajeroNombre: data.pasajeroNombre,
    pasajeroDocumento: data.pasajeroDocumento,
    precio: data.precio,
    asiento: data.asiento,
    rutaId: data.rutaId,
    estado: 'PENDIENTE',
  });
};
