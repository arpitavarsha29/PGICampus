import React, { useState, useRef, useEffect } from 'react';
import { Role, Notice, Complaint, Student, ChatMessage } from '../types';
import { canSeeRecord } from '../data/initialData';

interface AssistantPageProps {
  role: Role;
  notices: Notice[];
  complaints: Complaint[];
  students: Student[];
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  role,
  notices,
  complaints,
  students,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-initial',
      sender: 'bot',
      text: "Hello! I'm your PGI SmartCampus assistant. Ask me about notices, attendance, campus services or the demo access policy.",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const generateAnswer = (q: string): string => {
    const l = q.toLowerCase();
    if (l === 'show urgent notices') {
      return 'Urgent notice summary: the end-semester examination form deadline is approaching. Please verify the official notice and date with the Examination Cell. I only show notices available to your current role.';
    }
    if (
      l.includes('permission') ||
      l.includes('access') ||
      l.includes('see other') ||
      l.includes('privacy') ||
      l === 'explain access permissions'
    ) {
      return `${role.name} scope: ${role.scope}. ${role.scopeText} This is a UI demo; production must enforce the same rules on the server and database, not only in the browser.`;
    }
    if (
      l.includes('complaint') ||
      l.includes('maintenance') ||
      l === 'summarize open complaints'
    ) {
      const list = complaints.filter(
        (c) => canSeeRecord(role, c) && c.status !== 'Resolved'
      );
      return `There are ${list.length} open or in-progress complaints in your permitted demo scope. Top items: ${
        list
          .slice(0, 3)
          .map((c) => c.title + ' (' + c.status + ')')
          .join('; ') || 'No unresolved items visible'
      }.`;
    }
    if (l.includes('notice') || l.includes('deadline') || l.includes('exam')) {
      const ns = notices.filter(
        (n) =>
          role.kind === 'central' ||
          n.audience.includes(role.institution || 'PIT') ||
          n.audience.includes('All institutions')
      );
      return `I found ${ns.length} sample notices within your permitted scope. ${ns
        .slice(0, 2)
        .map((n) => n.title + ': ' + n.body)
        .join(' ')} Please confirm dates in the official notice.`;
    }
    if (l.includes('attendance') || l.includes('student')) {
      const ss = students.filter((s) => canSeeRecord(role, s));
      if (!ss.length)
        return 'No student records are available within your current role scope.';
      return `There are ${ss.length} sample student records visible in your scope. Average attendance is ${(
        ss.reduce((a, s) => a + s.attendance, 0) / ss.length
      ).toFixed(1)}%. This is illustrative data, not official college information.`;
    }
    if (l.includes('timetable') || l.includes('class')) {
      return "The timetable module is represented in this demo's academic records workflow. For production, the assistant should retrieve the latest approved timetable for your assigned institution, department and class.";
    }
    return `I can help with notices, attendance, complaints and access rules. Your current scope is ${role.scope}. This prototype uses sample responses; connect a permission-aware RAG/AI service for verified live answers.`;
  };

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: generateAnswer(trimmed),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 180);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  return (
    <section id="assistantPage" className="page active">
      <div className="assistant-layout">
        <div className="assistant-main panel">
          <div className="ai-heading">
            <div className="assistant-logo">✳</div>
            <div>
              <h2>PGI AI Assistant</h2>
              <p>Answers grounded in your permitted campus information</p>
            </div>
            <span className="online">
              <i></i> Demo online
            </span>
          </div>

          <div className="chat-window" id="chatWindow" ref={chatWindowRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-message ${m.sender === 'user' ? 'user' : 'bot'}`}
              >
                {m.sender === 'bot' && <div className="chat-avatar">✳</div>}
                <div>
                  <small>{m.sender === 'user' ? 'You' : 'PGI Assistant'}</small>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="prompt-chips">
            <button
              type="button"
              onClick={() => handleSend('Show urgent notices')}
            >
              Show urgent notices
            </button>
            <button
              type="button"
              onClick={() => handleSend('Summarize open complaints')}
            >
              Summarize open complaints
            </button>
            <button
              type="button"
              onClick={() => handleSend('Explain access permissions')}
            >
              Explain access permissions
            </button>
          </div>

          <form id="chatForm" className="chat-form" onSubmit={handleSubmit}>
            <input
              id="chatInput"
              placeholder="Ask a question about your campus…"
              autoComplete="off"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="primary-btn">
              Send ↑
            </button>
          </form>

          <small className="demo-note">
            Demo responses use sample data. Connect an approved AI API and verified college documents for production.
          </small>
        </div>

        <div className="panel assistant-side">
          <h3>What I can help with</h3>
          <div className="help-row">
            <span>▤</span>
            <div>
              <strong>Find information</strong>
              <small>Notices, timetable and services</small>
            </div>
          </div>
          <div className="help-row">
            <span>✧</span>
            <div>
              <strong>Summarize</strong>
              <small>Turn long notices into key points</small>
            </div>
          </div>
          <div className="help-row">
            <span>⚑</span>
            <div>
              <strong>Track issues</strong>
              <small>Understand complaint status</small>
            </div>
          </div>
          <div className="help-row">
            <span>⌁</span>
            <div>
              <strong>Respect access</strong>
              <small>Responses stay within role scope</small>
            </div>
          </div>
          <div className="privacy-note">
            <strong>Privacy by design</strong>
            <p>
              The demo simulates scoped responses. Production access must be enforced by server-side authorization.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
