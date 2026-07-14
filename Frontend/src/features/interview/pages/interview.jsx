import React, { useState, useEffect } from 'react';
import '../style/interview.scss';
import { useInterview } from '../hooks/useInterview';
import { useNavigate, useParams } from 'react-router'

const navItems = [
  { key: 'technicalQuestions', label: 'Technical questions' },
  { key: 'behaviouralQuestions', label: 'Behavioral questions' },
  { key: 'preparationPlan', label: 'Road Map' },
];

const Interview = () => {
  const [activeSection, setActiveSection] = useState('technicalQuestions');
  const {report, getReportById, loading, getResumePdf} = useInterview()
  const { interviewId } = useParams()

  useEffect(() => {
      getReportById(interviewId)
  }, [ interviewId ]
)

    if(loading || !report) {
      return (
        <main>
          <h1>Loading your interview plan...</h1>
        </main>
      )
      
    }
  return (
    <main className="interview-page">
      <aside className="panel nav-panel">
        <div className="panel-title">Review</div>
        <div className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="panel content-panel">
        <div className="page-header">
          <div>
            <h1>Interview Report</h1>
            <p className="subtitle">Review key questions, answers, and preparation guidance in one place.</p>
          </div>
          <div className="score-badge">{report.matchScore}% Match</div>
        </div>

        <div className="content-body">
          {activeSection === 'technicalQuestions' && (
            <div className="section-block">
              <h2 className="section-title">Technical questions</h2>
              <div className="cards-grid">
                {report.technicalQuestions.map((item, index) => (
                  <article className="question-card" key={index}>
                    <div className="card-header">
                      <span className="card-label">Question {index + 1}</span>
                      <span className="badge">Technical</span>
                    </div>
                    <h3>{item.question}</h3>
                    <p className="intention">Intent: {item.intention}</p>
                    <div className="answer-block">
                      <h4>Recommended answer</h4>
                      <p>{item.answer}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'behaviouralQuestions' && (
            <div className="section-block">
              <h2 className="section-title">Behavioral questions</h2>
              <div className="cards-grid">
                {report.behaviouralQuestions.map((item, index) => (
                  <article className="question-card" key={index}>
                    <div className="card-header">
                      <span className="card-label">Question {index + 1}</span>
                      <span className="badge">Behavioral</span>
                    </div>
                    <h3>{item.question}</h3>
                    <p className="intention">Intent: {item.intention}</p>
                    <div className="answer-block">
                      <h4>Recommended answer</h4>
                      <p>{item.answer}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'preparationPlan' && (
            <div className="section-block">
              <h2 className="section-title">Road map</h2>
              <div className="plan-grid">
                {report.preparationPlan.map((item) => (
                  <article className="plan-card" key={item.day}>
                    <div className="plan-header">
                      <span>Day {item.day}</span>
                      <strong>{item.focus}</strong>
                    </div>
                    <ul>
                      {item.tasks.map((task, taskIndex) => (
                        <li key={taskIndex}>{task}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="panel right-panel">
        <div className="panel-title">Skill Gaps</div>
        <div className="gap-list">
          {report.skillGaps.map((item, index) => (
            <span key={index} className="gap-pill">
              {item.skill}
            </span>
          ))}
        </div>

        <div className="stats-card">
          <div className="stats-title">Quick summary</div>
          <div className="stats-row">
            <span>Technical</span>
            <strong>{report.technicalQuestions.length}</strong>
          </div>
          <div className="stats-row">
            <span>Behavioral</span>
            <strong>{report.behaviouralQuestions.length}</strong>
          </div>
          <div className="stats-row">
            <span>Plan days</span>
            <strong>{report.preparationPlan.length}</strong>
          </div>
        </div>
        <button
        onClick={() => getResumePdf(interviewId)}
         className='download-pdf'>Download AI generated Resume</button>
      </aside>
    </main>
  );
};

export default Interview;
