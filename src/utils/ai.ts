import type { Task, PriorityLevel } from '../types';
import { getTodayISO } from '../utils';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
// Fallback to a free model on OpenRouter, or a very smart fast one. 
const MODEL = 'google/gemini-3.5-flash'; 

const SYSTEM_PROMPT = `
You are VibeBuddy, an AI assistant locked exclusively to this To-Do list website. You can only view, create, delete, reschedule, and organize the user's local tasks. You have absolutely zero knowledge of the outside world, news, weather, general facts, or external programming topics. If the user asks for anything outside of managing their tasks (for example, asking 'give me news', 'what is the weather', or 'write a poem'), you must immediately refuse to answer. Respond with exactly this phrase: 'I can't help you for this task. Let's focus on getting your tasks done!' Do not elaborate, do not give a partial answer, and do not apologize lengthily.

When the user asks you to modify their tasks (e.g. "add a task to buy groceries", "break down my 'learn react' task into 3 subtasks", "delete my 'gym' task", "mark all my overdue tasks as high priority"), you must fulfill the request by returning a JSON block that describes the actions to take, ALONGSIDE a friendly text response confirming what you did.

If you need to perform actions on tasks, you MUST append a JSON block at the very end of your response, wrapped in triple backticks and the 'json' language identifier. The JSON block must match this exact schema:

\`\`\`json
{
  "actions": [
    {
      "type": "ADD_TASK",
      "payload": {
        "title": "Task title",
        "description": "Optional description",
        "dueDate": "YYYY-MM-DD",
        "priority": "HIGH" | "MEDIUM" | "LOW",
        "category": "String"
      }
    },
    {
      "type": "UPDATE_TASK",
      "payload": {
        "id": "existing-task-id",
        "updates": {
          "title": "New title",
          "isCompleted": true
        }
      }
    },
    {
      "type": "DELETE_TASK",
      "payload": {
        "id": "existing-task-id"
      }
    }
  ]
}
\`\`\`

Note: Today's date is ${getTodayISO()}. If a task needs a date, use this as a reference point.
Always be encouraging, friendly, and brief in your text response.
`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TaskAction {
  type: 'ADD_TASK' | 'UPDATE_TASK' | 'DELETE_TASK';
  payload: any;
}

export interface AIResponse {
  text: string;
  actions: TaskAction[];
}

export async function sendChatMessage(messages: ChatMessage[], currentTasks: Task[]): Promise<AIResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('API key not found. Please add VITE_OPENROUTER_API_KEY to your .env file.');
  }

  // Inject the current state into the system prompt context so the AI knows what tasks exist.
  const stateContext = `\n\nCURRENT TASKS STATE:\n${JSON.stringify(currentTasks, null, 2)}`;

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT + stateContext },
    ...messages
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173', // Required by OpenRouter
        'X-Title': 'Task-Do VibeBuddy', // Required by OpenRouter
      },
      body: JSON.stringify({
        model: MODEL,
        messages: fullMessages,
        temperature: 0.3, // low temperature for consistent JSON
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;

    return parseAIResponse(rawContent);
  } catch (error) {
    console.error('VibeBuddy API Error:', error);
    throw error;
  }
}

function parseAIResponse(rawContent: string): AIResponse {
  // Check for the strict refusal phrase
  const refusalPhrase = "I can't help you for this task. Let's focus on getting your tasks done!";
  if (rawContent.includes(refusalPhrase)) {
    return { text: refusalPhrase, actions: [] };
  }

  let text = rawContent;
  let actions: TaskAction[] = [];

  // Extract JSON block if present
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/i;
  const match = rawContent.match(jsonRegex);

  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.actions && Array.isArray(parsed.actions)) {
        actions = parsed.actions;
      }
      // Remove the JSON block from the text shown to the user
      text = rawContent.replace(jsonRegex, '').trim();
    } catch (e) {
      console.error('Failed to parse AI JSON output', e);
    }
  }

  return { text, actions };
}
