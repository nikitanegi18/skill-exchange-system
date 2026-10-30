import { USER_API_URL } from "../apiConfig";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    const endpoint = isLogin ? USER_API_URL + "/users/login" : USER_API_URL + "/users/register";
    const body = isLogin ? { email: formData.email, password: formData.password } : formData;

    console.log("Submitting to", endpoint, body);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      console.log("Response:", response.status, data);

      if (!response.ok) {
        setError(data.message || data.error || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login successful!");
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        setMessage("Registration successful! Please log in.");
        setFormData({ name: "", email: formData.email, password: "" });
        setIsLogin(true);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect to User Service. Make sure port 5001 is running and MongoDB is connected.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center relative overflow-hidden text-text-main p-4">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-pink/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-magenta/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent-pink to-accent-magenta flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-accent-pink/30 mb-4">
            S
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Skill <span className="text-gradient">Exchange</span>
          </h1>
          <p className="text-text-muted">Enter your details to proceed</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex bg-[#121214] p-1 rounded-xl mb-8 border border-white/5">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setMessage(""); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setMessage(""); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
          {message && <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-6 text-sm text-center">{message}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full bg-[#1A1A1E] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-pink transition placeholder-text-muted/50"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider ml-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#1A1A1E] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-pink transition placeholder-text-muted/50"
                placeholder="you@university.edu"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-[#1A1A1E] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-pink transition placeholder-text-muted/50"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="glow-button w-full mt-4 py-3.5 rounded-xl text-white font-medium shadow-lg hover:shadow-accent-pink/40 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Auth;