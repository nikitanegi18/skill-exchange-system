import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BrowseSkills from "./pages/BrowseSkills";
import MySkills from "./pages/MySkills";
import ExchangeRequests from "./pages/ExchangeRequests";
import Messages from "./pages/Messages";
import Workspace from "./pages/Workspace";
import LearningWorkspaceOverview from "./pages/LearningWorkspaceOverview";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/skills" element={<Layout><BrowseSkills /></Layout>} />
        <Route path="/my-skills" element={<Layout><MySkills /></Layout>} />
        <Route path="/requests" element={<Layout><ExchangeRequests /></Layout>} />
        <Route path="/learning" element={<Layout><LearningWorkspaceOverview /></Layout>} />
        <Route path="/workspace/:id" element={<Layout><Workspace /></Layout>} />
        <Route path="/messages" element={<Layout fullScreen={true}><Messages /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;