import { Layout } from '../../components/layout/Layout';
import { usePolizas } from '../../hooks/usePolizas';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';

export const PolizasPage = () => {
  const { polizas, isLoading } = usePolizas();

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      VIGENTE: 'success',
      VENCIDA: 'danger',
      CANCELADA: 'warning',
    };
    return variants[estado] || 'default';
  };

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Pólizas</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Valor Asegurado</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {polizas?.map((poliza) => (
                <TableRow key={poliza.id}>
                  <TableCell>{poliza.numero}</TableCell>
                  <TableCell>{formatDate(poliza.fechaInicio)}</TableCell>
                  <TableCell>{formatDate(poliza.fechaVencimiento)}</TableCell>
                  <TableCell>{formatCurrency(poliza.valorAsegurado)}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadge(poliza.estado)}>
                      {poliza.estado}
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
