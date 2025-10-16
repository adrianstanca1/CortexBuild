
import React from 'react';
import { Badge, Card, Table } from 'react-bootstrap';

const projects = [
  { id: 1, name: 'Downtown Tower', status: 'In Progress', progress: 60 },
  { id: 2, name: 'Suburban Mall', status: 'Completed', progress: 100 },
  { id: 3, name: 'Residential Complex', status: 'On Hold', progress: 20 },
  { id: 4, name: 'Office Park', status: 'In Progress', progress: 80 },
  { id: 5, name: 'Bridge Renovation', status: 'Planning', progress: 10 },
];

const Projects: React.FC = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Badge bg="primary">In Progress</Badge>;
      case 'Completed':
        return <Badge bg="success">Completed</Badge>;
      case 'On Hold':
        return <Badge bg="warning">On Hold</Badge>;
      case 'Planning':
        return <Badge bg="info">Planning</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Projects</Card.Title>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>{getStatusBadge(project.status)}</td>
                <td>{project.progress}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default Projects;
