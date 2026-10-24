import React, { useState } from 'react';
import { StudentPageId } from '../types';

interface AccessibleHomeScreenProps {
  onNavigate: (page: StudentPageId) => void;
  onOpenEmergency: () => void;
  onToast: (msg: string) => void;
}

export const AccessibleHomeScreen: React.FC<AccessibleHomeScreenProps> = ({
  onNavigate,
  onOpenEmergency,
  onToast,
}) => {
  const [currentLang, setCurrentLang] = useState<'hi' | 'en'>('hi');
  const [speaking, setSpeaking] = useState<boolean>(false);

  const toggleLanguage = () => {
    const next = currentLang === 'hi' ? 'en' : 'hi';
    setCurrentLang(next);
    onToast(next === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है' : 'Language switched to English');
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      onToast('Speech synthesis not supported in this browser.');
    }
  };

  return (
    <div style={{ padding: '20px 0', maxWidth: '900px', margin: '0 auto' }}>
      {/* Top Banner with Spoken Assistance & Language Toggle */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '2px solid var(--secondary-sage-green)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(6, 78, 59, 0.08)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '22px', color: 'var(--primary-forest-green)', marginBottom: '4px' }}>
            {currentLang === 'hi' ? 'पी.जी.आई. स्मार्ट कैंपस - आसान सेवा' : 'PGI SmartCampus - Easy Access'}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--secondary-text)', margin: 0 }}>
            {currentLang === 'hi'
              ? 'अपनी समस्या दर्ज करें या कैंपस की जानकारी आसानी से प्राप्त करें।'
              : 'Submit complaints or view campus updates easily.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() =>
              speakText(
                currentLang === 'hi'
                  ? 'पी जी आई स्मार्ट कैंपस में आपका स्वागत है। शिकायत करें, हाल जानें, सूचनाएँ देखें या आपातकालीन सहायता चुनें।'
                  : 'Welcome to PGI SmartCampus. Choose to submit complaint, track status, view notices, or emergency support.'
              )
            }
            style={{
              background: 'var(--primary-forest-green)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 18px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            title="Listen to page summary"
          >
            🔊 {speaking ? (currentLang === 'hi' ? 'बोल रहे हैं...' : 'Speaking...') : (currentLang === 'hi' ? 'सुनें' : 'Listen')}
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              background: '#FAF7F2',
              color: 'var(--primary-forest-green)',
              border: '2px solid var(--primary-forest-green)',
              padding: '12px 18px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🌐 {currentLang === 'hi' ? 'English' : 'हिंदी'}
          </button>
        </div>
      </div>

      {/* 5 Large Accessible Action Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        {/* 1. शिकायत करें */}
        <button
          type="button"
          onClick={() => onNavigate('student-raise')}
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #115E59 100%)',
            color: '#FAF9F6',
            border: 'none',
            borderRadius: '20px',
            padding: '32px 24px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '38px', marginBottom: '16px' }}>📝</div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>
              {currentLang === 'hi' ? 'शिकायत करें' : 'Raise Complaint'}
            </h3>
            <p style={{ fontSize: '15px', opacity: 0.9, margin: 0 }}>
              {currentLang === 'hi' ? 'बिजली, पानी, वाई-फाई या सफाई की समस्या दर्ज करें' : 'Report electrical, water, Wi-Fi or cleaning issues'}
            </p>
          </div>
        </button>

        {/* 2. शिकायत का हाल जानें */}
        <button
          type="button"
          onClick={() => onNavigate('student-my-complaints')}
          style={{
            background: 'linear-gradient(135deg, #115E59 0%, #0F766E 100%)',
            color: '#FAF9F6',
            border: 'none',
            borderRadius: '20px',
            padding: '32px 24px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(17, 94, 89, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '38px', marginBottom: '16px' }}>🔍</div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>
              {currentLang === 'hi' ? 'शिकायत का हाल जानें' : 'Track Status'}
            </h3>
            <p style={{ fontSize: '15px', opacity: 0.9, margin: 0 }}>
              {currentLang === 'hi' ? 'अपनी दर्ज शिकायतों की स्थिति और प्रशासनिक जवाब देखें' : 'Check status and management remarks on your tickets'}
            </p>
          </div>
        </button>

        {/* 3. सूचनाएँ देखें */}
        <button
          type="button"
          onClick={() => onNavigate('student-notices')}
          style={{
            background: 'linear-gradient(135deg, #0F766E 0%, #059669 100%)',
            color: '#FAF9F6',
            border: 'none',
            borderRadius: '20px',
            padding: '32px 24px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(15, 118, 110, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '38px', marginBottom: '16px' }}>📢</div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>
              {currentLang === 'hi' ? 'सूचनाएँ देखें' : 'View Notices'}
            </h3>
            <p style={{ fontSize: '15px', opacity: 0.9, margin: 0 }}>
              {currentLang === 'hi' ? 'परीक्षा, कॉलेज और हॉस्टल की महत्वपूर्ण आधिकारिक सूचनाएँ' : 'Important official exam, college and hostel notices'}
            </p>
          </div>
        </button>

        {/* 4. आपातकालीन सहायता */}
        <button
          type="button"
          onClick={onOpenEmergency}
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            color: '#FAF9F6',
            border: 'none',
            borderRadius: '20px',
            padding: '32px 24px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '38px', marginBottom: '16px' }}>🚨</div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>
              {currentLang === 'hi' ? 'आपातकालीन सहायता' : 'Emergency Help'}
            </h3>
            <p style={{ fontSize: '15px', opacity: 0.9, margin: 0 }}>
              {currentLang === 'hi' ? 'सुरक्षा, चिकित्सा या गंभीर खतरे की तत्काल रिपोर्ट करें' : 'Instant report for security, medical or severe hazards'}
            </p>
          </div>
        </button>

        {/* 5. भाषा बदलें */}
        <button
          type="button"
          onClick={toggleLanguage}
          style={{
            background: 'linear-gradient(135deg, #142D4E 0%, #1E3A8A 100%)',
            color: '#FAF9F6',
            border: 'none',
            borderRadius: '20px',
            padding: '32px 24px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(20, 45, 78, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '38px', marginBottom: '16px' }}>🌐</div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>
              {currentLang === 'hi' ? 'भाषा बदलें' : 'Change Language'}
            </h3>
            <p style={{ fontSize: '15px', opacity: 0.9, margin: 0 }}>
              {currentLang === 'hi' ? 'हिंदी और अंग्रेजी भाषा के बीच आसानी से स्विच करें' : 'Switch easily between Hindi and English languages'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
