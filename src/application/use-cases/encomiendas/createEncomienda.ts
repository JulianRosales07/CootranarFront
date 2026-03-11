import type { EncomiendaRepository } from '@/domain/repositories/EncomiendaRepository';
import type { CreateEncomiendaDTO } from '@/application/dto/EncomiendaDTO';
import type { Encomienda } from '@/domain/entities/Encomienda';

export const createEncomienda = async (
  repo: EncomiendaRepository,
  data: CreateEncomiendaDTO,
): Promise<Encomienda> => {
  const fechaEnvio = new Date();
  const fechaEntregaEstimada = new Date(fechaEnvio);
  fechaEntregaEstimada.setDate(fechaEntregaEstimada.getDate() + 3);

  return repo.save({
    remitenteNombre: data.remitenteNombre,
    remitenteDocumento: data.remitenteDocumento,
    destinatarioNombre: data.destinatarioNombre,
    destinatarioDocumento: data.destinatarioDocumento,
    peso: data.peso,
    descripcion: data.descripcion,
    origen: data.origen,
    destino: data.destino,
    precio: 0,
    estado: 'RECIBIDA',
    fechaEnvio,
    fechaEntregaEstimada,
  });
};
