import React from 'react';
import { Dialog } from '@headlessui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';
import axiosInstance from '../../../services/httpService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const NewTaskModal = ({ show, onHide }) => {
  const queryClient = useQueryClient();

  const initialValues = {
    title: "",
    priority: "",
    description: "",
    assigned_to: "",
    due_date: "",
    status: "",
    caseId: "",
    matter: ""
  };

  const newTaskSchema = Yup.object().shape({
    title: Yup.string().min(2).max(50).required("Title is Required"),
    description: Yup.string().min(2).max(300).required("Description is Required"),
    assigned_to: Yup.string().required("Assigned to is Required"),
    status: Yup.string().required("Please select status"),
    due_date: Yup.date().required("Due Date is Required"),
    priority: Yup.string().required("Priority is Required"),
    caseId: Yup.string().required("Case is Required"),
    matter: Yup.string().nullable()
  });

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

  const { mutate: createTaskMutate, status: createTaskStatus } = useMutation<any, Error, typeof initialValues>({
    mutationFn: async (values: typeof initialValues) => {
      const response = await axiosInstance.post('pms/tasks/', values);
      if (response.status !== 201) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      Swal.fire('Good job!', 'You have created a new Task', 'success');
      onHide();
    },
    onError: (error: any) => {
      Swal.fire('Error', error.message, 'error');
    }
  });

  // Removed the separate isLoading assignment because createTaskMutation.isLoading is not recognized

  const handleCaseChange = (event, setFieldValue) => {
    const selectedCaseId = event.target.value;
    const selectedCase = cases.find(c => c.id === selectedCaseId);
    setFieldValue('caseId', selectedCaseId);
    if (selectedCase) {
      const selectedMatter = matters.find(m => m.id === selectedCase.matter);
      setFieldValue('matter', selectedMatter ? selectedMatter.id : '');
    } else {
      setFieldValue('matter', '');
    }
  };

  if (casesLoading || mattersLoading || employeesLoading) {
    return (
      <Dialog open={show} onClose={onHide} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl text-center text-lg">
            Loading form data...
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={show} onClose={onHide} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl">
          <Dialog.Title className="text-2xl font-bold mb-4 text-center">New Task</Dialog.Title>
          <Formik
            initialValues={initialValues}
            validationSchema={newTaskSchema}
            onSubmit={(values, { resetForm, setSubmitting }) => {
              createTaskMutate(values, {
                onSettled: () => setSubmitting(false)
              });
              resetForm();
            }}
          >
            {({ errors, touched, setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block font-medium mb-1">Title</label>
                    <Field type="text" name="title" className="w-full px-3 py-2 border rounded" />
                    <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="priority" className="block font-medium mb-1">Priority</label>
                    <Field as="select" name="priority" className="w-full px-3 py-2 border rounded">
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
                  <Field as="textarea" name="description" className="w-full px-3 py-2 border rounded" />
                  <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="assigned_to" className="block font-medium mb-1">Assign To</label>
                    <Field as="select" name="assigned_to" className="w-full px-3 py-2 border rounded">
                      <option value="">Select User</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="assigned_to" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="due_date" className="block font-medium mb-1">Due Date</label>
                    <Field type="date" name="due_date" className="w-full px-3 py-2 border rounded" />
                    <ErrorMessage name="due_date" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>
                <div>
                  <label htmlFor="status" className="block font-medium mb-1">Task Status</label>
                  <Field as="select" name="status" className="w-full px-3 py-2 border rounded">
                    <option value="">Select Status</option>
                    <option value="Due">Due</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="caseId" className="block font-medium mb-1">Assign to case</label>
                    <Field
                      as="select"
                      name="caseId"
                      className="w-full px-3 py-2 border rounded"
                      onChange={(e) => handleCaseChange(e, setFieldValue)}
                    >
                      <option value="">Select Case</option>
                      {cases.map(singleCase => (
                        <option key={singleCase.id} value={singleCase.id}>{singleCase.caseNumber}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="caseId" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="matter" className="block font-medium mb-1">Assign to matter</label>
                    <Field as="select" name="matter" disabled className="w-full px-3 py-2 border rounded">
                      <option value="">Select a case first</option>
                      {matters.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </Field>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={onHide}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    disabled={isSubmitting || createTaskStatus === 'pending'}
                  >
                    {createTaskStatus === 'pending' ? 'Submitting...' : 'Save'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default NewTaskModal;
