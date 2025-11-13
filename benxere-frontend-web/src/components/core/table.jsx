import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Typography from './typography';
import Button from './button';
import Loader from './loader';

const Table = ({
  columns,
  data,
  isLoading = false,
  sortable = true,
  pagination = true,
  pageSize = 10,
  className = '',
  onSort,
  emptyMessage = 'No data available',
  rowClassName,
  onRowClick,
  selectedRow,
  stickyHeader = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  // Pagination logic
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination ? data.slice(startIndex, endIndex) : data;

  // Sorting logic
  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    if (onSort) {
      onSort(key, direction);
    }
  };

  const tableClasses = twMerge(
    'min-w-full divide-y divide-gray-200',
    className
  );

  const headerClasses = twMerge(
    'bg-gray-50',
    stickyHeader && 'sticky top-0 z-10'
  );

  const thClasses = (column) =>
    twMerge(
      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      sortable && column.sortable !== false && 'cursor-pointer hover:text-gray-700',
      column.className
    );

  const tdClasses = (column) =>
    twMerge(
      'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
      column.className
    );

  const renderSortIcon = (column) => {
    if (!sortable || column.sortable === false) return null;
    
    if (sortConfig.key === column.key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return ' ↕';
  };

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between w-full">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{' '}
            {data.length} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full text-center py-8">
        <Typography variant="body2" color="muted">
          {emptyMessage}
        </Typography>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={tableClasses}>
        <thead className={headerClasses}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={thClasses(column)}
                onClick={() => handleSort(column.key)}
              >
                {column.title}
                {renderSortIcon(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedData.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={twMerge(
                'hover:bg-gray-50',
                onRowClick && 'cursor-pointer',
                selectedRow === row.id && 'bg-primary-50',
                rowClassName && rowClassName(row)
              )}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <td key={column.key} className={tdClasses(column)}>
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  );
};

export default Table;