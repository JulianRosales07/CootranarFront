import { Layout } from '../../components/layout/Layout';
import { useAgencias } from '../../hooks/useAgencias';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const AgenciasPage = () => {
  const { agencias, isLoading } = useAgencias();

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Agencias</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencias?.map((agencia) => (
                <TableRow key={agencia.id}>
                  <TableCell>{agencia.codigo}</TableCell>
                  <TableCell>{agencia.nombre}</TableCell>
                  <TableCell>{agencia.direccion}</TableCell>
                  <TableCell>{agencia.telefono}</TableCell>
                  <TableCell>
                    <Badge variant={agencia.activo ? 'success' : 'danger'}>
                      {agencia.activo ? 'Activo' : 'Inactivo'}
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
