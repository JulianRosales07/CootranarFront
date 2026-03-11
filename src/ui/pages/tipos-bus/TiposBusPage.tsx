import { Layout } from '../../components/layout/Layout';
import { useTiposBus } from '../../hooks/useTiposBus';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const TiposBusPage = () => {
  const { tiposBus, isLoading } = useTiposBus();

  if (isLoading) return <Layout><div>Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Tipos de Bus</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiposBus?.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell>{tipo.nombre}</TableCell>
                  <TableCell>{tipo.capacidad}</TableCell>
                  <TableCell>{tipo.descripcion}</TableCell>
                  <TableCell>
                    <Badge variant={tipo.activo ? 'success' : 'danger'}>
                      {tipo.activo ? 'Activo' : 'Inactivo'}
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
