#!/bin/bash

echo "Creating missing component files..."

# Create directories if they don't exist
mkdir -p components/kanban
mkdir -p components/project  
mkdir -p components/reminder
mkdir -p components/task
mkdir -p components/whiteboard
mkdir -p services

# Create kanban/kanbanBoard.tsx
cat > components/kanban/kanbanBoard.tsx << 'COMPONENT'
import React from 'react';

// TODO: Implement KanbanBoard component
export const KanbanBoard: React.FC<any> = (props) => {
  return <div>Kanban Board - Coming Soon</div>;
};

export default KanbanBoard;
COMPONENT

# Create project/CreateProjectModal.tsx
cat > components/project/CreateProjectModal.tsx << 'COMPONENT'
import React from 'react';

// TODO: Implement CreateProjectModal component
export const CreateProjectModal: React.FC<any> = (props) => {
  return <div>Create Project Modal</div>;
};

export default CreateProjectModal;
COMPONENT

# Create reminder/ReminderControl.tsx
cat > components/reminder/ReminderControl.tsx << 'COMPONENT'
import React from 'react';

// TODO: Implement ReminderControl component
export const ReminderControl: React.FC<any> = (props) => {
  return <div>Reminder Control</div>;
};

export default ReminderControl;
COMPONENT

# Create task/TaskModal.tsx
cat > components/task/TaskModal.tsx << 'COMPONENT'
import React from 'react';

// TODO: Implement TaskModal component
export const TaskModal: React.FC<any> = (props) => {
  return <div>Task Modal</div>;
};

export default TaskModal;
COMPONENT

# Create reminder/ReminderModal.tsx
cat > components/reminder/ReminderModal.tsx << 'COMPONENT'
import React from 'react';

// TODO: Implement ReminderModal component
export const ReminderModal: React.FC<any> = (props) => {
  return <div>Reminder Modal</div>;
};

export default ReminderModal;
COMPONENT

# Create whiteboard/WhiteboardView.tsx
cat > components/whiteboard/WhiteboardView.tsx << 'COMPONENT'
import React from 'react';

// TODO: Implement WhiteboardView component
export const WhiteboardView: React.FC<any> = (props) => {
  return <div>Whiteboard View - Coming Soon</div>;
};

export default WhiteboardView;
COMPONENT

# Create supabaseClient.ts
cat > services/supabaseClient.ts << 'SERVICE'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
SERVICE

echo "✅ All missing component files created!"
