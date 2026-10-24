import React, { useState } from 'react';

interface PlacementPageProps {
  onToast: (msg: string) => void;
}

const sampleInsights = [
  {
    title: 'Focus area: DSA & problem solving',
    desc: 'Students with strong programming fundamentals but lower assessment scores may benefit from weekly practice sessions and mock coding rounds.',
  },
  {
    title: 'Suggested action: Weekly coding challenges',
    desc: 'Suggested action: run a weekly coding challenge, review results by topic, and assign focused practice modules to students who need support.',
  },
  {
    title: 'Focus area: Technical communication & interview poise',
    desc: 'Pair pre-final students with alumni mentors for mock system design and behavioral rounds to improve confidence before campus drives.',
  },
  {
    title: 'Focus area: Core CS & quantitative aptitude',
    desc: 'Diagnostic assessments indicate strong logical reasoning; scheduling 20-minute daily speed drills will boost placement exam conversion rates.',
  },
];

export const PlacementPage: React.FC<PlacementPageProps> = ({ onToast }) => {
  const [insightIndex, setInsightIndex] = useState(0);

  const handleAnalyze = () => {
    onToast(
      'AI demo insight: prioritize DSA practice and mock interviews for CSE candidates.'
    );
  };

  const handleRefreshInsight = () => {
    setInsightIndex((prev) => (prev + 1) % sampleInsights.length);
    onToast('A new sample insight was generated.');
  };

  const currentInsight = sampleInsights[insightIndex];

  return (
    <section id="placementPage" className="page active">
      <div className="section-heading">
        <div>
          <h2>Placement &amp; career readiness</h2>
          <p>Skill-gap insights and opportunities for students.</p>
        </div>
        <button
          type="button"
          className="primary-btn"
          id="analyzeSkills"
          onClick={handleAnalyze}
        >
          ✳ Analyse skills
        </button>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Placement snapshot</h2>
              <p>Illustrative current-year data</p>
            </div>
          </div>
          <div className="placement-number">
            <strong>78%</strong>
            <span>students placement-ready</span>
          </div>
          <div className="progress">
            <span style={{ width: '78%' }}></span>
          </div>
          <div className="skill-row">
            <span>Technical skills</span>
            <div className="mini-progress">
              <span style={{ width: '74%' }}></span>
            </div>
            <b>74%</b>
          </div>
          <div className="skill-row">
            <span>Communication</span>
            <div className="mini-progress">
              <span style={{ width: '68%' }}></span>
            </div>
            <b>68%</b>
          </div>
          <div className="skill-row">
            <span>Aptitude</span>
            <div className="mini-progress">
              <span style={{ width: '82%' }}></span>
            </div>
            <b>82%</b>
          </div>
        </div>

        <div className="panel ai-panel">
          <div className="ai-heading">
            <span className="ai-star">✳</span>
            <div>
              <h2>AI career insight</h2>
              <p>Recommendation based on sample skills data</p>
            </div>
          </div>
          <h3>{currentInsight.title}</h3>
          <p>{currentInsight.desc}</p>
          <button
            type="button"
            className="outline-btn"
            id="refreshInsight"
            onClick={handleRefreshInsight}
          >
            Generate another insight ↗
          </button>
        </div>
      </div>
    </section>
  );
};
