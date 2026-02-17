// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";

function App() {
  // const [count, setCount] = useState(0)
  const [prompt, setPrompt] = useState(""); //Stores what the user types in the input box before sending.
  const [reply, setReply] = useState(null); //Stores the latest AI reply received from backend.
  const [currThreadId, setCurrThreadId] = useState(uuidv1()); //Unique ID for the current chat thread.
  const [prevChats, setPrevChats] = useState([]); //Array of all messages (user + assistant) in the current chat.
  const [newChat, setNewChat] = useState(true); //Boolean — true when you start a fresh chat.
  const [allThreads, setAllThreads] = useState([]); //Stores a list of all past chat threads (titles + IDs) fetched from backend.

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    prevChats,
    setPrevChats,
    newChat,
    setNewChat,
    allThreads,
    setAllThreads,
  };

  return (
    <>
        <BrowserRouter>
      <MyContext.Provider value={providerValues}>
        <div className="app">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Sidebar />
                  <ChatWindow />
                </>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </MyContext.Provider>
    </BrowserRouter>
    </>
  );
}

export default App;
