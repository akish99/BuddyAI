import "./Sidebar.css";
import {useState, useContext, useEffect} from 'react';
import {MyContext} from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";

function Sidebar() {
    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats} = useContext(MyContext);

    const getAllThreads = async () => {

        try{
            const response = await fetch("http://localhost:8080/api/thread");
            const res = await response.json();
            const filteredData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
            setAllThreads(filteredData);
            console.log(filteredData);
        }catch (err) {
            console.log(err);
        };

    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThreadId = async(newThreadId) => {
        setCurrThreadId(newThreadId);

        try{
            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`);
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        }catch (err){
            console.log(err);
        }

    };

    const deleteThread = async(threadId) => {
        try{
        const response = await fetch(`http://localhost:8080/api/thread/${threadId}`, {method: "DELETE"});
        const res = await response.json();
        console.log(res);

        // Updated Threads Re-Render
        setAllThreads(allThreads => allThreads.filter(thread => thread.threadId !== threadId));

        if(threadId === currThreadId){
            createNewChat();
        }

        } catch (err){
            console.log(err)
        }
    }

return (
    <section className="sidebar">
        <button onClick={createNewChat}>
            <img src="./src/assets/blacklogo.png" alt="gpt logo" className="logo" />
            <span><i className="fa-solid fa-pen-to-square"></i></span>
        </button>

        <ul className="history">
            {/* <li>History 1</li>
            <li>History 2</li>
            <li>History 3</li> */}
            {
                allThreads?.map((thread, idx) => (
                    <li key={idx} onClick={(e) => changeThreadId(thread.threadId)} className={thread.threadId == currThreadId ? "highlighted" : ""}>{thread.title}
                    <i className="fa-solid fa-trash" onClick={(e) => {
                        e.stopPropagation();
                        deleteThread(thread.threadId);
                    }}></i>
                    </li>
                ))
            }
        </ul>

        <div className="sign">
            <p>By apnaCollege &hearts;</p>
        </div>

    </section>
)
};

export default Sidebar;