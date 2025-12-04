export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type AuthType = 'none' | 'bearer' | 'api-key' | 'basic';

export interface ToolParameter {
  id: string;
  name: string;
  type: FieldType;
  description: string;
  required: boolean;
  defaultValue?: string | number | boolean;
  enum?: string[]; // For dropdown options
  pattern?: string; // Regex pattern for validation
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface ToolAuthentication {
  type: AuthType;
  headerName?: string; // For api-key type
  token?: string; // For bearer or api-key
  username?: string; // For basic auth
  password?: string; // For basic auth
}

export interface ToolResponse {
  successPath?: string; // JSON path to extract success data (e.g., "data.result")
  errorPath?: string; // JSON path to extract error message
  transformTemplate?: string; // Template for transforming response
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  triggerPrompt: string; // When should the AI use this tool
  isEnabled: boolean;
  
  // API Configuration
  apiEndpoint: string;
  httpMethod: HttpMethod;
  headers?: Record<string, string>;
  authentication?: ToolAuthentication;
  
  // Parameters
  parameters: ToolParameter[];
  
  // Response handling
  responseConfig?: ToolResponse;
  
  // Examples
  exampleRequest?: string; // JSON string
  exampleResponse?: string; // JSON string
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  usageCount?: number;
  
  // Rate limiting
  rateLimitPerMinute?: number;
  timeout?: number; // in seconds
}

export interface ToolCallLog {
  id: string;
  toolId: string;
  toolName: string;
  chatbotId: string;
  timestamp: string;
  parameters: Record<string, unknown>;
  response: unknown;
  success: boolean;
  error?: string;
  duration: number; // in milliseconds
}

