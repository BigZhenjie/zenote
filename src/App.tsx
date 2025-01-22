import "./App.css";
import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import LoadingCircle from "./components/LoadingCircle";
import Home from "./components/home/Home";
import { AuthProvider } from "./context/AuthContext";

// Lazy imports
const Login = lazy(() => import("./pages/Login"));
const OnBoarding = lazy(() => import("./pages/OnBoarding"));
function App() {
  return (
    <AuthProvider>
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
            <Route path="/onboarding/:email" element={<OnBoarding />} />
            <Route path="/home" element={<Home />} />
            {/*route for 404*/}
            <Route path="*" element={<div>404</div>} />
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
