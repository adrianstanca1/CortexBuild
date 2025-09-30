import React from 'react';

export interface KanbanBoardProps {
  className?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ className }) => {
  return (
    <div className={className}>
      <h2>Kanban Board</h2>
      <p>Kanban board implementation coming soon...</p>
    </div>
  );
};

export default KanbanBoard;
