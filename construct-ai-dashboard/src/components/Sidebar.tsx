
import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaFolder, FaTasks } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', height: '100vh' }}>
      <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4">ConstructAI</span>
      </a>
      <hr />
      <Nav variant="pills" className="flex-column mb-auto">
        <Nav.Item>
          <Nav.Link as={NavLink} to="/dashboard" className="text-white">
            <FaTachometerAlt className="me-2" />
            Dashboard
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={NavLink} to="/projects" className="text-white">
            <FaFolder className="me-2" />
            Projects
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={NavLink} to="/tasks" className="text-white">
            <FaTasks className="me-2" />
            Tasks
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;
