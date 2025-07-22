import React, { useState } from 'react';
import TasksTable from './TasksComponents/Tables/TasksTable.tsx';
import NewTaskModal from './TasksComponents/Modals/NewTaskModal.tsx';
import axiosInstance from '../services/httpService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, List, Grid, Loader } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  is_new?: boolean;
  [key: string]: any;
}

const Tasks: React.FC = () => {
  const [pendingSearch, setPendingSearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>(""); // For advanced filtering
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [layout, setLayout] = useState<"table" | "grid">("table");

  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await axiosInstance.get('pms/tasks/');
      if (response.status !== 200) throw new Error('Error fetching tasks');
      return response.data;
    },
  });

  const singleTaskUpdateMutation = useMutation({
    mutationFn: (task: Task) => axiosInstance.put(`/pms/tasks/${task.id}`, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const mutation = useMutation({
    mutationFn: (updatedTasks: Task[]) => {
      // This could be a single API call if your backend supports it,
      // otherwise, it's a series of calls.
      return Promise.all(updatedTasks.map(task => 
        axiosInstance.put(`/pms/tasks/${task.id}`, task)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (taskIds: number[]) => {
      return Promise.all(taskIds.map(id => 
        axiosInstance.delete(`/pms/tasks/${id}`)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const toggleLayout = (selectedLayout: "table" | "grid") => {
    setLayout(selectedLayout);
  };

  if (isLoading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm z-50">
      <Loader className="animate-spin" size={48} />
    </div>
  );
  if (isError) return <div className="text-red-500 text-center py-8">Error: {error?.message}</div>;

  return (
    <>
      <div className="px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <div className="flex w-full md:w-1/3 gap-0">
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="search"
              placeholder="Search Tasks"
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
            />
            <button
              type="button"
              className="bg-white px-3 py-2 me-2 border border-[#6c757d] rounded-r text-[#6c757d] hover:bg-[#6c757d] hover:text-black"
              onClick={() => setSearchQuery(pendingSearch)}
            >
              <Search size={18} />
            </button>
            <select
              className="px-2 py-2 border rounded"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Due">Due</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Over Due">Over Due</option>
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button
              className="bg-[#f58f7c] text-black px-3 py-2 rounded"
              onClick={() => toggleLayout("table")}
            >
              <List size={18} />
            </button>
            <button
              className="bg-[#f58f7c] text-black px-3 py-2 rounded "
              onClick={() => toggleLayout("grid")}
            >
              <Grid size={18} />
            </button>
            <button
              className="bg-[#f58f7c] text-black px-4 py-2 rounded "
              onClick={() => setModalShow(true)}
            >
              New Task
            </button>
          </div>
        </div>

        <TasksTable 
          tasks={tasks} 
          layout={layout} 
          searchQuery={searchQuery} 
          statusFilter={statusFilter}
          onBulkUpdate={(updatedTasks) => mutation.mutate(updatedTasks)}
          onBulkDelete={(taskIds) => deleteMutation.mutate(taskIds)}
          onTaskViewed={(task) => singleTaskUpdateMutation.mutate(task)}
        />
        <NewTaskModal show={modalShow} onHide={() => setModalShow(false)} />
      </div>
    </>
  );
};

export default Tasks;
