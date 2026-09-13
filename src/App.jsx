import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import appStore from "./utils/appStore";

import Body from "./components/Body";
import AppShell from "./components/AppShell";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Onboarding from "./components/Onboarding";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Messages from "./components/Messages";
import Chat from "./components/Chat";
import ProjectsPage from "./components/ProjectsPage";
import TeamBuilder from "./components/TeamBuilder";
import AISearch from "./components/AISearch";
import Notifications from "./components/Notifications";
import Requests from "./components/Requests";
import Profile from "./components/Profile";
import PublicProfile from "./components/PublicProfile";
import EditProfile from "./components/EditProfile";
import Premium from "./components/Premium";
import ProjectRoom from "./components/ProjectRoom";

export default function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>
          {/* Global auth/profile wrapper */}
          <Route element={<Body />}>
            {/* Public */}
            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<Login />} />

            {/* Profile setup */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected application */}
            <Route element={<AppShell />}>
              <Route path="/discover" element={<Feed />} />

              {/* Old route compatibility */}
              <Route
                path="/feed"
                element={<Navigate to="/discover" replace />}
              />

              <Route path="/matches" element={<Connections />} />

              <Route
                path="/connections"
                element={<Navigate to="/matches" replace />}
              />

              <Route path="/messages" element={<Messages />} />

              <Route path="/chat/:targetUserId" element={<Chat />} />

              <Route path="/projects" element={<ProjectsPage />} />

              <Route
                path="/projects/:projectId/room"
                element={<ProjectRoom />}
              />

              <Route path="/team-builder" element={<TeamBuilder />} />

              <Route path="/ai-search" element={<AISearch />} />

              <Route path="/notifications" element={<Notifications />} />

              <Route path="/requests" element={<Requests />} />

              <Route path="/profile" element={<Profile />} />

              <Route path="/profile/edit" element={<EditProfile />} />

              <Route path="/profile/:id" element={<PublicProfile />} />

              <Route path="/premium" element={<Premium />} />
            </Route>

            {/* Unknown route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
