
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Project A', budget: 4000, actual: 2400 },
  { name: 'Project B', budget: 3000, actual: 1398 },
  { name: 'Project C', budget: 2000, actual: 9800 },
  { name: 'Project D', budget: 2780, actual: 3908 },
  { name: 'Project E', budget: 1890, actual: 4800 },
  { name: 'Project F', budget: 2390, actual: 3800 },
  { name: 'Project G', budget: 3490, actual: 4300 },
];

const Dashboard: React.FC = () => {
  return (
    <>
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Active Projects</Card.Title>
              <Card.Text className="fs-2">12</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Overdue Tasks</Card.Title>
              <Card.Text className="fs-2">5</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Budget vs. Actual</Card.Title>
              <Card.Text className="fs-2">$1.2M / $1.1M</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Project Budgets</Card.Title>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#8884d8" />
                  <Bar dataKey="actual" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
