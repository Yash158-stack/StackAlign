import React, { useState, useRef } from 'react';
import '../style/home.scss';   
import { useInterview} from '../hooks/useInterview.js';
import { useNavigate } from 'react-router';  

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const resumeInputRef = useRef(null)

    const navigate = useNavigate()
    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current.files[0]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile})
        navigate(`/interview/${data._id}`)
    }

    if(loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <main className='home'>
            <header className="name-header" >
                <div className="name">
                    StackAlign
                </div>
            </header>
            <div className="interview-input-group">
                <div className="left">
                    <textarea 
                    onChange={(e) => {setJobDescription(e.target.value)}}
                    name="jobdescription" 
                    id="jobdescription" 
                    placeholder='Enter job description here'
                    />
                </div>
                <div className="right">
                    <div className="input-group">
                        <label htmlFor="resume">Upload Resume</label>
                        <input ref={resumeInputRef} type="file" name="resume" id="resume" accept='.pdf' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="selfdescription">Self Description</label>
                        <textarea 
                         onChange={(e) => {setSelfDescription(e.target.value)}}
                         name="selfdescription" 
                         id="selfdescription" 
                         placeholder='Enter self description here'
                         />
                    </div>
                    
                    <button
                        onClick={handleGenerateReport}>
                    Generate Interview Report
                    </button>
                </div>
            </div>
            <section className="recent-reports">
                <div className="section-header">
                    <h2>My Recent Interview Plans</h2>
                    <p>Access your saved interview reports and continue reviewing your matched plans.</p>
                </div>
                {reports.length > 0 ? (
                    <div className="reports-list">
                        {reports.map((report) => (
                            <button
                                key={report._id}
                                type="button"
                                className="report-item"
                                onClick={() => navigate(`/interview/${report._id}`)}
                            >
                                <div className="report-content">
                                    <h3>{report.title || 'Untitled Position'}</h3>
                                    <p>{report.jobDescription ? report.jobDescription.slice(0, 80) + '...' : 'Review your generated interview plan.'}</p>
                                </div>
                                <div className="report-meta">
                                    <span>{report.matchScore ? `${report.matchScore}% Match` : 'No score yet'}</span>
                                    <small>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}</small>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No interview reports have been generated yet.</p>
                        <p>Enter a job description, upload your resume, and create your first report.</p>
                    </div>
                )}
            </section>
        </main>
        
    )
}

export default Home