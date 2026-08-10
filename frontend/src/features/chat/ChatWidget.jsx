import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Trash2, Sparkles } from 'lucide-react';
import { chatAPI } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import toast from '../../utils/toast';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage({ message: userMsg.content, conversation_id: conversationId });
      setConversationId(res.data.conversation_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const clearChat = async () => {
    try {
      await chatAPI.clearHistory();
      setMessages([]);
      setConversationId(null);
      toast.success('Chat cleared');
    } catch {}
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-glow-lg flex items-center justify-center hover:scale-110 transition-transform"
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle AI assistant"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] glass-strong rounded-2xl flex flex-col overflow-hidden shadow-glass"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Career Mentor</p>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <button onClick={clearChat} className="p-1.5 hover:bg-white/5 rounded-lg" aria-label="Clear chat">
                <Trash2 size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles size={28} className="text-primary/30 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Ask me anything about careers, resumes, or professional growth!</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-surface-card border border-border text-gray-300 rounded-bl-md'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-invert prose-sm max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                        {msg.content}
                      </ReactMarkdown>
                    ) : msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Ask about careers..."
                  className="flex-1 px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary/30"
                />
                <button onClick={sendMessage} disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-primary hover:bg-primary-light disabled:opacity-40 transition-colors" aria-label="Send message">
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
