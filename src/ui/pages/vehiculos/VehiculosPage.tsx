import { Layout } from '../../components/layout/Layout';
import { useVehiculos } from '../../hooks/useVehiculos';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const VehiculosPage = () => {
  const { vehiculos, isLoading } = useVehiculos();

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      DISPONIBLE: 'success',
      EN_RUTA: 'info',
      MANTENIMIENTO: 'warning',
      FUERA_SERVICIO: 'danger',
    };
    return variants[estado] || 'default';
  };

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Vehículos</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehiculos?.map((vehiculo) => (
                <TableRow key={vehiculo.id}>
                  <TableCell>{vehiculo.placa}</TableCell>
                  <TableCell>{vehiculo.marca}</TableCell>
                  <TableCell>{vehiculo.modelo}</TableCell>
                  <TableCell>{vehiculo.año}</TableCell>
                  <TableCell>{vehiculo.capacidad}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadge(vehiculo.estado)}>
                      {vehiculo.estado}
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
