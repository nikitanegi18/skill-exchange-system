import { useEffect, useState } from "react";

function BrowseSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadSkills = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch((import.meta.env.VITE_SKILL_API_URL || "http://localhost:5002") + "/skills");
      if (!response.ok) throw new Error("Failed to load skills");
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load skills. Make sure Skill Service is running on port 5002.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleRequestExchange = async (skill) => {
    setMessage("");
    setError("");

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setError("Please login before requesting an exchange.");
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      setError("Your login information is invalid. Please login again.");
      return;
    }

    const userId = user._id || user.id || user.email;
    if (!userId) {
      setError("User information not found. Please login again.");
      return;
    }

    const exchangeMessage = window.prompt(`Why do you want to learn ${skill.name}?`);
    if (!exchangeMessage || !exchangeMessage.trim()) return;

    try {
      const response = await fetch((import.meta.env.VITE_EXCHANGE_API_URL || "http://localhost:5003") + "/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: userId,
          skillId: skill._id,
          message: exchangeMessage.trim()
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create exchange request.");
        return;
      }
      setMessage("Request sent successfully! You can track it in your Dashboard.");
    } catch (error) {
      setError("Unable to send request. Make sure Exchange Service is running on port 5003.");
    }
  };

  const storedUser = localStorage.getItem("user");
  let currentUser = null;
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {}
  }
  const currentUserId = currentUser ? (currentUser._id || currentUser.id || currentUser.email) : null;

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.category.toLowerCase().includes(searchQuery.toLowerCase());
    const isNotMine = skill.userId !== currentUserId;
    return matchesSearch && isNotMine;
  });

  return (
    <div className="w-full pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">Browse <span className="text-gradient">Skills</span></h1>
        <p className="text-text-muted">Discover and request skills from the community.</p>
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

      <div className="glass-panel p-4 rounded-2xl mb-8 flex items-center gap-4">
        <span className="text-text-muted ml-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg></span>
        <input 
          type="text" 
          placeholder="Search for a skill or category..." 
          className="bg-transparent border-none outline-none text-white w-full placeholder-text-muted/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-accent-pink border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div key={skill._id} className="glass-panel rounded-3xl p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <button 
                  onClick={() => setSearchQuery(skill.category)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs text-text-muted transition cursor-pointer"
                >
                  {skill.category}
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-pink/20 to-accent-magenta/20 flex items-center justify-center text-xs text-white border border-white/5">
                  ID
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{skill.name}</h3>
              <p className="text-sm text-text-muted mb-6 flex-1 line-clamp-3">
                {skill.description}
              </p>
              
              <div className="mt-auto border-t border-white/5 pt-4 flex items-center justify-between">
                <div className="text-xs text-text-muted">
                  By: <span className="text-white font-medium">{skill.userId.includes('@') ? skill.userId.split('@')[0] : 'User'}</span>
                </div>
                <button 
                  onClick={() => handleRequestExchange(skill)}
                  className="glow-button px-4 py-1.5 rounded-full text-xs font-medium text-white"
                >
                  Request Exchange
                </button>
              </div>
            </div>
          ))}
          
          {filteredSkills.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-muted bg-panel-dark/30 rounded-3xl border border-white/5 border-dashed">
              {skills.length === 0 ? "No skills available." : "No skills found matching your search or they are your own skills."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BrowseSkills;