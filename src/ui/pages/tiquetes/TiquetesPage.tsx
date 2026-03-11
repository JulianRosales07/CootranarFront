import { Layout } from '../../components/layout/Layout';
import { useTiquetes } from '../../hooks/useTiquetes';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';

export const TiquetesPage = () => {
  const { tiquetes, isLoading } = useTiquetes();

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      CONFIRMADO: 'success',
      PENDIENTE: 'warning',
      CANCELADO: 'danger',
      USADO: 'info',
    };
    return variants[estado] || 'default';
  };

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tiquetes</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pasajero</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Asiento</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiquetes?.map((tiquete) => (
                <TableRow key={tiquete.id}>
                  <TableCell>{tiquete.pasajeroNombre}</TableCell>
                  <TableCell>{tiquete.origen} - {tiquete.destino}</TableCell>
                  <TableCell>{formatDate(tiquete.fechaViaje)}</TableCell>
                  <TableCell>{tiquete.asiento}</TableCell>
                  <TableCell>{formatCurrency(tiquete.precio)}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadge(tiquete.estado)}>
                      {tiquete.estado}
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
