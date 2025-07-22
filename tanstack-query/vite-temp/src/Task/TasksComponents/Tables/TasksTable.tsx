import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import columns from './TasksTableColumns.tsx';
import EditTaskModal from '../Modals/EditTaskModal.tsx';
import ViewTaskModal from '../Modals/ViewTaskModal.tsx';
// import { Eye, Pencil, Trash } from 'lucide-react';

export const formatDate = (dateStr) => {
  const dateObj = new Date(dateStr);
  const options = { weekday: 'long' as const, day: 'numeric' as const, month: 'long' as const };
  return dateObj.toLocaleDateString('en-US', options);
};

export const formatStatus = (status) => {
  const base = 'inline-block rounded px-2 py-1 text-xs font-semibold';
  switch (status) {
    case 'Due':
      return <span className={`${base} bg-yellow-400 text-black`}>{status}</span>;
    case 'In Progress':
      return <span className={`${base} bg-blue-500 text-white`}>{status}</span>;
    case 'Done':
      return <span className={`${base} bg-green-300 text-black`}>{status}</span>;
    case 'Over Due':
    case 'over_due':
      return <span className={`${base} bg-red-500 text-white`}>{status}</span>;
    default:
      return <span className={`${base} bg-gray-300 text-black`}>{status}</span>;
  }
};

const TasksTable = ({ tasks, layout = "table", searchQuery = '', statusFilter = '', onBulkUpdate, onBulkDelete, onTaskViewed }) => {
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [currentTaskForEdit, setCurrentTaskForEdit] = useState(null);
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false);
  const [currentTaskForView, setCurrentTaskForView] = useState(null);
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const [completionFilter, setCompletionFilter] = useState('all'); // 'all', 'outstanding', 'completed'

  // Add handlers for grid actions
  const handleOpenEditTaskModal = (taskObjectFromRow) => {
    setCurrentTaskForEdit(taskObjectFromRow);
    setIsEditTaskModalOpen(true);
  };

  const handleCloseEditTaskModal = () => {
    setIsEditTaskModalOpen(false);
    setCurrentTaskForEdit(null);
  };

  const handleOpenViewTaskModal = (taskObject) => {
    setCurrentTaskForView(taskObject);
    setIsViewTaskModalOpen(true);
  };

  const handleCloseViewTaskModal = () => {
    setIsViewTaskModalOpen(false);
    setCurrentTaskForView(null);
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (searchQuery) {
      filtered = filtered.filter(task =>
        Object.values(task).some(value => {
          if (value !== null && typeof value === 'string') {
            return value.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return false;
        })
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(task => (task.status || '').toLowerCase() === statusFilter.toLowerCase());
    }
    if (completionFilter !== 'all') {
      if (completionFilter === 'completed') {
        filtered = filtered.filter(task => (task.status || '').toLowerCase() === 'done');
      } else { // outstanding
        filtered = filtered.filter(task => (task.status || '').toLowerCase() !== 'done');
      }
    }
    return filtered;
  }, [tasks, searchQuery, statusFilter, completionFilter]);

  // Dummy delete handler for demonstration (replace with your actual logic)
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      // Implement your delete logic here
      alert('Task deleted: ' + taskId);
    }
  };

  const table = useReactTable({
    data: filteredTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    // Optionally, enable multi-row selection
    // enableMultiRowSelection: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    meta: {
      onView: handleOpenViewTaskModal,
      onEdit: handleOpenEditTaskModal,
      onDelete: handleDeleteTask,
    },
  });

  const handleBulkDelete = () => {
    const selectedTaskIds = Object.keys(rowSelection).map(Number);
    if (selectedTaskIds.length > 0) {
      onBulkDelete(selectedTaskIds);
      setRowSelection({});
    }
  };

  const handleBulkMarkAsCompleted = () => {
    const selectedTaskIds = Object.keys(rowSelection).map(Number);
    const tasksToUpdate = tasks.filter(task => selectedTaskIds.includes(task.id))
      .map(task => ({ ...task, status: 'Done' }));

    if (tasksToUpdate.length > 0) {
      onBulkUpdate(tasksToUpdate);
      setRowSelection({});
    }
  };
  
  const handleBulkMarkAsOutstanding = () => {
    const selectedTaskIds = Object.keys(rowSelection).map(Number);
    const tasksToUpdate = tasks.filter(task => selectedTaskIds.includes(task.id))
      .map(task => ({ ...task, status: 'In Progress' }));

    if (tasksToUpdate.length > 0) {
      onBulkUpdate(tasksToUpdate);
      setRowSelection({});
    }
  };

  const handleBulkMarkAsRead = () => {
    const selectedTaskIds = Object.keys(rowSelection).map(Number);
    const tasksToUpdate = tasks.filter(task => selectedTaskIds.includes(task.id))
      .map(task => ({ ...task, is_new: false }));

    if (tasksToUpdate.length > 0) {
      onBulkUpdate(tasksToUpdate);
      setRowSelection({});
    }
  };

  const handleBulkUnmarkAsRead = () => {
    const selectedTaskIds = Object.keys(rowSelection).map(Number);
    const tasksToUpdate = tasks.filter(task => selectedTaskIds.includes(task.id))
      .map(task => ({ ...task, is_new: true }));

    if (tasksToUpdate.length > 0) {
      onBulkUpdate(tasksToUpdate);
      setRowSelection({});
    }
  };

  // Add grid pagination and selection state
  const [gridPage, setGridPage] = useState(0);
  const [gridPageSize, setGridPageSize] = useState(10);
  // Removed separate selectedGridTasks state and use rowSelection instead
  // const [selectedGridTasks, setSelectedGridTasks] = useState<number[]>([]);
  const gridPageCount = Math.ceil(filteredTasks.length / gridPageSize);
  const paginatedTasks = filteredTasks.slice(gridPage * gridPageSize, (gridPage + 1) * gridPageSize);
  const handleGridPrevPage = () => setGridPage(p => Math.max(0, p - 1));
  const handleGridNextPage = () => setGridPage(p => Math.min(gridPageCount - 1, p + 1));
  const handleGridTaskSelect = (taskId: number) => {
    setRowSelection((prevSelection) => {
      const newSelection = { ...prevSelection };
      if (newSelection[taskId]) {
        delete newSelection[taskId];
      } else {
        newSelection[taskId] = true;
      }
      return newSelection;
    });
  };
  
  const handleCompletionFilter = (filter) => {
    setCompletionFilter(current => (current === filter ? 'all' : filter));
  };

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = paginatedTasks.some(task => rowSelection[task.id]) && !paginatedTasks.every(task => rowSelection[task.id]);
    }
  }, [paginatedTasks, rowSelection]);

  return (
    <div className="w-full px-2">
      <div className="flex flex-wrap md:flex-nowrap w-full mb-4 gap-2">
        <div className="flex w-full md:w-full">
          <button 
            className={`bg-[#6c757d] text-white px-3 w-full py-1 rounded-l hover:bg-[#5a6268] ${completionFilter === 'outstanding' ? 'bg-[#5a6268]' : ''}`}
            onClick={() => handleCompletionFilter('outstanding')}
          >
            Outstanding
          </button>
          <button 
            className={`bg-[#6c757d] text-white px-3 w-full py-1 rounded-r hover:bg-[#5a6268] ${completionFilter === 'completed' ? 'bg-[#5a6268]' : ''}`}
            onClick={() => handleCompletionFilter('completed')}
          >
            Completed
          </button>
        </div>
        {Object.keys(rowSelection).length > 0 && (
          <div className="relative">
            <select 
              className="bg-[#5a6268] text-white px-3 py-1 rounded"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const action = e.target.value;
                if (action === 'delete') handleBulkDelete();
                if (action === 'completed') handleBulkMarkAsCompleted();
                if (action === 'outstanding') handleBulkMarkAsOutstanding();
                if (action === 'markAsRead') handleBulkMarkAsRead();
                if (action === 'unmarkAsRead') handleBulkUnmarkAsRead();
                e.target.value = ''; // Reset select
              }}
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete Selected</option>
              <option value="completed">Mark as Completed</option>
              <option value="outstanding">Mark as Outstanding</option>
              <option value="markAsRead">Mark as Read</option>
              <option value="unmarkAsRead">Unmark as Read</option>
            </select>
          </div>
        )}
        {/* Removed internal search/filter input for clarity */}
      </div>

      <div className="relative">
        <div className="overflow-x-auto" style={{ maxHeight: '440px', overflowY: 'auto' }}>
          {layout === "table" ? (
            <table className="min-w-full table-auto border">
              <thead className="bg-gray-100">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-4 py-2 text-left border-b">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 cursor-pointer"
            onClick={(e: React.MouseEvent<HTMLTableRowElement>) => {
              if ((e.target as HTMLInputElement).type !== 'checkbox') {
                handleOpenViewTaskModal(row.original);
              }
            }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-2 border-b">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>
              {/* Grid Select All Checkbox */}
              <div className="flex items-center mb-2 p-2 bg-gray-100 rounded border border-gray-300 w-max">
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  checked={paginatedTasks.length > 0 && paginatedTasks.every(task => rowSelection[task.id])}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      const newSelection = { ...rowSelection };
                      paginatedTasks.forEach(task => {
                        newSelection[task.id] = true;
                      });
                      setRowSelection(newSelection);
                    } else {
                      const newSelection = { ...rowSelection };
                      paginatedTasks.forEach(task => {
                        delete newSelection[task.id];
                      });
                      setRowSelection(newSelection);
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm font-semibold text-gray-700">Select All</span>
              </div>
              {/* Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedTasks.map(task => (
                  <div className="border rounded p-4 shadow bg-white flex flex-col justify-between cursor-pointer" key={task.id} onClick={() => handleOpenViewTaskModal(task)}>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={!!rowSelection[task.id]}
                        onChange={() => handleGridTaskSelect(task.id)}
                        className="mr-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-xs text-gray-500">Select</span>
                    </div>
                    {/* Removed Actions buttons */}
                    <div className="mb-1">
                      <span className="font-bold">Task Name: </span>
                      {task.title}
                      {task.is_new && <span className="ml-2 badge bg-success">New</span>}
                    </div>
                    <div className="mb-1"><span className="font-bold">Description: </span>{task.description}</div>
                    <div className="mb-1"><span className="font-bold">Case: </span>{task.case_number}</div>
                    <div className="mb-1"><span className="font-bold">Created On: </span>{formatDate(task.created_at)}</div>
                    <div className="mb-1"><span className="font-bold">Due Date: </span>{formatDate(task.due_date)}</div>
                    <div className="mb-1"><span className="font-bold">Assigned To: </span>{task.assignee_name}</div>
                    <div className="mb-1"><span className="font-bold">Status: </span>{formatStatus(task.status)}</div>
                  </div>
                ))}
              </div>
              {/* Pagination Controls for Grid */}
              {filteredTasks.length > 5 && (
                <div className="flex justify-between items-center px-2 py-2 bg-white border-t sticky bottom-0 z-10" style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.03)' }}>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      onClick={handleGridPrevPage}
                      disabled={gridPage === 0}
                    >
                      Previous
                    </button>
                    <span>
                      Page {gridPage + 1} of {gridPageCount}
                    </span>
                    <button
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      onClick={handleGridNextPage}
                      disabled={gridPage >= gridPageCount - 1}
                    >
                      Next
                    </button>
                  </div>
                  <div>
                    <select
                      className="px-2 py-1 border rounded"
                      value={gridPageSize}
                      onChange={e => setGridPageSize(Number(e.target.value))}
                    >
                      {[5, 10, 15, 20, 50].map(size => (
                        <option key={size} value={size}>
                          Show {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {layout === "table" && filteredTasks.length > 5 ? (
        <div className="flex justify-between items-center px-2 py-2 bg-white border-t sticky bottom-0 z-10" style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.03)' }}>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
          <div>
            <select
              className="px-2 py-1 border rounded"
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 15, 20, 50].map(size => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {isEditTaskModalOpen && currentTaskForEdit && (
        <EditTaskModal
          show={isEditTaskModalOpen}
          onHide={handleCloseEditTaskModal}
          taskData={currentTaskForEdit}
          onTaskUpdated={() => {}}
          onTaskDeleted={() => {}}
        />
      )}
      {isViewTaskModalOpen && currentTaskForView && (
        <ViewTaskModal
          show={isViewTaskModalOpen}
          onHide={handleCloseViewTaskModal}
          taskData={currentTaskForView}
          onTaskViewed={onTaskViewed}
          onEdit={handleOpenEditTaskModal}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default TasksTable;
