import { SKILL_API_URL, EXCHANGE_API_URL } from "../apiConfig";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ExchangeRequests() {
  const [requests, setRequests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [reqRes, skillsRes] = await Promise.all([
        fetch(EXCHANGE_API_URL + "/exchanges"),
        fetch(SKILL_API_URL + "/skills")
      ]);

      if (!reqRes.ok) throw new Error("Failed to load exchange requests");
      if (!skillsRes.ok) throw new Error("Failed to load skills");

      const reqData = await reqRes.json();
      const skillsData = await skillsRes.json();

      setRequests(reqData);
      setSkills(skillsData);
    } catch (error) {
      console.warn("Backend waking up, using fallback exchange requests:", error);
      setSkills([
        { _id: "demo-skill-1", name: "Cloud Architecture & Kubernetes", description: "Hands-on microservices design, Docker containers, and Kubernetes cluster orchestration.", category: "Cloud Computing", userId: "demo-teacher-alex" }
      ]);
      setRequests([
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

  useEffect(() => {
    loadData();
  }, []);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user ? (user._id || user.id || user.email) : null;

  const updateRequestStatus = async (id, status) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${EXCHANGE_API_URL}/exchanges/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, userId })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update status");
        return;
      }
      setMessage(`Request marked as ${status}`);
      loadData();
    } catch (error) {
      setError("Unable to update request. Make sure Exchange Service is running.");
    }
  };



  const mySkillsIds = skills.filter((s) => s.userId === userId).map((s) => s._id);

  const incomingRequests = requests.filter((r) => mySkillsIds.includes(r.skillId));
  const outgoingRequests = requests.filter((r) => r.requesterId === userId);

  return (
    <div className="w-full pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">Exchange <span className="text-gradient">Requests</span></h1>
        <p className="text-text-muted">Manage your learning and teaching connections.</p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-accent-pink border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Incoming Requests */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-magenta"></span> 
              Incoming Requests ({incomingRequests.length})
            </h3>
            <div className="flex flex-col gap-4">
              {incomingRequests.length === 0 ? (
                <div className="glass-panel p-6 rounded-2xl text-center border-dashed border border-white/10 text-sm text-text-muted">
                  No one has requested your skills yet.
                </div>
              ) : (
                incomingRequests.map((req) => {
                  const skill = skills.find((s) => s._id === req.skillId);
                  return (
                    <div key={req._id} className="glass-panel p-5 rounded-2xl border-l-2 border-l-accent-magenta">
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-white uppercase">
                          {req.status}
                        </div>
                        <span className="text-xs text-text-muted">ID: {req._id.slice(-4)}</span>
                      </div>
                      <h4 className="font-medium text-white mb-1">
                        Someone wants to learn <span className="text-accent-pink">{skill?.name || "Unknown Skill"}</span>
                      </h4>
                      <p className="text-sm text-text-muted bg-black/20 p-3 rounded-lg border border-white/5 my-3 italic">
                        "{req.message}"
                      </p>
                      
                      {req.status === "pending" && (
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => updateRequestStatus(req._id, "accepted")}
                            className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium rounded-xl transition"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => updateRequestStatus(req._id, "rejected")}
                            className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {req.status === "accepted" && (
                        <div className="mt-4">
                           <Link to={`/workspace/${req._id}`} className="block w-full text-center py-2 bg-gradient-to-tr from-accent-pink to-accent-magenta text-white text-sm font-medium rounded-xl transition hover:opacity-90">
                             Open Shared Workspace
                           </Link>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Outgoing Requests */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-pink"></span> 
              Sent Requests ({outgoingRequests.length})
            </h3>
            <div className="flex flex-col gap-4">
              {outgoingRequests.length === 0 ? (
                <div className="glass-panel p-6 rounded-2xl text-center border-dashed border border-white/10 text-sm text-text-muted">
                  You haven't requested any skills yet.
                </div>
              ) : (
                outgoingRequests.map((req) => {
                  const skill = skills.find((s) => s._id === req.skillId);
                  return (
                    <div key={req._id} className="glass-panel p-5 rounded-2xl">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-white">
                          You requested <span className="text-accent-pink">{skill?.name || "Unknown Skill"}</span>
                        </h4>
                        <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                          req.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {req.status}
                        </div>
                      </div>
                      <p className="text-sm text-text-muted line-clamp-2 mb-3">
                        Your message: "{req.message}"
                      </p>
                      {req.status === "accepted" && (
                        <div className="mt-2">
                           <Link to={`/workspace/${req._id}`} className="block w-full text-center py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition">
                             Go to Workspace
                           </Link>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExchangeRequests;