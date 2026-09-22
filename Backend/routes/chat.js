import express from "express";
import supabase from "../utils/supabase.js";
import getGeminiAPIResponse from "../utils/gemini.js";

const router = express.Router();

const formatThread = (thread) => ({
    ...thread,
    threadId: thread.thread_id,
    createdAt: thread.created_at,
    updatedAt: thread.updated_at
});

//test
// Post request at http://localhost:8080/api/test
router.post("/test", async(req, res) => {
    try {
                const { data, error } = await supabase
                    .from("threads")
                    .insert({ thread_id: "abc", title: "Testing New Thread2" })
                    .select()
                    .single();

                if (error) throw error;
                res.send(data);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to save in DB"});
    }
});

//Get all threads // Get request at http://localhost:8080/api/thread 
router.get("/thread", async(req, res) => {
    try {
        const { data: threads, error } = await supabase
          .from("threads")
          .select("*")
          .order("updated_at", { ascending: false });

        if(error) throw error;

        res.json(threads.map(formatThread));
    } catch(err) {
        console.log(err);
        res.status(500).json({error: err.message || "Failed to fetch threads"});
    }
});

router.get("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;

    try {
        const { data: thread, error } = await supabase
          .from("threads")
          .select("*")
          .eq("thread_id", threadId)
          .maybeSingle();

        if(error) throw error;
        if(!thread) return res.status(404).json({error: "Thread not found"});

        res.json(thread.messages || []);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: err.message || "Failed to fetch chat"});
    }
});

// delete request at http://localhost:8080/api/thread/abc
router.delete("/thread/:threadId", async (req, res) => {
    const {threadId} = req.params;

    try {
                const { data: deletedThreads, error } = await supabase
                    .from("threads")
                    .delete()
                    .eq("thread_id", threadId)
                    .select("id");

                if(error) throw error;
                if(!deletedThreads.length) {
                        return res.status(404).json({error: "Thread not found"});
                }

        res.status(200).json({success : "Thread deleted successfully"});

    } catch(err) {
        console.log(err);
        res.status(500).json({error: err.message || "Failed to delete thread"});
    }
});

router.post("/chat", async(req, res) => {
    const {threadId, message} = req.body;

    if(!threadId || !message) {
        return res.status(400).json({error: "missing required fields"});
    }

    try {
        const { data: existingThread, error: findError } = await supabase
          .from("threads")
          .select("*")
          .eq("thread_id", threadId)
          .maybeSingle();

        if(findError) throw findError;

        const assistantReply = await getGeminiAPIResponse(message);
        if (!assistantReply) {
            return res.status(502).json({error: "No response from Gemini"});
        }

        const messages = [
            ...(existingThread?.messages || []),
            {role: "user", content: message},
            {role: "assistant", content: assistantReply}
        ];

        const query = existingThread
          ? supabase.from("threads").update({ messages, updated_at: new Date().toISOString() }).eq("thread_id", threadId)
          : supabase.from("threads").insert({ thread_id: threadId, title: message, messages });
        const { error: saveError } = await query;

        if (saveError) throw saveError;
        res.json({reply: assistantReply});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: err.message || "Something went wrong"});
    }
});

export default router;