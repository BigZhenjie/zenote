import "./App.css";
import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import LoadingCircle from "./components/LoadingCircle";

// Lazy imports
const Login = lazy(() => import("./pages/Login"));
function App() {
  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="h-screen w-screen">
            <LoadingCircle />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
