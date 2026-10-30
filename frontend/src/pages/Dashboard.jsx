import { SKILL_API_URL, EXCHANGE_API_URL } from "../apiConfig";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [requestTab, setRequestTab] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/auth");
        return;
      }
      setUser(JSON.parse(storedUser));
    } catch {
      navigate("/auth");
      return;
    }

    fetch(SKILL_API_URL + "/skills")
      .then((res) => {
        if (!res.ok) throw new Error("Skills unavailable");
        return res.json();
      })
      .then(setSkills)
      .catch((err) => {
        console.warn("Using local skills for dashboard:", err);
        const localSkills = JSON.parse(localStorage.getItem("cloud_skills") || "null");
        setSkills(localSkills || [
          { _id: "demo-skill-1", name: "Cloud Architecture & Kubernetes", description: "Hands-on microservices design, Docker containers, and Kubernetes cluster orchestration.", category: "Cloud Computing", userId: "demo-teacher-alex" }
        ]);
      });

    fetch(EXCHANGE_API_URL + "/exchanges")
      .then((res) => {
        if (!res.ok) throw new Error("Requests unavailable");
        return res.json();
      })
      .then(setRequests)
      .catch((err) => {
        console.warn("Using local exchanges for dashboard:", err);
        const localEx = JSON.parse(localStorage.getItem("cloud_exchanges") || "null");
        setRequests(localEx || [
          {
            _id: "demo-exchange-1",
            skillId: "demo-skill-1",
            requesterId: "all-students",
            skillOwnerId: "demo-teacher-alex",
            message: "Welcome to your Cloud Computing Exchange Workspace! Scheduled sessions, notes, quizzes, and assignments are ready.",
            status: "accepted"
          }
        ]);
      });
  }, [navigate]);

  const userId = user?._id || user?.id || user?.email;
  const mySkills = skills.filter((skill) => skill.userId === userId);
  const myRequests = requests.filter((request) => request.requesterId === userId);
  
  const displayedRequests = requestTab === "all" 
    ? myRequests 
    : myRequests.filter(req => req.status === "pending");

  const accepted = myRequests.filter((request) => request.status === "accepted").length;
  const pending = myRequests.filter((request) => request.status === "pending").length;

  const displayName = user?.name || user?.email?.split("@")[0] || "Student";
  const initials = displayName.slice(0, 2).toUpperCase();

  const notifications = [];
  myRequests.filter(r => r.status === 'pending').forEach(r => {
    notifications.push({ text: `Exchange request pending.`, type: 'request' });
  });
  myRequests.filter(r => r.status === 'accepted').forEach(r => {
    (r.workspace?.assignments || []).filter(a => a.status === 'completed').forEach(a => {
      notifications.push({ text: `Assignment "${a.title}" graded: ${a.score}/100`, type: 'assignment' });
    });
    (r.workspace?.sessions || []).forEach(s => {
       if (new Date(s.date) > new Date()) {
         notifications.push({ text: `Upcoming session: ${s.topic}`, type: 'session' });
       }
    });
  });

  return (
    <div className="w-full">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-medium tracking-tight text-white mb-1">
            Welcome, <span className="text-[#E7A5FF] font-semibold">{displayName}</span>
          </h1>
          <p className="text-text-muted text-sm tracking-wide">Here's your skill exchange portfolio overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-full bg-panel-dark border border-white/5 flex items-center justify-center hover:bg-white/5 transition text-lg"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-[#141418]"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#1A1A1E] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                  <h4 className="text-white font-medium text-sm">Notifications</h4>
                  <span className="text-xs text-accent-pink">{notifications.length} new</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-text-muted">You're all caught up!</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer">
                        <p className="text-sm text-white/90">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => alert("Settings page coming soon!")}
            className="w-10 h-10 rounded-full bg-panel-dark border border-white/5 flex items-center justify-center hover:bg-white/5 transition text-lg"
          >
            ⚙️
          </button>
          <div className="flex items-center gap-3 bg-panel-dark pl-2 pr-4 py-1.5 rounded-full border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D07BFF] to-[#FF5E98] flex items-center justify-center font-bold text-sm text-white">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white leading-tight">{displayName}</span>
              <span className="text-[10px] text-text-muted leading-tight">{user?.email || "user@email.com"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Stats & CTA) */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D07BFF]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-base text-text-muted font-medium">Total Skills Shared</h3>
              <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-white border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-white/10" onClick={() => alert("Filter by time feature coming soon!")}>
                6M <span className="text-[10px]">▼</span>
              </div>
            </div>
            <p className="text-5xl font-bold text-white mb-2 relative z-10 tracking-tight">{mySkills.length}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between flex-1 min-h-[240px]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-t from-[#D07BFF]/40 to-transparent blur-xl pointer-events-none"></div>
            <div className="relative z-10 text-center flex flex-col items-center justify-center h-full pt-4">
              <h3 className="text-xl font-semibold text-white mb-2">Connections Powered by Community</h3>
              <p className="text-sm text-text-muted mb-8 leading-relaxed max-w-[250px]">
                Move beyond guesswork with peer-driven insights tailored to your goals.
              </p>
              <Link to="/skills" className="glow-button px-8 py-3 rounded-full text-white font-medium text-sm inline-block tracking-wide">
                Explore Skill Insights
              </Link>
            </div>
          </div>
        </div>

        {/* Middle Column (Activity/Watchlist) */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-white">Recent Requests</h3>
            <div className="flex bg-[#111114] rounded-full p-1 border border-white/5">
              <button 
                onClick={() => setRequestTab("all")}
                className={`px-4 py-1.5 rounded-full text-xs shadow-sm transition ${requestTab === "all" ? "bg-[#2B2B33] text-white" : "bg-transparent text-text-muted hover:text-white"}`}
              >
                All
              </button>
              <button 
                onClick={() => setRequestTab("pending")}
                className={`px-4 py-1.5 rounded-full text-xs shadow-sm transition ${requestTab === "pending" ? "bg-[#2B2B33] text-white" : "bg-transparent text-text-muted hover:text-white"}`}
              >
                Pending
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {displayedRequests.slice(0, 4).map((req, i) => (
              <Link to="/requests" key={i} className="flex justify-between items-center p-3 rounded-2xl hover:bg-white/5 transition border border-transparent hover:border-white/5 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B2B33] to-[#1C1C21] flex items-center justify-center text-lg shadow-inner">
                    {req.status === 'accepted' ? '✅' : '⏳'}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Exchange #{req.skillId.slice(-4)}</p>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">{req.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-sm ${req.status === 'accepted' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {req.status === 'accepted' ? '+ Active' : 'Pending'}
                  </p>
                </div>
              </Link>
            ))}
            {displayedRequests.length === 0 && (
              <div className="text-center py-10">
                <p className="text-text-muted text-sm mb-4">No recent activity.</p>
                <Link to="/skills" className="text-xs text-[#D07BFF] hover:underline">Find a skill →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (My Portfolio / Summary) */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-white">My Portfolio</h3>
            <div className="flex gap-2">
              <Link to="/requests" className="px-4 py-1 rounded-full border border-white/10 text-xs text-white hover:bg-white/5">See all</Link>
              <Link to="/requests" className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-xs text-white">
                ↗
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            <Link to="/requests" className="bg-[#18181D] p-4 rounded-2xl border border-white/5 flex flex-col justify-between hover:bg-[#1E1E24] transition cursor-pointer">
              <div>
                <p className="text-lg font-semibold text-white mb-1">{accepted}</p>
                <p className="text-xs text-green-400 font-medium">+ Accepted</p>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">A</div>
                <span className="text-[10px] text-text-muted">Total connections</span>
              </div>
            </Link>
            
            <Link to="/requests" className="bg-[#18181D] p-4 rounded-2xl border border-white/5 flex flex-col justify-between hover:bg-[#1E1E24] transition cursor-pointer">
              <div>
                <p className="text-lg font-semibold text-white mb-1">{pending}</p>
                <p className="text-xs text-green-400 font-medium">+ Pending</p>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">P</div>
                <span className="text-[10px] text-text-muted">Awaiting response</span>
              </div>
            </Link>
            
            <Link to="/my-skills" className="bg-[#18181D] p-4 rounded-2xl border border-white/5 flex flex-col justify-between hover:bg-[#1E1E24] transition cursor-pointer">
              <div>
                <p className="text-lg font-semibold text-white mb-1">{mySkills.length}</p>
                <p className="text-xs text-green-400 font-medium">+ Active</p>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">S</div>
                <span className="text-[10px] text-text-muted">My Skills</span>
              </div>
            </Link>

            <div onClick={() => alert("Ratings feature coming soon!")} className="bg-[#18181D] p-4 rounded-2xl border border-white/5 flex flex-col justify-between hover:bg-[#1E1E24] transition cursor-pointer">
              <div>
                <p className="text-lg font-semibold text-white mb-1">Top</p>
                <p className="text-xs text-green-400 font-medium">+ Rated</p>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="w-6 h-6 rounded-full bg-[#D07BFF]/20 text-[#D07BFF] flex items-center justify-center text-xs">⭐</div>
                <span className="text-[10px] text-text-muted">Feedback</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Activities (Across Workspaces) */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-white">Learning Activities</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="glass-panel p-6 rounded-3xl">
            <h4 className="text-white font-medium mb-4 flex items-center gap-2"><span className="text-blue-400">📅</span> Upcoming Sessions</h4>
            <div className="flex flex-col gap-3">
              {myRequests.filter(r => r.status === 'accepted').flatMap(r => r.workspace?.sessions || []).slice(0, 3).map((s, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="text-sm text-white font-medium">{s.topic}</p>
                  <p className="text-xs text-blue-400">{new Date(s.date).toLocaleString()}</p>
                </div>
              ))}
              {myRequests.filter(r => r.status === 'accepted').flatMap(r => r.workspace?.sessions || []).length === 0 && <p className="text-xs text-text-muted">No sessions scheduled.</p>}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h4 className="text-white font-medium mb-4 flex items-center gap-2"><span className="text-orange-400">📝</span> Pending Assignments</h4>
            <div className="flex flex-col gap-3">
              {myRequests.filter(r => r.status === 'accepted').flatMap(r => r.workspace?.assignments || []).filter(a => a.status === 'pending').slice(0, 3).map((a, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                  <p className="text-sm text-white font-medium">{a.title}</p>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded uppercase font-bold">Pending</span>
                </div>
              ))}
              {myRequests.filter(r => r.status === 'accepted').flatMap(r => r.workspace?.assignments || []).filter(a => a.status === 'pending').length === 0 && <p className="text-xs text-text-muted">No pending assignments.</p>}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h4 className="text-white font-medium mb-4 flex items-center gap-2"><span className="text-purple-400">🏆</span> Quizzes</h4>
            <div className="flex flex-col gap-3">
              {myRequests.filter(r => r.status === 'accepted').flatMap(r => r.workspace?.quizzes || []).slice(0, 3).map((q, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                  <p className="text-sm text-white font-medium">{q.title}</p>
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded uppercase font-bold">{q.questions.length} Qs</span>
                </div>
              ))}
              {myRequests.filter(r => r.status === 'accepted').flatMap(r => r.workspace?.quizzes || []).length === 0 && <p className="text-xs text-text-muted">No quizzes available.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;