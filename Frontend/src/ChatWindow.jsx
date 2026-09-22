// import "./ChatWindow.css";
// import Chat from "./Chat.jsx";
// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { MyContext } from "./MyContext.jsx";
// import { useContext } from "react";
// import { v1 as uuidv1 } from "uuid";
// import { ScaleLoader } from "react-spinners";

// function ChatWindow() {
//   const {
//     prompt,
//     setPrompt,
//     reply,
//     setReply,
//     currThreadId,
//     setCurrThreadId,
//     prevChats,
//     setPrevChats,
//     setNewChat,
//   } = useContext(MyContext);
//   const [loading, setLoading] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);

//   const getReply = async () => {
//     setLoading(true);
//     setNewChat(false);
//     console.log("message:" + prompt + "current Thread Id: " + currThreadId);
//     const options = {
//       method: "POST",
//       headers: {
//         "content-type": "application/json",
//       },
//       body: JSON.stringify({
//         message: prompt,
//         threadId: currThreadId,
//       }),
//     };

//     try {
//       const response = await fetch("http://localhost:8080/api/chat", options);
//       const res = await response.json();
//       console.log(res);
//       setReply(res.reply);
//     } catch (err) {
//       console.log(err);
//     }

//     setLoading(false);
//   };

//   // append new chats to prev chats whenever reply changes
//   useEffect(() => {
//     if (prompt && reply) {
//       setPrevChats([
//         ...prevChats,
//         {
//           role: "user",
//           content: prompt,
//         },
//         {
//           role: "assistant",
//           content: reply,
//         },
//       ]);
//     }

//     setPrompt("");
//   }, [reply]);

//   const handleProfileClick = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div className="chatWindow">
//       <div className="navbar">
//         <span>
//           BuddyAI <i className="fa-solid fa-chevron-down"></i>{" "}
//         </span>

//         <div className="authButtons">
//           <Link to="/login">
//             <button>Login</button>
//           </Link>
//           <Link to="/signup">
//             <button>Sign Up</button>
//           </Link>
//         </div>
//         <div className="userIconDiv" onClick={handleProfileClick}>
//           <span className="userIcon">
//             <i className="fa-solid fa-user"></i>
//           </span>
//         </div>
//       </div>
//       {isOpen && (
//         <div className="dropDown">
//           <div className="dropDownItem">
//             <i class="fa-solid fa-cloud-arrow-up"></i>Upgrade Plan
//           </div>
//           <div className="dropDownItem">
//             <i class="fa-solid fa-gear"></i>Settings
//           </div>
//           <div className="dropDownItem">
//             <i class="fa-solid fa-right-from-bracket"></i>Log Out
//           </div>
//         </div>
//       )}

//       <Chat></Chat>
//       <ScaleLoader color="#fff" loading={loading}></ScaleLoader>

//       <div className="chatInput">
//         <div className="inputBox">
//           <input
//             placeholder="Ask Anything"
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
//           ></input>
//           <div id="submit" onClick={getReply}>
//             <i className="fa-solid fa-paper-plane"></i>
//           </div>
//         </div>
//         <p className="info">
//           ChatGPT can make mistakes. Check important info. See Cookie
//           Preferences.
//         </p>
//       </div>
//     </div>
//   );
// }

// export default ChatWindow;


import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import API_URL from "./api.js";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // true if token exists
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/login"; // redirect to login
  };

  const getReply = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setNewChat(false);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);

    const options = {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId || uuidv1(),
      }),
    };

    try {
      const response = await fetch(`${API_URL}/api/chat`, options);
      const res = await response.json();
      if (!response.ok) throw new Error(res.error || "Chat request failed");
      setReply(res.reply);
    } catch (err) {
      console.error("Error fetching reply:", err);
      setReply(`Error: ${err.name === "AbortError" ? "The request timed out" : err.message}`);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  // append new chats when reply changes
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prev) => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: reply },
      ]);
      setPrompt("");
    }
  }, [reply]);

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>
          BuddyAI <i className="fa-solid fa-chevron-down"></i>
        </span>

        <div className="authButtons">
          {!isLoggedIn ? (
            <>
              <Link to="/login">
                <button>Login</button>
              </Link>
              <Link to="/signup">
                <button>Sign Up</button>
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="logout-btn">
              Log Out
            </button>
          )}
        </div>

        <div className="userIconDiv" onClick={handleProfileClick}>
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">
            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade Plan
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i> Settings
          </div>
          {isLoggedIn && (
            <div className="dropDownItem" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> Log Out
            </div>
          )}
        </div>
      )}

      <Chat />
      <ScaleLoader color="#fff" loading={loading} />

      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask Anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getReply()}
          />
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className="info">
          BuddyAI can make mistakes. Check important info. See Cookie
          Preferences.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
