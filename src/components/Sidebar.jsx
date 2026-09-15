import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Bell,
  BrainCircuit,
  ChevronRight,
  Crown,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import Logo from "./Logo";

const navigation = [
  {
    label: "Discover",
    path: "/discover",
    icon: LayoutGrid,
  },
  {
    label: "Matches",
    path: "/matches",
    icon: Users,
  },
  {
    label: "Messages",
    path: "/messages",
    icon: MessageCircle,
  },
  {
    label: "Requests",
    path: "/requests",
    icon: Bell,
  },
];

const workspace = [
  {
    label: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    label: "AI Search",
    path: "/ai-search",
    icon: Search,
  },
  {
    label: "Team Builder",
    path: "/team-builder",
    icon: BrainCircuit,
  },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Developer";

  const avatar =
    user?.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=e2e8f0&color=172033`;

  const logout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch(removeUser());
      localStorage.removeItem("codecircle_token");
      setMobileOpen(false);
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />

          <span className="font-black text-slate-900">CodeCircle</span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="h-9 w-9 overflow-hidden rounded-xl ring-1 ring-slate-200"
        >
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white shadow-soft transition-transform duration-300 lg:sticky lg:z-30 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between px-6">
          <button
            type="button"
            onClick={() => {
              navigate("/discover");
              setMobileOpen(false);
            }}
            className="flex items-center gap-3"
          >
            <Logo className="h-10 w-10" />

            <div className="text-left">
              <div className="text-base font-black tracking-tight text-slate-900">
                CodeCircle
              </div>

              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Developer Network
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User mini profile */}
        <button
          type="button"
          onClick={() => {
            navigate("/profile");
            setMobileOpen(false);
          }}
          className="mx-4 mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/40"
        >
          <img
            src={avatar}
            alt=""
            className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{name}</p>

            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {user?.headline || "Developer"}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4">
          <NavSection title="Network">
            {navigation.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                closeMenu={() => setMobileOpen(false)}
              />
            ))}
          </NavSection>

          <NavSection title="Workspace">
            {workspace.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                closeMenu={() => setMobileOpen(false)}
              />
            ))}
          </NavSection>

          <NavSection title="Account">
            <SidebarLink
              item={{
                label: "Profile",
                path: "/profile",
                icon: Settings,
              }}
              closeMenu={() => setMobileOpen(false)}
            />
          </NavSection>

          {/* Premium */}
          {!user?.isPremium && (
            <button
              type="button"
              onClick={() => {
                navigate("/premium");
                setMobileOpen(false);
              }}
              className="group relative mt-5 w-full overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-violet-50 p-4 text-left transition hover:shadow-soft"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-amber-200/40 blur-2xl" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                  <Crown className="h-4 w-4 text-amber-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-amber-700">
                    CodeCircle Pro
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    Unlock more connections
                  </p>
                </div>

                <Sparkles className="h-4 w-4 text-amber-500 transition group-hover:scale-110" />
              </div>
            </button>
          )}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {loggingOut ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}

            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}

function NavSection({ title, children }) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarLink({ item, closeMenu }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={closeMenu}
      className={({ isActive }) =>
        `group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
          isActive
            ? "bg-cyan-50 text-cyan-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-4 w-4 transition ${
              isActive
                ? "text-cyan-600"
                : "text-slate-400 group-hover:text-slate-700"
            }`}
          />

          <span className="flex-1">{item.label}</span>

          {isActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-400/40" />
          )}
        </>
      )}
    </NavLink>
  );
}
