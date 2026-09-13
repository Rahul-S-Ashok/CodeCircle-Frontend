import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { Brain, FolderGit2, GitBranch, Video } from "lucide-react";

const pillars = [
  {
    icon: Brain,
    title: "Smart Matching",
    body: "AI-powered recommendations from skills, bio, and intent.",
  },
  {
    icon: FolderGit2,
    title: "Project Collaboration",
    body: "Find teammates for the ideas you actually want to ship.",
  },
  {
    icon: Video,
    title: "Video Calls",
    body: "Discuss, share, and build after you match.",
  },
  {
    icon: GitBranch,
    title: "GitHub Integration",
    body: "Showcase repos and public work on your profile.",
  },
];

const cards = [
  {
    name: "Priya S.",
    tag: "React",
    img: "https://i.pravatar.cc/160?img=47",
  },
  {
    name: "Arjun M.",
    tag: "Python",
    img: "https://i.pravatar.cc/160?img=12",
  },
  {
    name: "Sneha I.",
    tag: "UI/UX",
    img: "https://i.pravatar.cc/160?img=32",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-ink grid-fade">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-bloom/10 blur-3xl" />

      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-volt/10 blur-3xl" />

      {/* Navbar */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Logo className="h-11 w-11" />

          <div>
            <p className="text-lg font-semibold text-ink">
              Code
              <span className="bg-gradient-to-r from-volt to-bloom bg-clip-text text-transparent">
                Circle
              </span>
            </p>

            <p className="font-mono text-[10px] tracking-[0.28em] text-muted">
              DEVELOPERS BELONG HERE
            </p>
          </div>
        </div>

        <Link
          to="/login"
          className="rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium text-ink transition hover:border-teal hover:bg-surface"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-5 inline-flex items-center rounded-full border border-border bg-panel px-4 py-2 text-xs text-muted shadow-soft">
            <span className="mr-2 h-2 w-2 rounded-full bg-teal" />
            Built for developers
          </div>

          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-ink md:text-7xl">
            Find your next <span className="text-teal">build</span> partner.
          </h1>

          <p className="mt-6 max-w-md text-lg text-muted">
            CodeCircle is a developer networking platform to meet, collaborate,
            and build amazing things together.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/login?mode=signup"
              className="rounded-full bg-teal px-6 py-3 font-semibold text-white shadow-glow transition hover:scale-105 hover:opacity-90"
            >
              Get Started
            </Link>

            <a
              href="#features"
              className="rounded-full border border-border bg-panel px-6 py-3 text-muted transition hover:border-teal/40 hover:bg-surface hover:text-ink"
            >
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Developer cards */}
        <div className="relative h-[420px]">
          {cards.map((card, index) => (
            <motion.div
              key={card.name}
              initial={{
                opacity: 0,
                y: 24,
                rotate: index === 1 ? 3 : index === 2 ? -3 : 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                rotate: index === 1 ? 3 : index === 2 ? -3 : 0,
              }}
              transition={{
                delay: 0.15 * index,
                duration: 0.5,
              }}
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              className="absolute w-56 rounded-2xl border border-border bg-panel p-4 shadow-card"
              style={{
                left: index * 48,
                top: index * 70,
                zIndex: cards.length - index,
              }}
            >
              <img
                src={card.img}
                alt=""
                className="h-28 w-full rounded-xl object-cover"
              />

              <div className="mt-3 flex items-center justify-between">
                <p className="font-semibold text-ink">{card.name}</p>

                <span className="h-2 w-2 rounded-full bg-teal" />
              </div>

              <span className="font-mono text-xs text-teal">{card.tag}</span>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-2 lg:grid-cols-4"
      >
        {pillars.map((pillar) => {
          const Icon = pillar.icon;

          return (
            <motion.div
              key={pillar.title}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border bg-panel p-5 shadow-soft transition hover:shadow-card"
            >
              <Icon className="text-teal" size={22} />

              <h3 className="mt-3 font-semibold text-ink">{pillar.title}</h3>

              <p className="mt-1 text-sm leading-6 text-muted">{pillar.body}</p>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
