import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Users,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  User,
  Sparkles,
  DollarSign
} from 'lucide-react';

const QUICK_UPDATES = [
  "💰 Payment collected successfully!",
  "📞 Followed up with client regarding invoice",
  "✉️ Cheque dispatched by client finance desk",
  "⏳ Pending director approval on milestone",
  "🤝 Client confirmed NEFT transfer today",
  "⚠️ Need manager review on overdue balance"
];

export default function TeamChatModal({
  isOpen,
  onClose,
  supabase,
  userProfile,
  effectiveOnlineUsers = [],
  theme = 'light'
}) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('fincollect_team_chat');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'msg-seed-1',
        sender_id: '11111111-1111-4111-8111-111111111111',
        sender_email: 'manager@company.com',
        sender_role: 'manager',
        message: 'Hello team! Let us focus on clearing all Outstanding and AMC renewals scheduled this week.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'msg-seed-2',
        sender_id: '22222222-2222-4222-8222-222222222222',
        sender_email: 'rajesh.team@company.com',
        sender_role: 'team',
        message: 'Apex Industrial Tech Ltd AMC renewal ₹1,85,000 received successfully! Receipt confirmed.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatChannelRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Set up Supabase Realtime Broadcast Channel
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel('team-chat-room', {
      config: {
        broadcast: { self: false } // We add our own sent message immediately to state
      }
    });

    channel
      .on('broadcast', { event: 'team-message' }, ({ payload }) => {
        if (payload && payload.id) {
          setMessages((prev) => {
            // Deduplicate
            if (prev.some((m) => m.id === payload.id)) return prev;
            const updated = [...prev, payload];
            try {
              localStorage.setItem('fincollect_team_chat', JSON.stringify(updated.slice(-150)));
            } catch (err) {
              console.warn('Storage save warning:', err);
            }
            return updated;
          });
        }
      })
      .subscribe();

    chatChannelRef.current = channel;

    return () => {
      try {
        if (chatChannelRef.current) {
          supabase.removeChannel(chatChannelRef.current);
        }
      } catch {
        // ignore
      }
    };
  }, [supabase]);

  // Send message
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !userProfile) return;

    setIsSending(true);
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender_id: userProfile.id,
      sender_email: userProfile.email,
      sender_role: userProfile.role,
      message: text,
      timestamp: new Date().toISOString(),
    };

    // Add to local state immediately
    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem('fincollect_team_chat', JSON.stringify(updated.slice(-150)));
      } catch (err) {
        console.warn('Storage save error:', err);
      }
      return updated;
    });

    setInputText('');

    // Broadcast over Supabase Realtime
    try {
      if (chatChannelRef.current) {
        await chatChannelRef.current.send({
          type: 'broadcast',
          event: 'team-message',
          payload: newMsg,
        });
      }
    } catch (err) {
      console.warn('Supabase broadcast error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear local team chat history on this device?')) {
      setMessages([]);
      localStorage.removeItem('fincollect_team_chat');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className={`max-w-2xl w-full h-[88vh] sm:h-[82vh] rounded-2xl border flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
      }`}>
        
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          theme === 'dark' ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-sm sm:text-base text-slate-950 dark:text-white">
                  Live Team Chat & Updates
                </h3>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{effectiveOnlineUsers.length} Online</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Broadcast instant notes, payment confirmations & follow-ups in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearHistory}
              title="Clear Local Chat"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Online Colleagues Bar */}
        <div className={`px-4 py-2 border-b flex items-center space-x-2 overflow-x-auto text-[11px] shrink-0 ${
          theme === 'dark' ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-100/70 border-slate-200 text-slate-700'
        }`}>
          <span className="font-bold flex items-center space-x-1 shrink-0">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Active Team:</span>
          </span>
          <div className="flex items-center space-x-1.5">
            {effectiveOnlineUsers.map((u, i) => (
              <span
                key={u.id || u.email || i}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  u.id === userProfile?.id
                    ? (theme === 'dark' ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-900 border-indigo-200')
                    : (theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-800 border-slate-300 shadow-2xs')
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="truncate max-w-[120px]">{u.email?.split('@')[0]}</span>
                {u.role === 'manager' && (
                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-extrabold">(Mgr)</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className={`flex-1 p-4 overflow-y-auto space-y-3 ${
          theme === 'dark' ? 'bg-slate-950/30' : 'bg-slate-50/50'
        }`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
              <p className="font-bold text-sm text-slate-600 dark:text-slate-400">No chat messages yet</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Use the quick buttons below or type an update to notify active team members in real-time.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isSelf = m.sender_id === userProfile?.id || m.sender_email === userProfile?.email;
              const isManager = m.sender_role === 'manager';
              const timeStr = m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isSelf ? 'You' : m.sender_email}
                    </span>
                    {isManager && (
                      <span className="px-1 py-0.2 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 font-bold text-[9px] border border-purple-200 dark:border-purple-800">
                        Manager
                      </span>
                    )}
                    <span>• {timeStr}</span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium shadow-xs leading-relaxed ${
                      isSelf
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Update Chips */}
        <div className={`p-2.5 border-t overflow-x-auto shrink-0 flex items-center space-x-2 ${
          theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Quick:</span>
          </span>
          {QUICK_UPDATES.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                theme === 'dark'
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className={`p-3 border-t shrink-0 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send payment update or message to active colleagues..."
              className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:bg-white'
              }`}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
