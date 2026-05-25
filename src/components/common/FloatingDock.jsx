import { useState } from "react";
import { ChevronUp, Moon, Plus } from "lucide-react";

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" />
            </svg>
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