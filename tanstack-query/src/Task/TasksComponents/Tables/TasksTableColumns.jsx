import {formatStatus, formatDate} from './TasksTable'
import { Eye, Pencil, Trash } from 'lucide-react';

const tasksTableColumns = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
    enableColumnFilter: false,
    size: 40,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      // Get handlers from table.options.meta
      const { onView, onEdit, onDelete } = table.options.meta || {};
      return (
        <div className="flex gap-2">
          <button
            className="px-1 text-gray-600 hover:text-blue-600"
            title="View"
            onClick={() => onView && onView(row.original)}
          >
            <Eye size={18} />
          </button>
          <button
            className="px-1 text-gray-600 hover:text-green-600"
            title="Edit"
            onClick={() => onEdit && onEdit(row.original)}
          >
            <Pencil size={18} />
          </button>
          <button
            className="px-1 text-gray-600 hover:text-red-600"
            title="Delete"
            onClick={() => onDelete && onDelete(row.original.id)}
          >
            <Trash size={18} />
          </button>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    size: 120,
  },
  {
    accessorKey: 'title',
    header: 'Task Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'case_number',
    header: 'Case',
  },
  {
    accessorKey: 'created_at',
    header: 'Created On',
    cell: info => formatDate(info.getValue()),
  },
  {
    accessorKey: 'due_date',
    header: 'Due Date',
    cell: info => formatDate(info.getValue()),
  },
  {
    accessorKey: 'assignee_name',
    header: 'Assigned To',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: info => formatStatus(info.getValue()),
  },
];

export default tasksTableColumns;