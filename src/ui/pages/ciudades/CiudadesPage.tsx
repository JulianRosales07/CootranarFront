import { Layout } from '../../components/layout/Layout';
import { useCiudades } from '../../hooks/useCiudades';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const CiudadesPage = () => {
  const { ciudades, isLoading } = useCiudades();

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Ciudades</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ciudades?.map((ciudad) => (
                <TableRow key={ciudad.id}>
                  <TableCell>{ciudad.codigo}</TableCell>
                  <TableCell>{ciudad.nombre}</TableCell>
                  <TableCell>{ciudad.departamento}</TableCell>
                  <TableCell>
                    <Badge variant={ciudad.activo ? 'success' : 'danger'}>
                      {ciudad.activo ? 'Activo' : 'Inactivo'}
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
