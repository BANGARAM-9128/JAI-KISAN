import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { assistantApi } from '../services/assistantApi';
import { VoiceInput } from '../components/VoiceInput';
import { ChatMessage } from '../types';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Radio, 
  ExternalLink, 
  BookOpen, 
  HelpCircle 
} from 'lucide-react';

export const Assistant: React.FC = () => {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        language === 'te'
          ? 'నమస్కారం! నేను మీ కిసాన్ AI సహాయకుడిని. వాతావరణం, మందుల పిచికారీ, ఎరువుల మోతాదు, తెగుళ్ల నివారణ గురించి మీ ప్రశ్నలను అడగవచ్చు. మాట్లాడటానికి మైక్ బటన్ లేదా క్రింది సూచనలను ఉపయోగించండి.'
          : 'Hello! I am your Kisan AI assistant. Ask any questions about weather impacts, fertilizer schedules, pesticide spraying safety, or crop protection. You can also use voice input.',
      timestamp: 'Just now',
      is_demo: true,
      sources: [
        {
          title: 'ICAR-CRIDA Agromet Advisory Network',
          source_org: 'ICAR',
        },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await assistantApi.sendMessage(text, language);
      setMessages((prev) => [...prev, response]);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content:
          language === 'te'
            ? 'క్షమించండి, సమాధానం తీసుకురావడంలో సాంకేతిక సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
            : 'Sorry, I encountered an issue processing your query. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue(transcript);
    handleSend(transcript);
  };

  const suggestedQuestions = [
    t('suggestedQ1'),
    t('suggestedQ2'),
    t('suggestedQ3'),
    t('suggestedQ4'),
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8.5rem)]">
      {/* Header & Demo Badge */}
      <div className="bg-white rounded-t-3xl border border-b-0 border-stone-200 p-4 sm:p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-700 text-white flex items-center justify-center shadow-md shadow-green-700/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
              <span>{t('assistantTitle')}</span>
            </h1>
            <p className="text-xs text-stone-500">
              {t('assistantSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{t('demoMode')}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-stone-100/60 p-4 sm:p-6 space-y-4 border-x border-stone-200">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[88%] sm:max-w-[78%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                  isUser ? 'bg-stone-800' : 'bg-green-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 shadow-sm space-y-2 ${
                  isUser
                    ? 'bg-stone-800 text-white rounded-tr-none'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {msg.content}
                </p>

                {/* Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-stone-100 text-xs text-stone-500 space-y-1">
                    <span className="font-semibold text-stone-600 block flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-green-600" />
                      <span>{t('sourcesConsulted')}:</span>
                    </span>
                    {msg.sources.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 pl-4 text-[11px]">
                        <span>• {s.title}</span>
                        {s.url && (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-700 hover:underline inline-flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] text-right font-medium ${
                    isUser ? 'text-stone-300' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-2.5 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-stone-200 shadow-sm flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">
                {language === 'te'
                  ? 'వ్యవసాయ మార్గదర్శకాలను విశ్లేషిస్తోంది...'
                  : 'Synthesizing agricultural advisory...'}
              </span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Quick Scroll */}
      <div className="bg-white border-x border-stone-200 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="flex-shrink-0 text-xs px-3 py-1.5 bg-stone-50 hover:bg-green-50 text-stone-700 hover:text-green-800 rounded-full border border-stone-200 hover:border-green-300 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3 h-3 text-green-600" />
            <span className="max-w-xs truncate">{q}</span>
          </button>
        ))}
      </div>

      {/* Bottom Input Box */}
      <div className="bg-white rounded-b-3xl border border-t-0 border-stone-200 p-3 sm:p-4 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <VoiceInput onTranscript={handleVoiceTranscript} />

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('typeYourQuestion')}
            disabled={isSending}
            className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-stone-900 text-sm sm:text-base transition-colors"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="p-3 bg-green-700 hover:bg-green-800 text-white rounded-2xl shadow-md shadow-green-700/20 disabled:opacity-50 transition-colors flex items-center justify-center"
            title={t('submit')}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
