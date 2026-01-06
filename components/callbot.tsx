import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

interface VapiWidgetProps {
  apiKey: string;
  assistantId: string;
  config?: Record<string, unknown>;
}

const NoBrainerWidget: React.FC<VapiWidgetProps> = ({ 
  apiKey, 
  assistantId, 
  config = {} 
}) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);

  useEffect(() => {
    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsConnected(true);
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsConnected(false);
      setIsSpeaking(false);
    });

    vapiInstance.on('speech-start', () => {
      console.log('Assistant started speaking');
      setIsSpeaking(true);
    });

    vapiInstance.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setIsSpeaking(false);
    });

    vapiInstance.on('message', (message) => {
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, {
          role: message.role,
          text: message.transcript
        }]);
      }
    });

    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error);
    });

    return () => {
      vapiInstance?.stop();
    };
  }, [apiKey]);

  const startCall = () => {
    if (vapi) {
      vapi.start(assistantId);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      {!isConnected ? (
        <button
          onClick={startCall}
          style={{
            background: 'linear-gradient(135deg, #12A594 0%, #0d7d70 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            fontSize: '32px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(18, 165, 148, 0.4)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(18, 165, 148, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(18, 165, 148, 0.4)';
          }}
        >
          🤖
        </button>
      ) : (
        <div style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f0fdf9 100%)',
          borderRadius: '20px',
          padding: '24px',
          width: '360px',
          boxShadow: '0 12px 48px rgba(18, 165, 148, 0.15)',
          border: '2px solid #12A594'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid #e6f7f4'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #12A594 0%, #0d7d70 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 12px rgba(18, 165, 148, 0.3)'
              }}>
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#12A594', fontSize: '16px' }}>
                  AI Assistant
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isSpeaking ? '#ff4444' : '#12A594',
                    animation: isSpeaking ? 'pulse 1s infinite' : 'none'
                  }}></div>
                  {isSpeaking ? 'Speaking...' : 'Listening...'}
                </div>
              </div>
            </div>
            <button
              onClick={endCall}
              style={{
                background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 68, 68, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              End Call
            </button>
          </div>
          
          <div style={{
            maxHeight: '240px',
            overflowY: 'auto',
            padding: '12px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e6f7f4'
          }}>
            {transcript.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: '#12A594'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                <p style={{ fontSize: '14px', margin: 0, color: '#666' }}>
                  Start speaking to chat with me...
                </p>
              </div>
            ) : (
              transcript.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    gap: '8px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #12A594 0%, #0d7d70 100%)' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div style={{
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #12A594 0%, #0d7d70 100%)' 
                      : 'linear-gradient(135deg, #e6f7f4 0%, #d1f4ed 100%)',
                    color: msg.role === 'user' ? '#fff' : '#1a1a1a',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' 
                      ? '16px 16px 4px 16px' 
                      : '16px 16px 16px 4px',
                    fontSize: '14px',
                    maxWidth: '75%',
                    lineHeight: '1.5',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    wordWrap: 'break-word'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NoBrainerWidget;