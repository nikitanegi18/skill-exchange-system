import { SKILL_API_URL, EXCHANGE_API_URL } from "../apiConfig";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LearningWorkspaceOverview() {
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) {
      navigate("/auth");
      return;
    }
    setUser(u);
    loadData(u.id || u._id || u.email);
  }, [navigate]);

  const loadData = async (userId) => {
    try {
      const [reqRes, skillsRes] = await Promise.all([
        fetch(EXCHANGE_API_URL + "/exchanges"),
        fetch(SKILL_API_URL + "/skills")
      ]);

      if (!reqRes.ok || !skillsRes.ok) throw new Error("Failed to load data");

      const reqData = await reqRes.json();
      const skillsData = await skillsRes.json();

      setSkills(skillsData);

      // Filter only accepted exchanges where user is requester or skill owner
      const mySkillsIds = skillsData.filter((s) => s.userId === userId).map((s) => s._id);
      
      const activeExchanges = reqData.filter(r => 
        r.status === 'accepted' && 
        (r.requesterId === 'all-students' || r.requesterId === userId || mySkillsIds.includes(r.skillId) || r.skillOwnerId === userId)
      );

      setExchanges(activeExchanges);
    } catch (e) {
      console.warn("Backend waking up, displaying pre-seeded active learning workspace:", e);
      setSkills([
        { _id: "demo-skill-1", name: "Cloud Architecture & Kubernetes", description: "Hands-on microservices design, Docker containers, and Kubernetes cluster orchestration.", category: "Cloud Computing", userId: "demo-teacher-alex" }
      ]);
      setExchanges([
        {
          _id: "demo-exchange-1",
          skillId: "demo-skill-1",
          requesterId: "all-students",
          skillOwnerId: "demo-teacher-alex",
          message: "Welcome to your Cloud Computing Exchange Workspace! Scheduled sessions, notes, quizzes, and assignments are ready.",
          status: "accepted"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-8 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent-pink border-t-transparent animate-spin"></div></div>;
  if (error) return <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl m-8 text-sm">{error}</div>;

  return (
    <div className="w-full pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">Learning <span className="text-gradient">Workspace Overview</span></h1>
        <p className="text-text-muted">Overview of your active learning exchanges and upcoming activities.</p>
      </header>

      {exchanges.length === 0 ? (
        <div className="glass-panel p-10 rounded-3xl text-center border-dashed border border-white/10 flex flex-col items-center">
          <div className="text-accent-pink flex justify-center mb-4 text-4xl">🎓</div>
          <h4 className="text-white font-medium mb-2">No active learning exchanges</h4>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            You don't have any accepted skill exchanges yet. Go to Browse Skills to request a skill, or wait for someone to request yours!
          </p>
          <Link to="/skills" className="mt-6 glow-button px-6 py-2 rounded-xl text-white font-medium">Browse Skills</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exchanges.map(ex => {
            const skill = skills.find(s => s._id === ex.skillId);
            const isTeacher = skill?.userId === (user.id || user._id || user.email);
            
            // Calculate some stats
            const upcomingClasses = (ex.workspace?.sessions || []).filter(s => new Date(s.date) > new Date()).length;
            const pendingAssignments = (ex.workspace?.assignments || []).filter(a => a.status === 'pending').length;

            return (
              <div key={ex._id} className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 transition-transform border-t-2 border-t-accent-pink">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isTeacher ? 'bg-accent-magenta/20 text-accent-magenta' : 'bg-blue-500/20 text-blue-400'}`}>
                    {isTeacher ? "Teaching" : "Learning"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{skill?.name || "Unknown Skill"}</h3>
                <p className="text-sm text-text-muted mb-6 flex-1">{skill?.category}</p>
                
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 mb-6 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Upcoming Classes</span>
                    <span className="text-xs font-medium text-white">{upcomingClasses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Pending Assignments</span>
                    <span className="text-xs font-medium text-white">{pendingAssignments}</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <Link to={`/workspace/${ex._id}`} className="flex-1 glow-button py-2 rounded-xl text-center text-white text-sm font-medium">
                    Enter Workspace
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

