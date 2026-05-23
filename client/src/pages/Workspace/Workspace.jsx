import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, Copy, CornerUpLeft, User as UserIcon, StopCircle, Plus, MessageSquare } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import ConversationCard from '../../components/ConversationCard.jsx';
import Toast from '../../components/Toast.jsx';
import api from '../../utils/api.js';
import { useConversationStore } from '../../stores/conversationStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { useTier } from '../../hooks/useTier.js';

const useCases = ['chatbot', 'coding', 'writing', 'research', 'image'];
const ALL_PROVIDERS = ['groq', 'openai', 'anthropic', 'opencode', 'gemini'];

function flattenConversation(conversation) {
  const msgs = [];
  for (const prompt of (conversation.prompts || [])) {
    msgs.push({
      role: 'user',
      content: prompt.content,
      useCase: prompt.useCase,
      provider: prompt.provider,
      promptId: prompt.id,
      createdAt: prompt.createdAt,
    });
    for (const gen of (prompt.generations || [])) {
      msgs.push({
        role: 'assistant',
        content: gen.content,
        generationId: gen.id,
        promptId: prompt.id,
        createdAt: gen.createdAt,
      });
    }
  }
  return msgs;
}

export default function Workspace() {
  const [content, setContent] = useState('');
  const [useCase, setUseCase] = useState('chatbot');
  const [provider, setProvider] = useState('');
  const [providers, setProviders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState({ message: '', visible: false, type: 'info' });
  const [initialLoading, setInitialLoading] = useState(true);

  const { conversations, currentConversation, setConversations, setCurrentConversation, addConversation, removeConversation, updateConversation } = useConversationStore();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const { plan, isPremium } = useTier();
  const messagesEnd = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const convId = localStorage.getItem('currentConversationId');
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    setSocket(s);

    Promise.all([
      api.get('/api/conversations'),
      convId ? api.get(`/api/conversations/${convId}`).catch(() => null) : Promise.resolve(null),
    ]).then(([convList, loaded]) => {
      const list = convList.data || [];
      setConversations(list);

      if (loaded?.data) {
        setCurrentConversation(loaded.data);
        setMessages(flattenConversation(loaded.data));
        setInitialLoading(false);
        return;
      }

      if (list.length > 0) {
        api.get(`/api/conversations/${list[0].id}`).then(({ data }) => {
          setCurrentConversation(data);
          setMessages(flattenConversation(data));
          setInitialLoading(false);
        });
      } else {
        api.post('/api/conversations', {}).then(({ data: conv }) => {
          const full = { ...conv, prompts: [] };
          setCurrentConversation(full);
          addConversation(full);
          setInitialLoading(false);
        });
      }
    });

    return () => s.close();
  }, []);

  useEffect(() => {
    if (currentConversation?.id) {
      localStorage.setItem('currentConversationId', currentConversation.id);
    }
  }, [currentConversation?.id]);

  useEffect(() => {
    api.get('/api/auth/providers').then(({ data }) => {
      const list = data.providers || [];
      setProviders(list);
      if (list.length > 0 && !list.includes(provider)) setProvider(list[0]);
      else if (list.length === 0) setProvider('');
    }).catch(() => setProviders(ALL_PROVIDERS));
  }, []);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  useEffect(() => {
    if (!socket) return;
    const onToken = ({ token }) => setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === 'assistant') copy[copy.length - 1] = { ...last, content: last.content + token };
      return copy;
    });
    const onDone = ({ fullText, generationId }) => {
      setLoading(false);
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === 'assistant') copy[copy.length - 1] = { ...last, content: fullText, generationId };
        return copy;
      });
      setToast({ message: 'Generation complete!', visible: true, type: 'success' });
    };
    const onError = ({ error }) => {
      setLoading(false);
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[copy.length - 1]?.role === 'assistant')
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: `Error: ${error}` };
        return copy;
      });
      setToast({ message: error, visible: true, type: 'error' });
    };
    socket.on('token', onToken);
    socket.on('done', onDone);
    socket.on('error', onError);
    return () => { socket.off('token', onToken); socket.off('done', onDone); socket.off('error', onError); };
  }, [socket]);

  const loadConversation = useCallback(async (conv) => {
    try {
      const { data } = await api.get(`/api/conversations/${conv.id}`);
      setCurrentConversation(data);
      setMessages(flattenConversation(data));
      setContent('');
    } catch {
      setToast({ message: 'Failed to load conversation', visible: true, type: 'error' });
    }
  }, []);

  const handleNewConversation = useCallback(async () => {
    try {
      const { data: conv } = await api.post('/api/conversations', {});
      const full = { ...conv, prompts: [] };
      setCurrentConversation(full);
      addConversation(full);
      setMessages([]);
      setContent('');
      if (textareaRef.current) textareaRef.current.focus();
    } catch {
      setToast({ message: 'Failed to create conversation', visible: true, type: 'error' });
    }
  }, [addConversation]);

  const handleDeleteConversation = useCallback(async (id) => {
    try {
      await api.delete(`/api/conversations/${id}`);
      removeConversation(id);
      if (currentConversation?.id === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          loadConversation(remaining[0]);
        } else {
          handleNewConversation();
        }
      }
      setToast({ message: 'Conversation deleted', visible: true, type: 'info' });
    } catch {
      setToast({ message: 'Failed to delete conversation', visible: true, type: 'error' });
    }
  }, [currentConversation, conversations, loadConversation, handleNewConversation, removeConversation]);

  const handleSend = useCallback(async () => {
    const text = content.trim();
    if (!text || loading || !provider || !currentConversation) return;
    setContent('');
    setMessages((prev) => [...prev, { role: 'user', content: text, useCase, provider }, { role: 'assistant', content: '' }]);
    setLoading(true);
    const title = text.split('\n')[0].slice(0, 80) || 'Untitled';
    try {
      const { data: prompt } = await api.post('/api/prompts', {
        title, content: text, useCase, provider,
        conversationId: currentConversation.id,
      });
      setCurrentConversation((prev) => ({
        ...prev,
        prompts: [...(prev.prompts || []), { ...prompt, generations: [] }],
      }));
      updateConversation(currentConversation.id, { lastPrompt: { content: text, createdAt: new Date().toISOString() } });
      setMessages((prev) => {
        const copy = [...prev];
        const lastUser = copy.findLast((m) => m.role === 'user' && !m.promptId);
        if (lastUser) lastUser.promptId = prompt.id;
        return copy;
      });
      socket?.emit('generate-stream', { promptId: prompt.id, content: text, useCase, provider });
    } catch {
      setLoading(false);
      setMessages((prev) => { const c = [...prev]; c.splice(c.length - 2, 2); return c; });
      setToast({ message: 'Failed to start generation', visible: true, type: 'error' });
    }
  }, [content, useCase, provider, socket, loading, currentConversation, setConversations]);

  const handleRefine = async () => {
    if (!content.trim() || refining || !provider) return;
    setRefining(true);
    try {
      const { data } = await api.post('/api/prompts/refine', { content, useCase, provider });
      const questionsText = data.questions?.map((q, i) => `${i + 1}. ${q.text}\n   Options: ${q.options?.join(', ')}`).join('\n\n');
      setMessages((prev) => [...prev, { role: 'assistant', content: `Here are some clarifying questions to refine your prompt:\n\n${questionsText || 'No questions returned.'}` }]);
    } catch { setToast({ message: 'Failed to refine prompt', visible: true, type: 'error' }); }
    setRefining(false);
  };

  const handleCancel = () => {
    socket?.emit('cancel-generation');
    setLoading(false);
    setMessages((prev) => {
      const c = [...prev];
      if (c[c.length - 1]?.role === 'assistant' && !c[c.length - 1].content) c.pop();
      if (c[c.length - 1]?.role === 'user' && !c[c.length - 1].promptId) c.pop();
      return c;
    });
  };

  const handleReloadPrompt = (msg) => {
    setContent(msg.content);
    if (msg.useCase) setUseCase(msg.useCase);
    if (msg.provider) setProvider(msg.provider);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleCopy = async (text) => {
    try { await navigator.clipboard.writeText(text); setToast({ message: 'Copied to clipboard', visible: true, type: 'success' }); }
    catch { setToast({ message: 'Failed to copy', visible: true, type: 'error' }); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const convTitle = currentConversation && currentConversation.title !== 'New Conversation'
    ? currentConversation.title
    : (currentConversation?.prompts?.[0]?.content?.slice(0, 60) || 'New Conversation');

  return (
    <div className="min-h-screen bg-bg bg-grid">
      <Sidebar />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} h-screen flex transition-all`}>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 md:px-8 py-3 border-b border-border bg-black/10">
            <h2 className="text-sm font-medium text-text/70 truncate flex-1">{convTitle}</h2>
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            >
              <Plus size={14} /> New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
            {initialLoading ? (
              <div className="flex items-center justify-center h-full">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full" />
              </div>
            ) : messages.length === 0 && !loading ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Bot size={32} className="text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-text/60 mb-2">Start a conversation</h2>
                <p className="text-sm text-text/30 max-w-md">Type your prompt below and press Enter to generate a response.</p>
              </motion.div>
            ) : null}
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.promptId || i}-${msg.generationId || i}-${i}`}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={16} className="text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[75%] md:max-w-[65%] group ${msg.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white rounded-br-md cursor-pointer hover:brightness-110 transition-all' : 'bg-black/30 border border-border rounded-bl-md'}`}
                      onClick={msg.role === 'user' ? () => handleReloadPrompt(msg) : undefined}
                    >
                      {msg.content || (msg.role === 'assistant' && i === messages.length - 1 && loading ? (
                        <span className="flex items-center gap-1.5 py-1">
                          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-2 h-2 rounded-full bg-primary" />
                          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary" />
                          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary" />
                        </span>
                      ) : null)}
                      {!msg.content && msg.role === 'assistant' && i !== messages.length - 1 && (
                        <span className="text-text/30 italic">No content</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {msg.role === 'user' && (
                        <button onClick={() => handleReloadPrompt(msg)} className="flex items-center gap-1 text-xs text-text/30 hover:text-text transition-colors">
                          <CornerUpLeft size={12} /> Load
                        </button>
                      )}
                      {msg.role === 'assistant' && msg.content && !loading && msg.generationId && (
                        <button onClick={() => handleCopy(msg.content)} className="flex items-center gap-1 text-xs text-text/30 hover:text-text transition-colors">
                          <Copy size={12} /> Copy
                        </button>
                      )}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/10 flex items-center justify-center shrink-0 mt-1">
                      <UserIcon size={16} className="text-accent" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEnd} />
          </div>

          <div className="border-t border-border p-4 md:px-8 bg-bg/50 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <select value={useCase} onChange={(e) => setUseCase(e.target.value)} className="px-2.5 py-1.5 rounded-lg bg-paper border border-border text-text text-xs outline-none focus:border-primary transition-colors cursor-pointer">
                {useCases.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="px-2.5 py-1.5 rounded-lg bg-paper border border-border text-text text-xs outline-none focus:border-primary transition-colors cursor-pointer">
                {providers.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <button
                onClick={() => handleRefine()}
                disabled={refining || !content.trim() || !provider || !currentConversation}
                className="ml-auto text-xs text-text/40 hover:text-text transition-colors flex items-center gap-1 disabled:opacity-30"
              >
                {refining ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full" />
                ) : <Sparkles size={14} />}
                Refine
              </button>
            </div>
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentConversation ? "Type your prompt here... (Shift+Enter for new line)" : "Create a conversation to start..."}
                rows={2}
                disabled={!currentConversation}
                className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-border text-text placeholder:text-text/25 outline-none focus:border-primary/60 transition-all duration-200 resize-none text-sm disabled:opacity-40"
              />
              {loading ? (
                <button
                  onClick={handleCancel}
                  className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <StopCircle size={18} className="text-white" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!content.trim() || !provider || !currentConversation}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-accent transition-all duration-200 disabled:opacity-30 shadow-lg shadow-primary/20"
                >
                  <Send size={18} className="text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-border overflow-y-auto hidden lg:block bg-black/10 flex flex-col">
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-medium text-text/40 uppercase tracking-wider">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {conversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                conversation={conv}
                active={conv.id === currentConversation?.id}
                onSelect={loadConversation}
                onDelete={handleDeleteConversation}
              />
            ))}
            {conversations.length === 0 && !initialLoading && (
              <p className="text-sm text-text/20 italic text-center py-8">No conversations yet</p>
            )}
          </div>
          <div className="p-3 border-t border-border">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg border border-dashed border-border text-text/40 hover:text-text hover:border-primary/40 transition-all"
            >
              <Plus size={14} /> New conversation
            </button>
          </div>
        </div>
      </div>
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, visible: false }))} />
    </div>
  );
}
