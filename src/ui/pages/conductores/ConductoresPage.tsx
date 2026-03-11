import { Layout } from '../../components/layout/Layout';
import { useConductores } from '../../hooks/useConductores';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const ConductoresPage = () => {
  const { conductores, isLoading } = useConductores();

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      ACTIVO: 'success',
      INACTIVO: 'warning',
      SUSPENDIDO: 'danger',
    };
    return variants[estado] || 'default';
  };

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Conductores</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conductores?.map((conductor) => (
                <TableRow key={conductor.id}>
                  <TableCell>{conductor.documento}</TableCell>
                  <TableCell>{conductor.nombre} {conductor.apellido}</TableCell>
                  <TableCell>{conductor.licencia}</TableCell>
                  <TableCell>{conductor.telefono}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadge(conductor.estado)}>
                      {conductor.estado}
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
