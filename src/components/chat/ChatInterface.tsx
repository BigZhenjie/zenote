import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Response } from "@/types";
import { SendHorizontal, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

// Define the structure of a block returned by the query_similar_blocks command
interface RetrievedBlock {
  // Adjust these fields based on what your 'match_embeddings' SQL function actually returns
  // and what you need in the frontend.
  page_id: string; // Or number, if that's the type from Supabase
  content: string;
  id?: string; // Example: if you also return the block's own ID
  similarity?: number; // Example: if you return the similarity score
  // Add other fields like block_id, metadata if needed
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !user.id) { // Ensure user and user.id exist
      console.error("User or user ID is not available.");
      // Optionally, show an error message to the user
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Error: Could not identify user. Please try logging in again.",
          timestamp: new Date(),
        }
      ]);
      setIsLoading(false);
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Format recent chat history (last 6 messages)
      const recentMessages = messages.slice(-6);
      const chatHistory = recentMessages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');
      
      // First retrieve similar blocks from the user's notes
      const similarBlocksResponse: Response = await invoke("query_similar_blocks", {
        // Include recent chat context in the query for better semantic search
        query: `${chatHistory ? chatHistory + '\n\n' : ''}${input}`,
        threshold: 0.1, // Slightly lower threshold to account for longer query
        limit: 5, // Number of blocks to retrieve
        userId: user.id // Pass the user ID
      });
      
      console.log("similarBlocksResponse", similarBlocksResponse);
      let retrievedContext = "";
      
      // Extract content from similar blocks to build context
      if (similarBlocksResponse.data && Array.isArray(similarBlocksResponse.data)) {
        retrievedContext = similarBlocksResponse.data
          .map((block: RetrievedBlock) => `Block from page ${block.page_id}: ${block.content}`)
          .join("\n\n");
      }
      
      // Combine retrieved context with chat history
      const fullContext = [
        // Include chat history first
        chatHistory ? `Recent conversation:\n${chatHistory}` : null,
        // Then add retrieved blocks
        retrievedContext ? `Relevant notes:\n${retrievedContext}` : null
      ].filter(Boolean).join('\n\n');

      // Now query the LLM with the combined context
      const llmResponse: Response = await invoke("ask_llm", {
        query: input,
        context: fullContext.length > 0 ? fullContext : null
      });

      if (llmResponse.data) {
        // Parse the response content
        const responseContent = llmResponse.data.choices?.[0]?.message?.content || 
                              "Sorry, I couldn't process that request.";
        
        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: responseContent,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error querying LLM:", error);
      
      // Add error message
      setMessages((prev) => [
        ...prev, 
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, an error occurred while processing your request.",
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Chat with Your Notes</h1>
      
      <div className="flex-1 overflow-y-auto bg-white rounded-t-lg shadow mb-4 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>Ask anything about your notes!</p>
            <p className="text-sm">Try: "What did I write about yesterday?"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your notes..."
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white p-2 rounded-r-lg disabled:bg-gray-300"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <SendHorizontal className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;