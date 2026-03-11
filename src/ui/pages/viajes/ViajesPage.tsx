import { Layout } from '../../components/layout/Layout';
import { useViajes } from '../../hooks/useViajes';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../../shared/utils/formatters';

export const ViajesPage = () => {
  const { viajes, isLoading } = useViajes();

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      PROGRAMADO: 'warning',
      EN_CURSO: 'info',
      COMPLETADO: 'success',
      CANCELADO: 'danger',
    };
    return variants[estado] || 'default';
  };

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Viajes</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha Salida</TableHead>
                <TableHead>Fecha Llegada</TableHead>
                <TableHead>Asientos Disponibles</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viajes?.map((viaje) => (
                <TableRow key={viaje.id}>
                  <TableCell>{formatDate(viaje.fechaSalida)}</TableCell>
                  <TableCell>{formatDate(viaje.fechaLlegadaEstimada)}</TableCell>
                  <TableCell>{viaje.asientosDisponibles}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadge(viaje.estado)}>
                      {viaje.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};
