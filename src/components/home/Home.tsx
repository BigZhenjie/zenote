import Sidebar from "./sidebar/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to ZeNote</h1>
        <p className="text-gray-600">Your personal note-taking space</p>
      </main>
    </div>
  );
}
