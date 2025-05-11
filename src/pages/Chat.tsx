import ChatInterface from "@/components/chat/ChatInterface";

const Chat = () => {
  return (
    <div className="w-full p-8 overflow-y-auto flex flex-col items-center rounded-xl ml-4 bg-white">
      <ChatInterface />
    </div>
  );
};

export default Chat;