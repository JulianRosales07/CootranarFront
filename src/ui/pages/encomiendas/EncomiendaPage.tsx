import { Layout } from '../../components/layout/Layout';
import { useEncomiendas } from '../../hooks/useEncomiendas';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';

export const EncomiendaPage = () => {
  const { encomiendas, isLoading } = useEncomiendas();

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      ENTREGADA: 'success',
      EN_TRANSITO: 'info',
      RECIBIDA: 'warning',
      DEVUELTA: 'danger',
    };
    return variants[estado] || 'default';
  };

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Encomiendas</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Remitente</TableHead>
                <TableHead>Destinatario</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encomiendas?.map((encomienda) => (
                <TableRow key={encomienda.id}>
                  <TableCell>{encomienda.remitenteNombre}</TableCell>
                  <TableCell>{encomienda.destinatarioNombre}</TableCell>
                  <TableCell>{encomienda.origen} - {encomienda.destino}</TableCell>
                  <TableCell>{encomienda.peso} kg</TableCell>
                  <TableCell>{formatCurrency(encomienda.precio)}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadge(encomienda.estado)}>
                      {encomienda.estado}
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
