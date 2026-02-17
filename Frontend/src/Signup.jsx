import React, {useState} from "react";
import "./Auth.css";

function Signup(){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if(!name || !email || !password){
      setMessage("Please fill all required fields.");
      return;
    }
    if(password !== confirm){
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try{
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, email, password})
      });
      const data = await res.json();
      if(!res.ok){
        setMessage(data?.error || 'Signup failed');
      } else {
        setMessage('Signup successful — redirecting to login');
        setTimeout(()=> window.location.href = '/login', 900);
      }
    }catch(err){
      console.error(err);
      setMessage('Network error — check backend');
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Start using SigmaGPT — create a free account.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="helper">Name</label>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" />
          </div>

          <div className="form-group">
            <label className="helper">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label className="helper">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Create password" />
          </div>

          <div className="form-group">
            <label className="helper">Confirm password</label>
            <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Confirm password" />
          </div>

          <div className="form-group">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>

        {message && <div className="notice">{message}</div>}

        <div className="auth-row" style={{marginTop: '1rem'}}>
          <span className="helper">Already have an account?</span>
          <a className="switch-link" href="/login">Sign in</a>
        </div>

      </div>
    </div>
  )
}

export default Signup;