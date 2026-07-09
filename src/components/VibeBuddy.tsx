import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import type { Task } from '../types';
import { sendChatMessage, ChatMessage, TaskAction, generateWeeklyRoast } from '../utils/ai';

interface VibeBuddyProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export default function VibeBuddy({ tasks, onAddTask, onUpdateTask, onDeleteTask }: VibeBuddyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hey there! I\'m VibeBuddy ✨. I can help you manage, break down, or organize your tasks. What needs doing?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastContent, setRoastContent] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const executeActions = (actions: TaskAction[]) => {
    actions.forEach(action => {
      // Dynamic fallback for dates missing a year
      if (action.type === 'ADD_TASK' || action.type === 'UPDATE_TASK') {
        const payload = action.type === 'ADD_TASK' ? action.payload : action.payload.updates;
        if (payload.dueDate && payload.dueDate.length === 5) {
          payload.dueDate = `${new Date().getFullYear()}-${payload.dueDate}`;
        }
      }

      if (action.type === 'ADD_TASK') {
        onAddTask(action.payload);
      } else if (action.type === 'UPDATE_TASK') {
        onUpdateTask(action.payload.id, action.payload.updates);
      } else if (action.type === 'DELETE_TASK') {
        onDeleteTask(action.payload.id);
      }
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const currentHistory = [...messages, userMessage];
      // Only send the last few messages to save tokens and context
      const contextMessages = currentHistory.slice(-5);
      
      const response = await sendChatMessage(contextMessages, tasks);
      
      if (response.actions && response.actions.length > 0) {
        executeActions(response.actions);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Oops! Something went wrong: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoast = async () => {
    setIsRoasting(true);
    setRoastContent(null);
    try {
      const roast = await generateWeeklyRoast(tasks);
      setRoastContent(roast);
      setIsOpen(false); // Close chat to show full screen modal
    } catch (error) {
      console.error(error);
      setRoastContent('Oops. I failed to generate your roast. Be grateful.');
    } finally {
      setIsRoasting(false);
    }
  };

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black mb-4 mt-6">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mb-3 mt-5">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mb-2 mt-4">{line.slice(4)}</h3>;
      if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-1">{line.slice(2)}</li>;
      
      // Bold text `**text**`
      const boldParts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = boldParts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-bold text-brand-400">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return <p key={i} className="mb-3 leading-relaxed">{formattedLine}</p>;
    });
  };

  return (
    <>
    <div ref={containerRef}>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300
          bg-gradient-to-r from-brand-500 to-purple-500 text-white
          hover:scale-110 hover:shadow-brand-500/50
          ${isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}
        `}
        aria-label="Open VibeBuddy"
      >
        <Sparkles size={24} />
      </button>

      {/* Chat Window */}
      <div
        className={`
          fixed bottom-6 right-6 z-50 w-[350px] h-[500px] max-h-[80vh] flex flex-col
          bg-white/90 dark:bg-surface-dark-card/90 backdrop-blur-2xl rounded-2xl
          border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden
          transition-all duration-300 transform origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Sparkles size={18} />
            <h3 className="font-semibold text-sm">VibeBuddy</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Generate Roast Button */}
        <div className="px-4 py-2 bg-brand-500/5 border-b border-brand-500/10">
          <button
            onClick={handleGenerateRoast}
            disabled={isRoasting}
            className="w-full py-2 bg-gradient-to-r from-brand-500 to-purple-500 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isRoasting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isRoasting ? 'Generating Roast...' : 'Generate Weekly Wrap & Roast'}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-white/5'
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 bg-white/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask VibeBuddy..."
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 
                         rounded-xl text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20
                         text-gray-800 dark:text-white transition-all placeholder-gray-400 dark:placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                         text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors
                         disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send size={16} className={isLoading ? "animate-pulse" : ""} />
            </button>
          </div>
        </form>
      </div>
    </div>

      {/* Roast Modal */}
      {roastContent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in" 
            onClick={() => setRoastContent(null)}
          />
          <div className="relative z-50 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl overscroll-contain will-change-transform transform translate-z-0 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="text-brand-500" /> Weekly Wrap & Roast
              </h2>
              <button 
                onClick={() => setRoastContent(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="text-gray-800 dark:text-gray-200 text-lg">
              {renderMarkdown(roastContent)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
