import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json

// Log every request
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/pms/tasks/', (req, res) => {
    try {
        res.send([
            {
                id: 1,
                title: 'Prepare Report', // Task Name
                description: 'Compile the monthly financial report.',
                case_number: 'CASE-001', // Case
                created_at: '2024-06-01T09:00:00Z', // Created On
                due_date: '2024-06-10T17:00:00Z', // Due Date
                assignee_name: 'Alice Smith', // Assigned To
                status: 'In Progress', // Status
            },
            {
                id: 2,
                title: 'Client Meeting',
                description: 'Meet with client to discuss project scope.',
                case_number: 'CASE-002',
                created_at: '2024-06-02T10:30:00Z',
                due_date: '2024-06-12T15:00:00Z',
                assignee_name: 'Bob Johnson',
                status: 'Due',
            },
            {
                id: 3,
                title: 'Review Contract',
                description: 'Review the new vendor contract for approval.',
                case_number: 'CASE-003',
                created_at: '2024-06-03T14:00:00Z',
                due_date: '2024-06-15T12:00:00Z',
                assignee_name: 'Charlie Lee',
                status: 'Done',
            },
            // Extra dummy tasks for pagination testing
            {
                id: 4,
                title: 'Draft Proposal',
                description: 'Draft the initial project proposal.',
                case_number: 'CASE-004',
                created_at: '2024-06-04T09:00:00Z',
                due_date: '2024-06-16T17:00:00Z',
                assignee_name: 'Dana White',
                status: 'Due',
            },
            {
                id: 5,
                title: 'Legal Review',
                description: 'Conduct legal review of documents.',
                case_number: 'CASE-005',
                created_at: '2024-06-05T11:00:00Z',
                due_date: '2024-06-18T15:00:00Z',
                assignee_name: 'Eve Black',
                status: 'In Progress',
            },
            {
                id: 6,
                title: 'Team Meeting',
                description: 'Weekly team sync-up.',
                case_number: 'CASE-006',
                created_at: '2024-06-06T13:00:00Z',
                due_date: '2024-06-20T10:00:00Z',
                assignee_name: 'Frank Green',
                status: 'Done',
            },
            {
                id: 7,
                title: 'Budget Planning',
                description: 'Plan the budget for Q3.',
                case_number: 'CASE-007',
                created_at: '2024-06-07T15:00:00Z',
                due_date: '2024-06-22T12:00:00Z',
                assignee_name: 'Grace Hopper',
                status: 'Over Due',
            },
            {
                id: 8,
                title: 'Client Feedback',
                description: 'Collect feedback from client.',
                case_number: 'CASE-008',
                created_at: '2024-06-08T10:00:00Z',
                due_date: '2024-06-24T16:00:00Z',
                assignee_name: 'Henry Ford',
                status: 'Due',
            },
        ]);
    } catch (err) {
        console.error('Error in /pms/tasks/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/pms/tasks/', (req, res) => {
    try {
        // In a real app, you would save the task to a database.
        // Here, just echo back the received data with a fake ID.
        const newTask = { id: Date.now(), ...req.body };
        res.status(201).send(newTask);
    } catch (err) {
        console.error('Error in POST /pms/tasks/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/pms/cases/', (req, res) => {
    try {
        res.send([
            {
                id: 1,
                case_number: 'CASE-001', // Case Number
                coming_up: 'Hearing on 2024-06-20', // Coming Up
                opened: '2024-05-01T09:00:00Z', // Opened
                last_updated: '2024-06-05T10:00:00Z', // Last Updated
                lawyer: 'Alice Smith', // Lawyer
                client: 'Acme Corp', // Client
                matter: 'Contract Dispute', // Matter
                case_documents: 3, // Case Documents (number of docs)
            },
            {
                id: 2,
                case_number: 'CASE-002',
                coming_up: 'Filing Deadline 2024-06-18',
                opened: '2024-05-10T11:30:00Z',
                last_updated: '2024-06-07T14:00:00Z',
                lawyer: 'Bob Johnson',
                client: 'Beta LLC',
                matter: 'Intellectual Property',
                case_documents: 5,
            },
            {
                id: 3,
                case_number: 'CASE-003',
                coming_up: 'Settlement Meeting 2024-06-25',
                opened: '2024-05-15T13:00:00Z',
                last_updated: '2024-06-09T16:00:00Z',
                lawyer: 'Charlie Lee',
                client: 'Gamma Inc',
                matter: 'Employment Law',
                case_documents: 2,
            },
        ]);
    } catch (err) {
        console.error('Error in /pms/cases/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/pms/matters/', (req, res) => {
    try {
        res.send([
            { id: 1, title: 'Matter 1' },
            { id: 2, title: 'Matter 2' }
        ]);
    } catch (err) {
        console.error('Error in /pms/matters/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/pms/employees/', (req, res) => {
    try {
        res.send([
            { id: 1, full_name: 'Alice Smith' },
            { id: 2, full_name: 'Bob Johnson' }
        ]);
    } catch (err) {
        console.error('Error in /pms/employees/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send({ error: 'Internal Server Error' });
});

app.listen(3001, () => {    
    console.log('Server is running on port 3001');
});