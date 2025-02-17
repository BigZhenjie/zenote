import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Corrected import
import { useAuth } from "@/context/AuthContext";
import Pages from "@/components/home/page/Pages";

export default function Home() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const currentTime = new Date().getHours();
    if (currentTime < 12) {
      setGreeting('Good morning');
    } else if (currentTime < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
      <motion.main
        className="w-full p-8 overflow-y-auto flex flex-col items-center rounded-xl ml-4 bg-white"
        initial={{ marginLeft: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-medium mb-8 text-gray-800 w-full text-center">
          {greeting}, {user?.firstName} {user?.lastName}
        </h1>
        <div className=" max-w-[80%] w-[80%]">
          <Pages user={user!} />
        </div>
        
      </motion.main>
  );
}
