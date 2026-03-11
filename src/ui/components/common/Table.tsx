import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
}

export const Table = ({ children }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  );
};

interface TableHeaderProps {
  children: ReactNode;
}

export const TableHeader = ({ children }: TableHeaderProps) => {
  return <thead className="bg-gray-50">{children}</thead>;
};

interface TableBodyProps {
  children: ReactNode;
}

export const TableBody = ({ children }: TableBodyProps) => {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
};

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
}

export const TableRow = ({ children, onClick }: TableRowProps) => {
  return (
    <tr
      className={onClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children: ReactNode;
}

export const TableHead = ({ children }: TableHeadProps) => {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
};

interface TableCellProps {
  children: ReactNode;
}

export const TableCell = ({ children }: TableCellProps) => {
  return <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>;
};
