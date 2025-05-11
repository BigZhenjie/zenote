import "./App.css";
import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import LoadingCircle from "./components/LoadingCircle";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Page from "./pages/Page";
// Lazy imports
const Login = lazy(() => import("./pages/Login"));
const OnBoarding = lazy(() => import("./pages/OnBoarding"));
const Chat = lazy(() => import("./pages/Chat"));

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
            <Route element={<Layout children={<Outlet />} />}>
              <Route path="/home" element={<Home />} />
              <Route path="/:pageId" element={<Page />} />
              <Route path="/chat" element={<Chat />} />

              {/*route for 404*/}
              <Route path="*" element={<div>404</div>} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
