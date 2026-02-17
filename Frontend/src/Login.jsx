import React, {useState} from "react";
import "./Auth.css";

function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if(!email || !password){
      setMessage("Please enter email and password.");
      return;
    }
    setLoading(true);
    try{
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
      });
      const data = await res.json();
      if(!res.ok){
        setMessage(data?.error || "Login failed");
      } else {
        setMessage("Login successful — redirecting...");
        // optional: store token and redirect
        if(data?.token){
          try{ localStorage.setItem('token', data.token); }catch{};
        }
        setTimeout(()=> window.location.href = '/', 900);
      }
    }catch(err){
      setMessage("Network error — check backend");
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">SigmaGPT — Login</h2>
        <p className="auth-sub">Welcome back — sign in to continue chatting.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="helper">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label className="helper">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter password" />
          </div>

          <div className="form-group">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {message && <div className="notice">{message}</div>}

        <div className="auth-row" style={{marginTop: '1rem'}}>
          <span className="helper">New here?</span>
          <a className="switch-link" href="/signup">Create an account</a>
        </div>

      </div>
    </div>
  )
}

export default Login;