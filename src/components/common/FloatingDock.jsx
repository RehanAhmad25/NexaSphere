import { useState } from "react";
import { ChevronUp, Github, Moon, Plus } from "lucide-react";

export default function FloatingDock() {
  const [open, setOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <button
            onClick={scrollToTop}
            className="rounded-full bg-black/80 backdrop-blur-md p-3 text-white shadow-lg transition hover:scale-110"
          >
            <ChevronUp size={20} />
          </button>

          <a
            href="https://github.com/Ayushh-Sharmaa/NexaSphere"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-black/80 backdrop-blur-md p-3 text-white shadow-lg transition hover:scale-110"
          >
            <Github size={20} />
          </a>

          <button
            className="rounded-full bg-black/80 backdrop-blur-md p-3 text-white shadow-lg transition hover:scale-110"
          >
            <Moon size={20} />
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`rounded-full p-4 text-white shadow-2xl transition-all duration-300 ${
          open
            ? "rotate-45 bg-red-500"
            : "bg-gradient-to-r from-red-500 to-pink-500"
        }`}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}