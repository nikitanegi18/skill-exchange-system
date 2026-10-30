import { useEffect, useState } from "react";

function MySkills() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getUser = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  const loadSkills = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_SKILL_API_URL || "") + "/skills");
      if (!response.ok) throw new Error("Could not load skills");
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error(error);
      setError("Could not connect to Skill Service. Make sure port 5002 is running.");
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    setError("");
    setMessage("");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SKILL_API_URL || ""}/skills/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getUser() ? (getUser()._id || getUser().id || getUser().email) : null })
      });
      if (!response.ok) {
        throw new Error("Failed to delete skill.");
      }
      setMessage("Skill deleted successfully.");
      loadSkills();
    } catch (err) {
      setError("Failed to delete skill.");
    }
  };

  const handleEditSkill = async (skill) => {
    const newDescription = window.prompt("Enter new description for this skill:", skill.description);
    if (!newDescription || newDescription === skill.description) return;
    
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_SKILL_API_URL || ""}/skills/${skill._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: skill.name, category: skill.category, description: newDescription, userId: getUser() ? (getUser()._id || getUser().id || getUser().email) : null })
      });
      
      if (!response.ok) throw new Error("Failed to update skill.");
      
      setMessage("Skill updated successfully!");
      loadSkills();
    } catch (err) {
      setError("Failed to update skill.");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const user = getUser();
    if (!user) {
      setError("You must be logged in to add a skill.");
      setLoading(false);
      return;
    }

    const userId = user._id || user.id || user.email;

    try {
      const response = await fetch((import.meta.env.VITE_SKILL_API_URL || "") + "/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category, userId })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add skill.");
        return;
      }
      setMessage("Skill added successfully!");
      setName("");
      setDescription("");
      setCategory("");
      loadSkills();
    } catch (error) {
      setError("Failed to add skill. Skill Service may be down.");
    } finally {
      setLoading(false);
    }
  };

  const user = getUser();
  const userId = user ? (user._id || user.id || user.email) : null;
  const mySkills = skills.filter((skill) => skill.userId === userId);

  return (
    <div className="w-full pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">My <span className="text-gradient">Skills</span></h1>
        <p className="text-text-muted">Manage the skills you're offering to the community.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to add a new skill */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-3xl sticky top-8">
            <h3 className="text-lg font-medium text-white mb-6">Offer a New Skill</h3>
            <form onSubmit={handleAddSkill} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Skill Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-pink transition"
                  placeholder="e.g. Graphic Design"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-pink transition appearance-none"
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Languages">Languages</option>
                  <option value="Business">Business</option>
                  <option value="Music">Music</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-pink transition resize-none"
                  placeholder="What will you teach?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glow-button w-full mt-2 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Skill"}
              </button>
            </form>
          </div>
        </div>

        {/* List of my skills */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-white">Currently Offering ({mySkills.length})</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {mySkills.length === 0 ? (
              <div className="glass-panel p-10 rounded-3xl text-center border-dashed border border-white/10 flex flex-col items-center">
                <div className="text-accent-pink flex justify-center mb-4"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-1.81.688l1.15 5.071c.104.462-.387.833-.805.57L12 17.511a.563.563 0 00-1.81.688l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"></path></svg></div>
                <h4 className="text-white font-medium mb-2">You haven't added any skills yet</h4>
                <p className="text-sm text-text-muted">Use the form to offer your first skill and start connecting.</p>
              </div>
            ) : (
              mySkills.map((skill) => (
                <div key={skill._id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-white font-semibold text-lg">{skill.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-text-muted uppercase tracking-wider">
                        {skill.category}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted line-clamp-2 mt-1">{skill.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditSkill(skill)} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteSkill(skill._id)} className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium transition">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MySkills;