import React, { useEffect, useRef } from 'react';
import {formatStatus, formatDate} from './TasksTable.tsx'
// import { Eye, Pencil, Trash } from 'lucide-react';

function SelectAllCheckbox({ table }: { table: any }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = table.getIsSomeRowsSelected();
    }
  }, [table.getIsSomeRowsSelected()]);

  return (
    <input
      type="checkbox"
      ref={ref}
      checked={table.getIsAllRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  );
}

const tasksTableColumns = [
  {
    id: 'select',
    header: ({ table }) => <SelectAllCheckbox table={table} />,
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
    accessorKey: 'title',
    header: 'Task Name',
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original.is_new && <span className="mr-2 inline-block w-3 h-3 rounded-full bg-red-500" title="New" />}
        {row.original.title}
      </div>
    ),
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
