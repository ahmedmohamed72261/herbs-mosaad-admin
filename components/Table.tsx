import React, { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div className="glass-table-wrap overflow-x-auto">
        <table ref={ref} className={`w-full border-collapse ${className}`}>
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ children, className = '' }, ref) => {
    return (
      <thead
        ref={ref}
        className={`bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}
      >
        {children}
      </thead>
    );
  }
);

TableHead.displayName = 'TableHead';

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = '' }, ref) => {
    return (
      <tbody ref={ref} className={className}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className = '', hoverable = true }, ref) => {
    return (
      <tr
        ref={ref}
        className={`border-b border-gray-200 dark:border-gray-700 ${
          hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors' : ''
        } ${className}`}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className = '', header = false }, ref) => {
    const Component = header ? 'th' : 'td';

    return (
      <Component
        ref={ref as any}
        className={`px-6 py-3 ${
          header
            ? 'text-left text-sm font-semibold text-gray-900 dark:text-white'
            : 'text-sm text-gray-900 dark:text-gray-300'
        } ${className}`}
      >
        {children}
      </Component>
    );
  }
);

TableCell.displayName = 'TableCell';

export { Table, TableHead, TableBody, TableRow, TableCell };
