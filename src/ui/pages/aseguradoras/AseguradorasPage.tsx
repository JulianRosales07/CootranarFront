import { Layout } from '../../components/layout/Layout';
import { useAseguradoras } from '../../hooks/useAseguradoras';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const AseguradorasPage = () => {
  const { aseguradoras, isLoading } = useAseguradoras();

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Aseguradoras</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIT</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aseguradoras?.map((aseguradora) => (
                <TableRow key={aseguradora.id}>
                  <TableCell>{aseguradora.nit}</TableCell>
                  <TableCell>{aseguradora.nombre}</TableCell>
                  <TableCell>{aseguradora.telefono}</TableCell>
                  <TableCell>{aseguradora.email}</TableCell>
                  <TableCell>
                    <Badge variant={aseguradora.activo ? 'success' : 'danger'}>
                      {aseguradora.activo ? 'Activo' : 'Inactivo'}
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
