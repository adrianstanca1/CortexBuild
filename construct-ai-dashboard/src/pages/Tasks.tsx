
import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const tasks = [
  { id: 1, name: 'Finalize blueprints for Downtown Tower', status: 'In Progress' },
  { id: 2, name: 'Procure materials for Suburban Mall', status: 'Completed' },
  { id: 3, name: 'Hire subcontractors for Residential Complex', status: 'Overdue' },
  { id: 4, name: 'Client meeting for Office Park', status: 'In Progress' },
  { id: 5, name: 'Submit permits for Bridge Renovation', status: 'Pending' },
];

const Tasks: React.FC = () => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Tasks</Card.Title>
        <ListGroup>
          {tasks.map((task) => (
            <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-start">
              <div className="ms-2 me-auto">
                <div className="fw-bold">{task.name}</div>
              </div>
              <span className={`badge bg-${task.status === 'Completed' ? 'success' : task.status === 'Overdue' ? 'danger' : 'primary'} rounded-pill`}>
                {task.status}
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default Tasks;
