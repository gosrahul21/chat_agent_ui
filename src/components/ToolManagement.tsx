import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Power,
  PowerOff,
  ChevronDown,
  ChevronUp,
  Zap,
  Code,
  Save,
  X,
} from 'lucide-react';
import type { Tool, ToolParameter, HttpMethod, FieldType, AuthType } from '../types/tool';

interface ToolManagementProps {
  tools: Tool[];
  onUpdateTools: (tools: Tool[]) => void;
}

export default function ToolManagement({ tools, onUpdateTools }: ToolManagementProps) {
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const handleCreateTool = () => {
    const newTool: Tool = {
      id: `tool_${Date.now()}`,
      name: '',
      description: '',
      triggerPrompt: '',
      isEnabled: true,
      apiEndpoint: '',
      httpMethod: 'POST',
      parameters: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeout: 30,
      rateLimitPerMinute: 60,
    };
    setEditingTool(newTool);
    setIsCreating(true);
  };

  const handleSaveTool = () => {
    if (!editingTool) return;

    if (isCreating) {
      onUpdateTools([...tools, editingTool]);
    } else {
      onUpdateTools(tools.map((t) => (t.id === editingTool.id ? editingTool : t)));
    }

    setEditingTool(null);
    setIsCreating(false);
  };

  const handleDeleteTool = (toolId: string) => {
    onUpdateTools(tools.filter((t) => t.id !== toolId));
  };

  const handleToggleTool = (toolId: string) => {
    onUpdateTools(
      tools.map((t) =>
        t.id === toolId
          ? { ...t, isEnabled: !t.isEnabled, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleAddParameter = () => {
    if (!editingTool) return;

    const newParameter: ToolParameter = {
      id: `param_${Date.now()}`,
      name: '',
      type: 'string',
      description: '',
      required: false,
    };

    setEditingTool({
      ...editingTool,
      parameters: [...editingTool.parameters, newParameter],
    });
  };

  const handleUpdateParameter = (paramId: string, updates: Partial<ToolParameter>) => {
    if (!editingTool) return;

    setEditingTool({
      ...editingTool,
      parameters: editingTool.parameters.map((p) =>
        p.id === paramId ? { ...p, ...updates } : p
      ),
    });
  };

  const handleDeleteParameter = (paramId: string) => {
    if (!editingTool) return;

    setEditingTool({
      ...editingTool,
      parameters: editingTool.parameters.filter((p) => p.id !== paramId),
    });
  };

  if (editingTool) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isCreating ? 'Create New Tool' : 'Edit Tool'}
          </h3>
          <button
            onClick={() => {
              setEditingTool(null);
              setIsCreating(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Basic Information */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Basic Information
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tool Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingTool.name}
                onChange={(e) =>
                  setEditingTool({ ...editingTool, name: e.target.value })
                }
                placeholder="e.g., Get Weather, Send Email, Calculate Price"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editingTool.description}
                onChange={(e) =>
                  setEditingTool({ ...editingTool, description: e.target.value })
                }
                placeholder="What does this tool do?"
                className="input resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editingTool.triggerPrompt}
                onChange={(e) =>
                  setEditingTool({ ...editingTool, triggerPrompt: e.target.value })
                }
                placeholder="When should the AI use this tool? e.g., 'Use this when the user asks about weather or temperature in a location'"
                className="input resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                This tells the AI when to call this tool
              </p>
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Code className="w-4 h-4" />
              API Configuration
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Endpoint <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={editingTool.apiEndpoint}
                onChange={(e) =>
                  setEditingTool({ ...editingTool, apiEndpoint: e.target.value })
                }
                placeholder="https://api.example.com/endpoint"
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTTP Method
                </label>
                <select
                  value={editingTool.httpMethod}
                  onChange={(e) =>
                    setEditingTool({
                      ...editingTool,
                      httpMethod: e.target.value as HttpMethod,
                    })
                  }
                  className="input"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={editingTool.timeout}
                  onChange={(e) =>
                    setEditingTool({
                      ...editingTool,
                      timeout: parseInt(e.target.value) || 30,
                    })
                  }
                  min="1"
                  max="300"
                  className="input"
                />
              </div>
            </div>

            {/* Authentication */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authentication
              </label>
              <select
                value={editingTool.authentication?.type || 'none'}
                onChange={(e) =>
                  setEditingTool({
                    ...editingTool,
                    authentication: {
                      type: e.target.value as AuthType,
                    },
                  })
                }
                className="input"
              >
                <option value="none">None</option>
                <option value="bearer">Bearer Token</option>
                <option value="api-key">API Key</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>

            {editingTool.authentication?.type === 'bearer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bearer Token
                </label>
                <input
                  type="password"
                  value={editingTool.authentication.token || ''}
                  onChange={(e) =>
                    setEditingTool({
                      ...editingTool,
                      authentication: {
                        ...editingTool.authentication,
                        type: 'bearer',
                        token: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter bearer token"
                  className="input"
                />
              </div>
            )}

            {editingTool.authentication?.type === 'api-key' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Header Name
                  </label>
                  <input
                    type="text"
                    value={editingTool.authentication.headerName || ''}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        authentication: {
                          ...editingTool.authentication,
                          type: 'api-key',
                          headerName: e.target.value,
                        },
                      })
                    }
                    placeholder="X-API-Key"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={editingTool.authentication.token || ''}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        authentication: {
                          ...editingTool.authentication,
                          type: 'api-key',
                          token: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter API key"
                    className="input"
                  />
                </div>
              </div>
            )}

            {editingTool.authentication?.type === 'basic' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editingTool.authentication.username || ''}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        authentication: {
                          ...editingTool.authentication,
                          type: 'basic',
                          username: e.target.value,
                        },
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={editingTool.authentication.password || ''}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        authentication: {
                          ...editingTool.authentication,
                          type: 'basic',
                          password: e.target.value,
                        },
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Parameters */}
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Parameters</h4>
              <button
                onClick={handleAddParameter}
                className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Parameter
              </button>
            </div>

            {editingTool.parameters.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No parameters added yet
              </p>
            ) : (
              <div className="space-y-3">
                {editingTool.parameters.map((param) => (
                  <div
                    key={param.id}
                    className="p-3 bg-white border border-purple-200 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) =>
                            handleUpdateParameter(param.id, { name: e.target.value })
                          }
                          placeholder="Parameter name"
                          className="input text-sm"
                        />
                        <select
                          value={param.type}
                          onChange={(e) =>
                            handleUpdateParameter(param.id, {
                              type: e.target.value as FieldType,
                            })
                          }
                          className="input text-sm"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="array">Array</option>
                          <option value="object">Object</option>
                          <option value="file">File</option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleDeleteParameter(param.id)}
                        className="ml-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={param.description}
                      onChange={(e) =>
                        handleUpdateParameter(param.id, { description: e.target.value })
                      }
                      placeholder="Parameter description"
                      className="input text-sm w-full"
                    />

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={param.required}
                          onChange={(e) =>
                            handleUpdateParameter(param.id, {
                              required: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300"
                        />
                        Required
                      </label>

                      {(param.type === 'string' || param.type === 'number') && (
                        <input
                          type="text"
                          value={param.defaultValue?.toString() || ''}
                          onChange={(e) =>
                            handleUpdateParameter(param.id, {
                              defaultValue: e.target.value,
                            })
                          }
                          placeholder="Default value"
                          className="input text-sm flex-1"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Response Configuration */}
          <div className="space-y-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Response Configuration</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Success Path
                </label>
                <input
                  type="text"
                  value={editingTool.responseConfig?.successPath || ''}
                  onChange={(e) =>
                    setEditingTool({
                      ...editingTool,
                      responseConfig: {
                        ...editingTool.responseConfig,
                        successPath: e.target.value,
                      },
                    })
                  }
                  placeholder="data.result"
                  className="input text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">JSON path to extract data</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error Path
                </label>
                <input
                  type="text"
                  value={editingTool.responseConfig?.errorPath || ''}
                  onChange={(e) =>
                    setEditingTool({
                      ...editingTool,
                      responseConfig: {
                        ...editingTool.responseConfig,
                        errorPath: e.target.value,
                      },
                    })
                  }
                  placeholder="error.message"
                  className="input text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">JSON path to extract error</p>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Examples (Optional)</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Example Request
              </label>
              <textarea
                value={editingTool.exampleRequest || ''}
                onChange={(e) =>
                  setEditingTool({ ...editingTool, exampleRequest: e.target.value })
                }
                placeholder='{"city": "London", "units": "metric"}'
                className="input resize-none font-mono text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Example Response
              </label>
              <textarea
                value={editingTool.exampleResponse || ''}
                onChange={(e) =>
                  setEditingTool({ ...editingTool, exampleResponse: e.target.value })
                }
                placeholder='{"temperature": 15, "condition": "cloudy"}'
                className="input resize-none font-mono text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={() => {
              setEditingTool(null);
              setIsCreating(false);
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTool}
            disabled={
              !editingTool.name ||
              !editingTool.description ||
              !editingTool.triggerPrompt ||
              !editingTool.apiEndpoint
            }
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isCreating ? 'Create Tool' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Tool Calls</h3>
          <p className="text-xs text-gray-500 mt-1">
            Enable your chatbot to call external APIs and perform actions
          </p>
        </div>
        <button
          onClick={handleCreateTool}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No tools configured</h3>
          <p className="text-xs text-gray-500 mb-4">
            Add tools to enable your chatbot to call external APIs
          </p>
          <button
            onClick={handleCreateTool}
            className="btn-primary text-sm flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Your First Tool
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{tool.name}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tool.isEnabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tool.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {tool.httpMethod}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-medium">Endpoint:</span> {tool.apiEndpoint}
                    </p>
                    {tool.parameters.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Parameters:</span>{' '}
                        {tool.parameters.length} parameter(s)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleTool(tool.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        tool.isEnabled
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={tool.isEnabled ? 'Disable tool' : 'Enable tool'}
                    >
                      {tool.isEnabled ? (
                        <Power className="w-4 h-4" />
                      ) : (
                        <PowerOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingTool(tool)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit tool"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTool(tool.id)}
                      className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete tool"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setExpandedToolId(expandedToolId === tool.id ? null : tool.id)
                      }
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {expandedToolId === tool.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedToolId === tool.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Trigger Prompt:
                      </p>
                      <p className="text-xs text-gray-600">{tool.triggerPrompt}</p>
                    </div>

                    {tool.parameters.length > 0 && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Parameters:
                        </p>
                        <div className="space-y-2">
                          {tool.parameters.map((param) => (
                            <div
                              key={param.id}
                              className="flex items-start gap-2 text-xs"
                            >
                              <span className="font-mono bg-white px-2 py-1 rounded border border-purple-200">
                                {param.name}
                              </span>
                              <span className="text-purple-600">{param.type}</span>
                              {param.required && (
                                <span className="text-red-600">required</span>
                              )}
                              <span className="text-gray-600 flex-1">
                                {param.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {tool.authentication && tool.authentication.type !== 'none' && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-700">
                          Authentication: {tool.authentication.type}
                        </p>
                      </div>
                    )}

                    {tool.usageCount !== undefined && (
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>Used {tool.usageCount} times</span>
                        {tool.lastUsed && (
                          <span>
                            Last used: {new Date(tool.lastUsed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

