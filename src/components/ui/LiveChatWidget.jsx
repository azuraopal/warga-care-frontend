import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Trash2, Sparkles, Zap, FileText, Megaphone, Calendar } from 'lucide-react';
import { chatApi } from '../../api/chat';

const INITIAL_BOT_MESSAGE = {
  id: 1,
  sender: 'bot',
  text: 'Halo! Saya **asisten virtual WargaCare**.\n\nAda yang bisa saya bantu seputar Karang Taruna, RT/RW, laporan pengaduan warga, atau tata kelola Desa?',
  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTIONS = [
  { id: 'laporan', label: 'Cara buat laporan pengaduan?', icon: FileText },
  { id: 'pengumuman', label: 'Bagaimana melihat pengumuman RT?', icon: Megaphone },
  { id: 'kegiatan', label: 'Agenda kegiatan warga minggu ini?', icon: Calendar },
  { id: 'profil', label: 'Cara memperbarui profil saya?', icon: User },
];

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    window.addEventListener('wc-open-chat', openHandler);
    return () => window.removeEventListener('wc-open-chat', openHandler);
  }, []);

  const sendMessageText = async (textToSend) => {
    const trimmedMessage = textToSend.trim();
    if (!trimmedMessage || isLoading) return;

    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newUserMsg = { id: Date.now(), sender: 'user', text: trimmedMessage, timestamp: timeString };
    
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await chatApi.sendMessage(trimmedMessage);
      const reply = res?.data?.reply || res?.reply || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
      
      const botTimeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: reply, timestamp: botTimeString },
      ]);
    } catch (error) {
      const errTimeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Maaf, terjadi kendala saat menghubungkan ke server AI WargaCare. Silakan coba beberapa saat lagi.',
          timestamp: errTimeString,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessageText(inputValue);
  };

  const handleClearChat = () => {
    setMessages([
      {
        ...INITIAL_BOT_MESSAGE,
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Simple formatter for bold text (**text**) and bullet lists
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Replace **text** with bold elements
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <span key={lineIdx}>
          {formattedParts}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            height: '56px',
            padding: '0 22px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 28px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            zIndex: 9999,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 14px 34px rgba(37, 99, 235, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 28px rgba(37, 99, 235, 0.4)';
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MessageCircle size={24} />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '9px',
                height: '9px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                border: '2px solid #2563eb',
              }}
            />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.01em' }}>Tanya AI</span>
          <Sparkles size={16} style={{ opacity: 0.85 }} />
        </button>
      )}

      {/* Main Chat Modal Window */}
      {isOpen && (
        <div
          className="chat-window-animation"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: 'min(430px, calc(100vw - 28px))',
            height: 'min(78vh, 640px)',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 60px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(37, 99, 235, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
              color: 'white',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.2)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <Bot size={24} style={{ color: '#ffffff' }} />
                <span
                  className="chat-online-badge"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    border: '2px solid #2563eb',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                    Tanya WargaCare
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      background: 'rgba(255, 255, 255, 0.22)',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                    }}
                  >
                    AI
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 }}>
                    Asisten Virtual RT/RW
                  </span>
                  <span style={{ opacity: 0.6 }}>•</span>
                  <span style={{ fontSize: '0.72rem', color: '#86efac', fontWeight: 600 }}>
                    Online 24/7
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Bersihkan Percakapan"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
                >
                  <Trash2 size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body Container */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}
              >
                {/* Avatar Icon */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: msg.sender === 'user' ? '#1d4ed8' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: msg.sender === 'user' ? '#ffffff' : '#2563eb',
                    border: msg.sender === 'bot' ? '1px solid #bfdbfe' : 'none',
                    boxShadow: msg.sender === 'bot' ? '0 2px 8px rgba(37, 99, 235, 0.1)' : '0 2px 8px rgba(29, 78, 216, 0.2)',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={18} />}
                </div>

                {/* Message Bubble & Timestamp */}
                <div
                  style={{
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: msg.sender === 'user' ? '#2563eb' : '#ffffff',
                      background:
                        msg.sender === 'user'
                          ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                          : '#ffffff',
                      color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                      padding: '12px 16px',
                      borderRadius: '18px',
                      borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                      borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '18px',
                      fontSize: '0.9rem',
                      lineHeight: '1.55',
                      boxShadow:
                        msg.sender === 'user'
                          ? '0 4px 14px rgba(37, 99, 235, 0.25)'
                          : '0 4px 15px rgba(15, 23, 42, 0.04)',
                      border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                    }}
                  >
                    {renderFormattedText(msg.text)}
                  </div>

                  {msg.timestamp && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: '#94a3b8',
                        marginTop: '4px',
                        padding: '0 4px',
                      }}
                    >
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  alignSelf: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)',
                  }}
                >
                  <Bot size={18} />
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '12px 18px',
                    borderRadius: '18px',
                    borderBottomLeftRadius: '4px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginLeft: '4px' }}>
                    AI sedang mengetik...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {!isLoading && messages.length <= 3 && (
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffffff',
                borderTop: '1px dashed #e2e8f0',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {SUGGESTIONS.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="chat-suggestion-chip"
                    onClick={() => sendMessageText(item.label)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IconComp size={14} style={{ color: '#2563eb' }} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Form */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '14px 16px 10px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ketik pertanyaan seputar RT/RW..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '24px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background:
                    inputValue.trim() && !isLoading
                      ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                      : '#e2e8f0',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  boxShadow:
                    inputValue.trim() && !isLoading
                      ? '0 4px 14px rgba(37, 99, 235, 0.35)'
                      : 'none',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseOver={(e) => {
                  if (inputValue.trim() && !isLoading) {
                    e.currentTarget.style.transform = 'scale(1.06)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Send size={18} style={{ marginLeft: '2px' }} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                fontSize: '0.7rem',
                color: '#94a3b8',
                paddingTop: '2px',
              }}
            >
              <Zap size={12} style={{ color: '#2563eb' }} />
              <span>Ditenagai oleh</span>
              <strong style={{ color: '#2563eb', fontWeight: 700 }}>WargaCare AI</strong>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
