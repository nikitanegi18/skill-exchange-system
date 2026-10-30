import { SKILL_API_URL, EXCHANGE_API_URL } from "../apiConfig";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exchange, setExchange] = useState(null);
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);


  const [assignmentTitle, setAssignmentTitle] = useState("");
  
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionTime, setSessionTime] = useState("");

  const [quizTitle, setQuizTitle] = useState("");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState("A,B,C,D");
  const [quizAnswer, setQuizAnswer] = useState("A");

  const [activeSubmissionIndex, setActiveSubmissionIndex] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeGradeIndex, setActiveGradeIndex] = useState(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  const [activeQuizIndex, setActiveQuizIndex] = useState(null);
  const [quizAttemptAnswer, setQuizAttemptAnswer] = useState("");

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) {
      navigate("/auth");
      return;
    }
    setUser(u);
    loadWorkspace();
  }, [id, navigate]);

  const loadWorkspace = async () => {
    try {
      const res = await fetch(`${EXCHANGE_API_URL}/exchanges/${id}`);
      if (!res.ok) throw new Error("Failed to load workspace");
      const data = await res.json();
      setExchange(data);

      const skillRes = await fetch(SKILL_API_URL + "/skills");
      if (skillRes.ok) {
        const skills = await skillRes.json();
        const found = skills.find(s => s._id === data.skillId);
        setSkill(found);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (newWorkspace) => {
    try {
      const res = await fetch(`${EXCHANGE_API_URL}/exchanges/${id}/workspace`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace: newWorkspace })
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setExchange(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const [noteContent, setNoteContent] = useState("");
  const [noteUrl, setNoteUrl] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const addNote = async () => {
    if (!noteContent && !uploadFile && !noteUrl) return;
    
    let finalUrl = noteUrl;
    
    if (uploadFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      
      try {
        const res = await fetch(`${EXCHANGE_API_URL}/exchanges/${id}/upload`, {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        finalUrl = data.url;
      } catch (err) {
        alert("Failed to upload file. " + err.message);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const notes = [...(exchange.workspace?.notes || []), {
      authorId: user.id || user._id || user.email,
      authorName: user.username || user.email?.split("@")[0] || "User",
      content: noteContent || (uploadFile ? `Uploaded a file: ${uploadFile.name}` : ""),
      url: finalUrl || ""
    }];
    updateWorkspace({ ...exchange.workspace, notes });
    setNoteContent("");
    setNoteUrl("");
    setUploadFile(null);
  };

  const addSession = () => {
    if (!sessionTopic || !sessionTime) return;
    const meetId = Math.random().toString(36).substring(2, 12);
    const sessions = [...(exchange.workspace?.sessions || []), {
      topic: sessionTopic,
      date: sessionTime,
      meetingLink: `https://meet.jit.si/SkillExchange_${meetId}`,
      status: "scheduled"
    }];
    updateWorkspace({ ...exchange.workspace, sessions });
    setSessionTopic("");
    setSessionTime("");
  };

  const addAssignment = () => {
    if (!assignmentTitle) return;
    const assignments = [...(exchange.workspace?.assignments || []), {
      title: assignmentTitle,
      instructions: "Complete this before our next session.",
      status: "pending",
      submission: "",
      feedback: "",
      score: 0
    }];
    updateWorkspace({ ...exchange.workspace, assignments });
    setAssignmentTitle("");
  };

  const addQuiz = () => {
    if(!quizTitle || !quizQuestion) return;
    const opts = quizOptions.split(',').map(s=>s.trim());
    const quizzes = [...(exchange.workspace?.quizzes || []), {
      title: quizTitle,
      questions: [{ question: quizQuestion, options: opts, answer: quizAnswer }],
      attempts: []
    }];
    updateWorkspace({...exchange.workspace, quizzes});
    setQuizTitle("");
    setQuizQuestion("");
  };

  const submitAssignment = async (index) => {
    if (!submissionText && !submissionFile) return;
    
    let subContent = submissionText;

    if (submissionFile) {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", submissionFile);
      
      try {
        const res = await fetch(`${EXCHANGE_API_URL}/exchanges/${id}/upload`, {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        subContent += (subContent ? ` | Attachment: ${data.url}` : `Attachment: ${data.url}`);
      } catch (err) {
        alert("Failed to upload file. " + err.message);
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }

    const assignments = [...exchange.workspace.assignments];
    assignments[index].submission = subContent;
    assignments[index].status = "submitted";
    updateWorkspace({ ...exchange.workspace, assignments });
    
    setActiveSubmissionIndex(null);
    setSubmissionText("");
    setSubmissionFile(null);
  };

  const gradeAssignment = (index) => {
    if (gradeScore === "" || !gradeFeedback) return;
    const assignments = [...exchange.workspace.assignments];
    assignments[index].score = Number(gradeScore);
    assignments[index].feedback = gradeFeedback;
    assignments[index].status = "completed";
    updateWorkspace({ ...exchange.workspace, assignments });
    
    setActiveGradeIndex(null);
    setGradeScore("");
    setGradeFeedback("");
  };

  const takeQuiz = (quizIndex) => {
    if (!quizAttemptAnswer) return;
    const quizzes = [...exchange.workspace.quizzes];
    const q = quizzes[quizIndex];
    
    let score = 0;
    if (q.questions[0].answer.toLowerCase() === quizAttemptAnswer.toLowerCase()) score = 100;
    
    q.attempts.push({ userId: user.id || user._id || user.email, score, total: 100 });
    updateWorkspace({...exchange.workspace, quizzes});
    
    setActiveQuizIndex(null);
    setQuizAttemptAnswer("");
    alert(`Quiz completed! You scored ${score}%`);
  };

  const submitRating = async () => {
    if (!review) return;
    try {
      const res = await fetch(`${EXCHANGE_API_URL}/exchanges/${id}/rate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review })
      });
      if (!res.ok) throw new Error("Rating failed");
      const data = await res.json();
      setExchange(data);
      alert("Thanks for your review!");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  if (loading) return <div className="text-white p-8 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent-pink border-t-transparent animate-spin"></div></div>;
  if (error) return <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl m-8 text-sm">{error}</div>;
  if (!exchange) return null;

  const currentUserId = user.id || user._id || user.email;
  const isTeacher = skill?.userId === currentUserId;

  return (
    <div className="w-full pb-12">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Learning <span className="text-gradient">Workspace</span></h1>
          <p className="text-text-muted flex items-center gap-2">
            <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/10 text-white">Skill: {skill?.name || "Unknown"}</span>
            <span className={`px-2 py-1 rounded text-xs border font-medium ${isTeacher ? 'bg-accent-pink/20 text-accent-pink border-accent-pink/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
              Role: {isTeacher ? "Teacher" : "Student"}
            </span>
          </p>
        </div>
        <button onClick={() => navigate('/messages')} className="glow-button px-5 py-2.5 rounded-xl text-white text-sm font-medium shadow-lg">
          💬 Open Secure Chat
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sessions Panel */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">📅</div>
             <h2 className="text-xl font-semibold text-white">Video Sessions</h2>
          </div>
          
          <div className="flex flex-col gap-3 mb-6 bg-black/20 p-4 rounded-2xl border border-white/5">
            <input 
              type="text" placeholder="Session Topic" value={sessionTopic} onChange={e => setSessionTopic(e.target.value)}
              className="bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-accent-pink transition"
            />
            <input 
              type="datetime-local" value={sessionTime} onChange={e => setSessionTime(e.target.value)}
              className="bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-accent-pink transition appearance-none"
            />
            <button onClick={addSession} className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition">
              Schedule Session
            </button>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
            {(exchange.workspace?.sessions || []).length === 0 && <p className="text-sm text-text-muted text-center py-4">No sessions scheduled yet.</p>}
            {(exchange.workspace?.sessions || []).map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-white">{s.topic}</span>
                  <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">{new Date(s.date).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                   <a href={s.meetingLink} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 bg-gradient-to-tr from-accent-pink to-accent-magenta text-white rounded-lg hover:opacity-90 font-medium">
                     Join Jitsi Meeting
                   </a>
                   <span className="text-[10px] text-text-muted uppercase tracking-wider">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources & Notes Panel */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">📚</div>
             <h2 className="text-xl font-semibold text-white">Shared Resources</h2>
          </div>
          
          <div className="flex flex-col gap-4 overflow-y-auto h-[250px] pr-2 mb-6">
            {(exchange.workspace?.notes || []).length === 0 && <p className="text-sm text-text-muted text-center py-4">No resources shared yet.</p>}
            {(exchange.workspace?.notes || []).map((n, i) => {
               const isMe = n.authorId === currentUserId;
               return (
              <div key={i} className={`p-4 rounded-2xl max-w-[85%] ${isMe ? 'self-end bg-gradient-to-tr from-[#2B2B33] to-[#1C1C21] border-white/10' : 'self-start bg-[#1A1A1E] border-white/5'} border`}>
                <div className="flex justify-between items-end mb-1.5">
                   <span className={`text-xs font-medium ${isMe ? 'text-accent-pink' : 'text-blue-400'}`}>{n.authorName}</span>
                </div>
                <div className="text-sm text-white/90 leading-relaxed">{n.content}</div>
                {n.url && (
                  <a href={n.url} target="_blank" rel="noreferrer" className="block mt-2 text-xs text-accent-magenta hover:underline bg-black/20 p-2 rounded-lg border border-white/5 truncate">
                    🔗 {n.url}
                  </a>
                )}
              </div>
            )})}
          </div>
          
          <div className="mt-auto bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-2">
               <input 
                 type="text" placeholder="Type a note or resource description..." value={noteContent} onChange={e => setNoteContent(e.target.value)}
                 className="flex-1 bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent-pink transition"
               />
               <input 
                 type="text" placeholder="Resource link (optional)..." value={noteUrl} onChange={e => setNoteUrl(e.target.value)}
                 className="w-full md:w-1/3 bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent-pink transition"
               />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 justify-between mt-1">
               <div className="flex items-center gap-2 w-full md:w-auto">
                 <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-xs text-white transition flex items-center gap-2">
                   <span>📎 {uploadFile ? uploadFile.name : "Attach File (PDF, DOC, IMG)"}</span>
                   <input type="file" className="hidden" onChange={e => setUploadFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" />
                 </label>
                 {uploadFile && (
                   <button onClick={() => setUploadFile(null)} className="text-red-400 text-xs hover:underline">Remove</button>
                 )}
               </div>
               <button onClick={addNote} disabled={isUploading} className="w-full md:w-auto glow-button px-6 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-50">
                 {isUploading ? "Uploading..." : "Post Resource"}
               </button>
            </div>
          </div>
        </div>

        {/* Assignments Panel */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">📝</div>
             <h2 className="text-xl font-semibold text-white">Assignments</h2>
          </div>
          
          {isTeacher && (
            <div className="flex gap-3 mb-6 bg-black/20 p-3 rounded-2xl border border-white/5">
              <input 
                type="text" placeholder="New Assignment Title" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)}
                className="flex-1 bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent-pink transition"
              />
              <button onClick={addAssignment} className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition">Assign</button>
            </div>
          )}
          
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
            {(exchange.workspace?.assignments || []).length === 0 && <p className="text-sm text-text-muted text-center py-4">No assignments yet.</p>}
            {(exchange.workspace?.assignments || []).map((a, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-white">{a.title}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold ${
                    a.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                    a.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {a.status}
                  </span>
                </div>
                
                {a.status === 'submitted' && (
                  <div className="text-xs text-gray-300 bg-black/20 p-2 rounded mb-2 border border-white/5">
                    <strong>Submission:</strong> {a.submission}
                  </div>
                )}
                
                {a.status === 'completed' && (
                  <div className="text-xs bg-green-500/10 p-2 rounded mb-2 border border-green-500/20 text-green-400">
                    <strong>Score: {a.score}/100</strong> - {a.feedback}
                  </div>
                )}

                <div className="mt-3 flex justify-end gap-2">
                   {!isTeacher && a.status === 'pending' && activeSubmissionIndex !== i && (
                     <button onClick={() => setActiveSubmissionIndex(i)} className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium">Submit Work</button>
                   )}
                   {isTeacher && a.status === 'submitted' && activeGradeIndex !== i && (
                     <button onClick={() => setActiveGradeIndex(i)} className="text-xs px-3 py-1.5 bg-accent-pink/20 hover:bg-accent-pink/30 text-accent-pink rounded-lg transition font-medium border border-accent-pink/20">Grade Submission</button>
                   )}
                </div>
                
                {isTeacher && a.status === 'submitted' && activeGradeIndex === i && (
                  <div className="mt-4 bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                    <p className="text-xs text-text-muted">Grade this submission:</p>
                    <div className="flex gap-2">
                      <input 
                        type="number" min="0" max="100" placeholder="Score (0-100)" 
                        value={gradeScore} onChange={e => setGradeScore(e.target.value)}
                        className="w-1/3 bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-accent-pink transition"
                      />
                      <input 
                        type="text" placeholder="Feedback..." 
                        value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)}
                        className="flex-1 bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-accent-pink transition"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                       <button onClick={() => setActiveGradeIndex(null)} className="px-3 py-2 text-xs text-text-muted hover:text-white">Cancel</button>
                       <button onClick={() => gradeAssignment(i)} className="glow-button px-4 py-2 rounded-lg text-white font-medium text-xs">
                         Save Grade
                       </button>
                    </div>
                  </div>
                )}
                
                {!isTeacher && a.status === 'pending' && activeSubmissionIndex === i && (
                  <div className="mt-4 bg-black/20 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-text-muted mb-2">Submit your assignment:</p>
                    <textarea 
                      rows="2" placeholder="Text answer or link..." 
                      value={submissionText} onChange={e => setSubmissionText(e.target.value)}
                      className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-accent-pink transition resize-none mb-2"
                    ></textarea>
                    <div className="flex flex-col md:flex-row justify-between gap-2">
                       <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-xs text-white transition flex items-center gap-2">
                         <span>📎 {submissionFile ? submissionFile.name : "Attach File"}</span>
                         <input type="file" className="hidden" onChange={e => setSubmissionFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" />
                       </label>
                       <div className="flex gap-2">
                         <button onClick={() => setActiveSubmissionIndex(null)} className="px-3 py-2 text-xs text-text-muted hover:text-white">Cancel</button>
                         <button onClick={() => submitAssignment(i)} disabled={isSubmitting} className="glow-button px-4 py-2 rounded-lg text-white font-medium text-xs disabled:opacity-50">
                           {isSubmitting ? "Uploading..." : "Submit"}
                         </button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quizzes Panel */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">🏆</div>
             <h2 className="text-xl font-semibold text-white">Quizzes</h2>
          </div>
          
          {isTeacher && (
            <div className="flex flex-col gap-3 mb-6 bg-black/20 p-4 rounded-2xl border border-white/5">
              <input 
                type="text" placeholder="Quiz Title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)}
                className="bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-accent-pink transition"
              />
              <input 
                type="text" placeholder="Question" value={quizQuestion} onChange={e => setQuizQuestion(e.target.value)}
                className="bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-accent-pink transition"
              />
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Options (comma separated)" value={quizOptions} onChange={e => setQuizOptions(e.target.value)}
                  className="flex-1 bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-accent-pink transition"
                />
                <input 
                  type="text" placeholder="Answer" value={quizAnswer} onChange={e => setQuizAnswer(e.target.value)}
                  className="w-24 bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-accent-pink transition"
                />
              </div>
              <button onClick={addQuiz} className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition">Publish Quiz</button>
            </div>
          )}
          
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
            {(exchange.workspace?.quizzes || []).length === 0 && <p className="text-sm text-text-muted text-center py-4">No quizzes available.</p>}
            {(exchange.workspace?.quizzes || []).map((q, i) => {
              const myAttempt = q.attempts.find(a => a.userId === currentUserId);
              return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition flex flex-col justify-between">
                <div>
                  <h4 className="font-medium text-white mb-1">{q.title}</h4>
                  <p className="text-xs text-text-muted">{q.questions.length} Question(s)</p>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                   {myAttempt ? (
                     <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">Score: {myAttempt.score}%</span>
                   ) : (
                     <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">Not attempted</span>
                   )}
                   
                   {!isTeacher && !myAttempt && activeQuizIndex !== i && (
                     <button onClick={() => setActiveQuizIndex(i)} className="text-xs px-3 py-1.5 bg-gradient-to-tr from-accent-pink to-accent-magenta text-white rounded-lg transition font-medium hover:opacity-90">Take Quiz</button>
                   )}
                </div>

                {!isTeacher && !myAttempt && activeQuizIndex === i && (
                  <div className="mt-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    <p className="text-sm text-white font-medium mb-3">{q.questions[0].question}</p>
                    <div className="flex flex-col gap-2 mb-4">
                      {q.questions[0].options.map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-3 cursor-pointer bg-white/5 hover:bg-white/10 p-2 rounded-lg transition">
                          <input 
                            type="radio" name={`quiz-${i}`} value={opt}
                            checked={quizAttemptAnswer === opt}
                            onChange={() => setQuizAttemptAnswer(opt)}
                            className="accent-accent-pink"
                          />
                          <span className="text-sm text-white">{opt}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                       <button onClick={() => { setActiveQuizIndex(null); setQuizAttemptAnswer(""); }} className="px-3 py-2 text-xs text-text-muted hover:text-white">Cancel</button>
                       <button onClick={() => takeQuiz(i)} className="glow-button px-4 py-2 rounded-lg text-white font-medium text-xs">
                         Submit Answer
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )})}
          </div>
        </div>
      </div>

      {/* Ratings Panel */}
      {!isTeacher && (
        <div className="mt-6 glass-panel p-6 rounded-3xl">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-[#D07BFF]">⭐</span> Rate this Partnership
          </h2>
          {exchange.review ? (
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <p className="text-sm text-white mb-2">You rated: <strong className="text-yellow-400">{exchange.rating} / 5</strong></p>
              <p className="text-sm text-text-muted italic">"{exchange.review}"</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-w-lg bg-black/20 p-4 rounded-2xl border border-white/5">
              <p className="text-sm text-text-muted mb-2">How was your learning experience?</p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)}
                  className="flex-1 accent-accent-pink"
                />
                <span className="text-white font-bold">{rating} / 5</span>
              </div>
              <textarea 
                rows="2" placeholder="Write a short review..." value={review} onChange={e => setReview(e.target.value)}
                className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-accent-pink transition resize-none mt-2"
              ></textarea>
              <button onClick={submitRating} className="glow-button mt-2 py-2.5 rounded-xl text-white text-sm font-medium transition self-start px-6">Submit Review</button>
            </div>
          )}
        </div>
      )}
      
      {isTeacher && exchange.review && (
        <div className="mt-6 glass-panel p-6 rounded-3xl">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-[#D07BFF]">⭐</span> Student Feedback
          </h2>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl max-w-lg">
            <p className="text-sm text-white mb-2">Rating received: <strong className="text-yellow-400">{exchange.rating} / 5</strong></p>
            <p className="text-sm text-text-muted italic">"{exchange.review}"</p>
          </div>
        </div>
      )}
      
    </div>
  );
}
