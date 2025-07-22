import React from 'react';
import { Dialog } from '@headlessui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';
import axiosInstance from '../../../services/httpService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const EditTaskSchema = Yup.object().shape({
  title: Yup.string().min(2, "Too short").max(100, "Too long").required("Title is Required"),
  description: Yup.string().min(2, "Too short").max(500, "Too long").required("Description is Required"),
  assigned_to: Yup.string().required("Assignee is Required"),
  status: Yup.string().required('Status is Required'),
  due_date: Yup.date().nullable().required("Due Date is Required"),
  priority: Yup.string().required("Priority is Required"),
  caseId: Yup.string().required("Associated Case is Required"),
  matter: Yup.string().when('caseId', {
    is: (caseId) => !!caseId,
    then: () => Yup.string().required("Associated Matter is Required"),
    otherwise: () => Yup.string().nullable(),
  }),
});

const EditTaskModal = ({ show, onHide, taskData, onTaskUpdated, onTaskDeleted }) => {
  const queryClient = useQueryClient();

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

  const updateTaskMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axiosInstance.put(`/pms/tasks/${taskData.id}/`, values);
      if (response.status !== 200) throw new Error('Failed to update task');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tasks']);
      Swal.fire('Success!', 'Task updated successfully!', 'success');
      onTaskUpdated?.(data);
      onHide();
    },
    onError: (error) => Swal.fire('Error!', error.message || 'Could not update task.', 'error')
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete(`/pms/tasks/${taskData.id}/`);
      if (response.status !== 204) throw new Error('Failed to delete task');
      return taskData.id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries(['tasks']);
      Swal.fire('Deleted!', 'Task has been deleted.', 'success');
      onTaskDeleted?.(deletedId);
      onHide();
    },
    onError: (error) => Swal.fire('Error!', error.message || 'Could not delete task.', 'error')
  });

  if (!taskData) return null;

  const getInitialValues = () => {
    const initialCase = cases.find(c => c.id === (taskData.case || taskData.caseId));
    const initialMatterId = initialCase ? initialCase.matter : (taskData.matter?.id || taskData.matter);
    return {
      title: taskData.title || "",
      priority: taskData.priority || "",
      description: taskData.description || "",
      assigned_to: taskData.assigned_to?.id || taskData.assigned_to || "",
      due_date: taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : "",
      status: taskData.status || "",
      caseId: initialCase?.id || "",
      matter: initialMatterId || "",
    };
  };

  const handleCaseChange = (event, setFieldValue, currentMatters) => {
    const selectedCaseId = event.target.value;
    const selectedCase = cases.find(c => c.id === selectedCaseId);
    setFieldValue('caseId', selectedCaseId);
    setFieldValue('matter', selectedCase ? (currentMatters.find(m => m.id === selectedCase.matter)?.id || '') : '');
  };

  if (casesLoading || mattersLoading || employeesLoading) {
    return (
      <Dialog open={show} onClose={onHide} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl text-center text-lg">
            Loading task details...
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={show} onClose={onHide} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl">
          <Dialog.Title className="text-2xl font-bold mb-4 text-center">Edit Task: {taskData.title}</Dialog.Title>
          <Formik
            initialValues={getInitialValues()}
            validationSchema={EditTaskSchema}
            onSubmit={updateTaskMutation.mutate}
            enableReinitialize
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block font-medium mb-1">Title</label>
                    <Field name="title" type="text" className={`w-full px-3 py-2 border rounded ${errors.title && touched.title ? 'border-red-500' : ''}`} />
                    <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="priority" className="block font-medium mb-1">Priority</label>
                    <Field name="priority" as="select" className={`w-full px-3 py-2 border rounded ${errors.priority && touched.priority ? 'border-red-500' : ''}`}>
                      <option value="">Select Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </Field>
                    <ErrorMessage name="priority" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block font-medium mb-1">Description</label>
                  <Field name="description" as="textarea" rows={3} className={`w-full px-3 py-2 border rounded ${errors.description && touched.description ? 'border-red-500' : ''}`} />
                  <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="assigned_to" className="block font-medium mb-1">Assign To</label>
                    <Field name="assigned_to" as="select" className={`w-full px-3 py-2 border rounded ${errors.assigned_to && touched.assigned_to ? 'border-red-500' : ''}`}>
                      <option value="">Select User</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="assigned_to" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="due_date" className="block font-medium mb-1">Due Date</label>
                    <Field name="due_date" type="date" className={`w-full px-3 py-2 border rounded ${errors.due_date && touched.due_date ? 'border-red-500' : ''}`} />
                    <ErrorMessage name="due_date" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>
                <div>
                  <label htmlFor="status" className="block font-medium mb-1">Status</label>
                  <Field name="status" as="select" className={`w-full px-3 py-2 border rounded ${errors.status && touched.status ? 'border-red-500' : ''}`}>
                    <option value="">Select Status</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Pending Review">Pending Review</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="caseId" className="block font-medium mb-1">Related Case</label>
                    <Field name="caseId" as="select" className={`w-full px-3 py-2 border rounded ${errors.caseId && touched.caseId ? 'border-red-500' : ''}`} onChange={(e) => handleCaseChange(e, setFieldValue, matters)}>
                      <option value="">Select Case</option>
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>{c.caseNumber}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="caseId" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="matter" className="block font-medium mb-1">Related Matter</label>
                    <Field name="matter" as="select" disabled className={`w-full px-3 py-2 border rounded ${errors.matter && touched.matter ? 'border-red-500' : ''}`}>
                      {values.matter ? (
                        <option value={values.matter}>{matters.find(m => m.id === values.matter)?.title || 'Loading...'}</option>
                      ) : (
                        <option value="">Select a case first</option>
                      )}
                    </Field>
                    <ErrorMessage name="matter" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => deleteTaskMutation.mutate()}
                    disabled={deleteTaskMutation.isLoading || updateTaskMutation.isLoading}
                  >
                    {deleteTaskMutation.isLoading ? 'Deleting...' : 'Delete Task'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={onHide}
                      disabled={updateTaskMutation.isLoading || deleteTaskMutation.isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      disabled={updateTaskMutation.isLoading || deleteTaskMutation.isLoading}
                    >
                      {updateTaskMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditTaskModal;
