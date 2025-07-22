import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { CalendarCheck, Clock, AlertTriangle, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../services/httpService';

const ViewTaskModal = ({ show, onHide, taskData, onTaskViewed }) => {
  const [showReminder, setShowReminder] = useState(false);
  const [hasMarkedViewed, setHasMarkedViewed] = useState(false);

  useEffect(() => {
    if (taskData && taskData.is_new && !hasMarkedViewed) {
      onTaskViewed({ ...taskData, is_new: false });
      setHasMarkedViewed(true);
    }
  }, [taskData, onTaskViewed, hasMarkedViewed]);

  useEffect(() => {
    setHasMarkedViewed(false);
  }, [taskData?.id]);

  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => (await axiosInstance.get('pms/cases/')).data
  });
  const { data: matters = [], isLoading: mattersLoading } = useQuery({
    queryKey: ['matters'],
    queryFn: async () => (await axiosInstance.get('pms/matters/')).data
  });
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await axiosInstance.get('pms/employees/')).data
  });

  if (!taskData) return null;
  if (casesLoading || mattersLoading || employeesLoading) {
    return (
      <Dialog open={show} onClose={onHide} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white p-6 rounded shadow-xl text-center text-lg">
            Loading task details...
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }

  const caseObj = cases.find(c => c.id === (taskData.case || taskData.caseId));
  const matterObj = matters.find(m => m.id === (caseObj ? caseObj.matter : taskData.matter));
  const assigneeObj = employees.find(e => e.id === (taskData.assigned_to || taskData.assignee));

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const statusInfo = {
    over_due: { color: 'bg-red-500', label: 'Overdue', icon: <AlertTriangle size={16} /> },
    completed: { color: 'bg-green-500', label: 'Completed', icon: <CalendarCheck size={16} /> },
    in_progress: { color: 'bg-blue-500', label: 'In Progress', icon: <Clock size={16} /> },
    pending: { color: 'bg-yellow-500', label: 'Pending', icon: <Clock size={16} /> },
  }[taskData.status] || { color: 'bg-gray-500', label: taskData.status || 'Unknown', icon: <Clock size={16} /> };

  const priorityColor = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  }[taskData.priority?.toLowerCase()] || 'bg-gray-400';

  const handleSendReminder = () => {
    setShowReminder(true);
    setTimeout(() => setShowReminder(false), 3000);
  };

  return (
    <Dialog open={show} onClose={onHide} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-xl font-semibold">
              {taskData.title}
              <span className={`text-white text-sm px-2 py-1 rounded ${priorityColor}`}>{taskData.priority}</span>
            </div>
            <button onClick={onHide} className="text-gray-500 hover:text-black">✕</button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm font-medium text-gray-600">Case</div>
              <div className="text-base">{caseObj?.caseNumber || '-'}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Matter</div>
              <div className="text-base">{matterObj?.title || '-'}</div>
            </div>
            <div className="flex justify-end items-start">
              <span className={`flex items-center gap-2 text-white text-sm px-3 py-1 rounded ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-600">Description</div>
            <div className="bg-gray-100 p-3 rounded text-sm">{taskData.description}</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600">Assignee</div>
              <div className="text-base">{assigneeObj?.full_name || '-'}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Due Date</div>
              <div className="text-base">{formatDate(taskData.due_date)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Created</div>
              <div className="text-base">{formatDate(taskData.created_at)}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Updated</div>
              <div className="text-base">{formatDate(taskData.updated_at)}</div>
            </div>
          </div>

          {showReminder && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded text-sm">
              Reminder sent to {assigneeObj?.full_name || 'assignee'}!
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={onHide}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={handleSendReminder}
              disabled={showReminder}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={16} className="inline mr-2" />
              Send Reminder
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ViewTaskModal;
