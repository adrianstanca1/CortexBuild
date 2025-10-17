// AI Chat Tools for CortexBuild
export interface ChatTool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: any;
  result?: any;
}

// Available chat tools
export const chatTools: ChatTool[] = [
  {
    name: 'get_project_status',
    description: 'Get the current status of a project',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project'
        }
      },
      required: ['projectId']
    },
    execute: async (params) => {
      // Mock project status
      return {
        projectId: params.projectId,
        status: 'active',
        progress: 75,
        budget: 500000,
        spent: 375000,
        timeline: 'on-track'
      };
    }
  },
  {
    name: 'create_task',
    description: 'Create a new task in a project',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project'
        },
        title: {
          type: 'string',
          description: 'The title of the task'
        },
        description: {
          type: 'string',
          description: 'The description of the task'
        },
        priority: {
          type: 'string',
          enum: ['Low', 'Medium', 'High'],
          description: 'The priority of the task'
        }
      },
      required: ['projectId', 'title']
    },
    execute: async (params) => {
      // Mock task creation
      return {
        taskId: `task-${Date.now()}`,
        title: params.title,
        description: params.description || '',
        priority: params.priority || 'Medium',
        status: 'To Do',
        createdAt: new Date().toISOString()
      };
    }
  },
  {
    name: 'get_team_availability',
    description: 'Get the availability of team members',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project (optional)'
        }
      }
    },
    execute: async (params) => {
      // Mock team availability
      return {
        available: [
          { id: 'user-1', name: 'John Manager', availability: 'available' },
          { id: 'user-2', name: 'Adrian ASC', availability: 'available' }
        ],
        busy: [
          { id: 'user-3', name: 'Sarah Supervisor', availability: 'busy' }
        ],
        offline: []
      };
    }
  }
];

// Execute a tool call
export const executeTool = async (toolName: string, parameters: any): Promise<any> => {
  const tool = chatTools.find(t => t.name === toolName);
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }
  
  return await tool.execute(parameters);
};

// Process chat message with tool calls
export const processChatMessage = async (message: string): Promise<ChatMessage> => {
  // Simple tool detection (in a real implementation, this would use AI)
  const toolCalls: ToolCall[] = [];
  
  // Check for project status requests
  if (message.toLowerCase().includes('project status')) {
    toolCalls.push({
      id: `call-${Date.now()}`,
      name: 'get_project_status',
      parameters: { projectId: 'project-1' }
    });
  }
  
  // Check for task creation requests
  if (message.toLowerCase().includes('create task')) {
    toolCalls.push({
      id: `call-${Date.now()}`,
      name: 'create_task',
      parameters: {
        projectId: 'project-1',
        title: 'New task from chat',
        priority: 'Medium'
      }
    });
  }
  
  // Execute tool calls
  for (const toolCall of toolCalls) {
    try {
      toolCall.result = await executeTool(toolCall.name, toolCall.parameters);
    } catch (error) {
      toolCall.result = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  return {
    role: 'assistant',
    content: generateResponse(message, toolCalls),
    timestamp: new Date().toISOString(),
    toolCalls
  };
};

// Generate response based on tool calls
const generateResponse = (message: string, toolCalls: ToolCall[]): string => {
  if (toolCalls.length === 0) {
    return "I understand your message. How can I help you with your construction project?";
  }
  
  let response = "I've processed your request:\n\n";
  
  for (const toolCall of toolCalls) {
    if (toolCall.result && !toolCall.result.error) {
      switch (toolCall.name) {
        case 'get_project_status':
          response += `Project Status: ${toolCall.result.status} (${toolCall.result.progress}% complete)\n`;
          response += `Budget: £${toolCall.result.spent.toLocaleString()} / £${toolCall.result.budget.toLocaleString()}\n`;
          break;
        case 'create_task':
          response += `Created new task: "${toolCall.result.title}" with ${toolCall.result.priority} priority\n`;
          break;
        case 'get_team_availability':
          response += `Team availability: ${toolCall.result.available.length} available, ${toolCall.result.busy.length} busy\n`;
          break;
      }
    } else {
      response += `Error executing ${toolCall.name}: ${toolCall.result?.error || 'Unknown error'}\n`;
    }
  }
  
  return response;
};

export default {
  chatTools,
  executeTool,
  processChatMessage
};
