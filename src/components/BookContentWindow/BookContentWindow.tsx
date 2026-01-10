import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "../ui/button";
import imgone from "../../assets/Compound-microscope-1.png";
import imgtwo from "../../assets/Mitochondria-768x608.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Moon, Sun, ChevronsRight, ChevronsLeft, TestTube2 } from "lucide-react";

interface Chapter {
  id: number;
  title: string;
  content: string;
  enhancedContent?: string;
}
interface Book {
  id: string;
  title: string;
  subject: string;
  color: string;
  chapters: Chapter[];
}

const LIBRARY_DATA: Book[] = [
  {
    id: "bio-10",
    title: "Biology: Cellular Life",
    subject: "Science",
    color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    chapters: [
      {
        id: 1,
        title: "Cell Discovery",
        content:
          "In 1665, Robert Hooke observed a thin slice of cork under a microscope. He saw thousands of tiny, empty chambers which he called 'cells'. This was the beginning of our understanding of the fundamental unit of life. Modern cell theory states that all living things are composed of cells, and new cells are produced from existing cells.",
        enhancedContent:
          "In 1665, the polymath Robert Hooke utilized a compound microscope of his own design to observe a thin slice of cork. What he saw would change the course of science forever. He described seeing a honeycomb-like structure, a series of thousands of tiny, empty chambers which reminded him of the small rooms monks lived in. He thus coined the term 'cells'. This discovery was the foundational moment for cell biology, marking the beginning of our understanding that life was not a continuous, amorphous substance, but was instead built from discrete units. The modern cell theory, a cornerstone of biology, further elaborates on this, stating that all living organisms are composed of one or more cells, that the cell is the basic unit of structure and organization in organisms, and that all cells arise from pre-existing cells.",
      },
      {
        id: 2,
        title: "Organelles",
        content:
          "Mitochondria are known as the powerhouses of the cell. They convert energy from food into ATP. The nucleus acts as the control center, containing DNA, while ribosomes synthesize proteins essential for cellular functions.",
        enhancedContent: 
          "Within the cell's cytoplasm lies a complex world of specialized structures called organelles, each with a specific job. Among the most vital are the mitochondria, often dubbed the 'powerhouses' of the cell. These oval-shaped organelles are responsible for cellular respiration, a process where they convert the chemical energy from food molecules, like glucose, into adenosine triphosphate (ATP), the main energy currency of the cell. The nucleus, a large, often centrally located organelle, acts as the cell's control center. It houses the cell's genetic material, DNA, which contains the instructions for building and operating the entire organism. Following these instructions are the ribosomes, tiny molecular machines that synthesize proteins, the essential building blocks and functional molecules required for nearly every cellular process."
      },
      {
        id: 3,
        title: "Cell Division",
        content:
          "Cells divide through mitosis for growth and repair, and meiosis for reproduction. Mitosis results in two identical daughter cells, whereas meiosis produces genetically unique gametes.",
      },
    ],
  },

  {
    id: "phys-12",
    title: "Quantum Mechanics",
    subject: "Physics",
    color: "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
    chapters: [
      {
        id: 1,
        title: "Newtonian Laws",
        content:
          "Newton's laws describe the motion of macroscopic objects. They form the foundation of classical mechanics and explain how forces affect motion.",
      },
      {
        id: 2,
        title: "Wave-Particle Duality",
        content:
          "Quantum mechanics reveals that particles like electrons exhibit both wave and particle properties. This duality is central to understanding atomic behavior.",
      },
    ],
  },

  {
    id: "chem-11",
    title: "Organic Chemistry Basics",
    subject: "Chemistry",
    color: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    chapters: [
      {
        id: 1,
        title: "Carbon Compounds",
        content:
          "Organic chemistry focuses on carbon-based compounds. Carbon’s ability to form four covalent bonds allows it to create complex molecules essential for life.",
      },
      {
        id: 2,
        title: "Hydrocarbons",
        content:
          "Hydrocarbons are compounds consisting only of carbon and hydrogen. They are classified as alkanes, alkenes, and alkynes based on bonding.",
      },
    ],
  },

  {
    id: "cs-10",
    title: "Introduction to Computer Science",
    subject: "Computer Science",
    color: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    chapters: [
      {
        id: 1,
        title: "What is a Computer?",
        content:
          "A computer is an electronic device that processes data based on instructions. It consists of hardware and software working together.",
      },
      {
        id: 2,
        title: "Programming Basics",
        content:
          "Programming is the process of writing instructions for computers. Concepts include variables, loops, conditions, and functions.",
      },
      {
        id: 3,
        title: "Algorithms",
        content:
          "An algorithm is a step-by-step procedure to solve a problem. Efficient algorithms improve performance and reduce computation time.",
      },
    ],
  },

  {
    id: "hist-11",
    title: "The Industrial Revolution",
    subject: "History",
    color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    chapters: [
      {
        id: 1,
        title: "Steam Power",
        content:
          "The invention of steam engines revolutionized manufacturing and transportation, leading to rapid industrial growth.",
      },
      {
        id: 2,
        title: "Social Impact",
        content:
          "Industrialization transformed societies by increasing urbanization, altering labor systems, and shaping modern economies.",
      },
    ],
  },

  {
    id: "geo-9",
    title: "Physical Geography",
    subject: "Geography",
    color: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    chapters: [
      {
        id: 1,
        title: "Earth’s Structure",
        content:
          "The Earth consists of the crust, mantle, and core. These layers influence tectonic activity and geological processes.",
      },
      {
        id: 2,
        title: "Climate Systems",
        content:
          "Climate is influenced by latitude, altitude, wind patterns, and ocean currents, shaping ecosystems worldwide.",
      },
    ],
  },

  {
    id: "eng-10",
    title: "English Literature Classics",
    subject: "English",
    color: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    chapters: [
      {
        id: 1,
        title: "Poetry",
        content:
          "Poetry uses rhythm, imagery, and metaphor to express emotions and ideas in a condensed form.",
      },
      {
        id: 2,
        title: "Drama",
        content:
          "Drama is written for performance and explores human conflicts through dialogue and action.",
      },
    ],
  },

  {
    id: "eco-12",
    title: "Principles of Economics",
    subject: "Economics",
    color: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    chapters: [
      {
        id: 1,
        title: "Demand and Supply",
        content:
          "Demand and supply determine prices in a market economy. Their interaction explains price fluctuations.",
      },
      {
        id: 2,
        title: "Economic Systems",
        content:
          "Economic systems define how resources are allocated. Common systems include capitalism, socialism, and mixed economies.",
      },
    ],
  },

  {
    id: "env-10",
    title: "Environmental Science",
    subject: "Environmental Studies",
    color: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    chapters: [
      {
        id: 1,
        title: "Ecosystems",
        content:
          "An ecosystem includes living organisms and their physical environment interacting as a system.",
      },
      {
        id: 2,
        title: "Climate Change",
        content:
          "Climate change refers to long-term shifts in temperature and weather patterns, largely driven by human activities.",
      },
    ],
  },

  {
    id: "math-10",
    title: "Advanced Trigonometry",
    subject: "Mathematics",
    color: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    chapters: [
      {
        id: 1,
        title: "Sine & Cosine",
        content:
          "Trigonometric functions describe relationships between angles and sides of triangles and model periodic phenomena.",
      },
      {
        id: 2,
        title: "Trigonometric Identities",
        content:
          "Identities simplify expressions and equations involving trigonometric functions.",
      },
    ],
  },
];

// --- Mock Data & Configuration ---

const QUIZ_DATA: Record<string, { q: string; opts: string[]; a: number }> = {
  "1": {
    q: "Who coined the term 'cell' while observing cork?",
    opts: ["Newton", "Robert Hooke", "Darwin"],
    a: 1,
  },
  "2": {
    q: "Which organelle is considered the 'powerhouse'?",
    opts: ["Nucleus", "Ribosome", "Mitochondria"],
    a: 2,
  },
};

const BookContentWindow = () => {
  // --- States ---
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeChapter, setActiveChapter] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isContentEnhanced, setIsContentEnhanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
const [activeFilter, setActiveFilter] = useState<string>("All");
const [isMiniChatOpen, setIsMiniChatOpen] = useState(false);
const [localQuery, setLocalQuery] = useState("");
// Inside your component

  
  const [highlights, setHighlights] = useState<string[]>([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [timer, setTimer] = useState(0);
const [activeInfo, setActiveInfo] = useState<string | null>(null);

  const handleEnhanceContent = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setIsContentEnhanced(true);
      setIsEnhancing(false);
    }, 1500);
  };

  // --- Timer Logic ---
  useEffect(() => {
    let interval: any;
    if (selectedBook && !isQuizOpen && !isSummaryOpen) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [selectedBook, isQuizOpen, isSummaryOpen]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  // Inside your component
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const handleImageClick = (description: string) => {
    setZoomImage(description);
  };

  // Label Data for interactive learning
  const DIAGRAM_LABELS = {
    microscope: [
      {
        id: "lens",
        top: "20%",
        left: "45%",
        title: "Objective Lens",
        desc: "The lens closest to the specimen that provides initial magnification.",
      },
      {
        id: "stage",
        top: "65%",
        left: "50%",
        title: "Specimen Stage",
        desc: "Where Hooke placed the thin slice of cork for observation.",
      },
    ],
    mitochondria: [
      {
        id: "cristae",
        top: "40%",
        left: "30%",
        title: "Cristae",
        desc: "Inner folds that increase surface area for chemical reactions.",
      },
      {
        id: "matrix",
        top: "55%",
        left: "60%",
        title: "Matrix",
        desc: "The internal space where the Krebs cycle occurs.",
      },
    ],
  };
  // --- Inside EduStream component states ---
  const [isTestMode, setIsTestMode] = useState(false);
  const [testTarget, setTestTarget] = useState<any>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Function to toggle mode and pick a random target
  const toggleTestMode = () => {
    const newMode = !isTestMode;
    setIsTestMode(newMode);
    if (newMode) {
      const type =
        zoomImage === "The Compound Microscope" ? "microscope" : "mitochondria";
      const labels = DIAGRAM_LABELS[type];
      setTestTarget(labels[Math.floor(Math.random() * labels.length)]);
      setScore({ correct: 0, total: 0 }); // Reset score for new session
    }
  };

  // Start a new test based on the current diagram
  const startTest = (type: "microscope" | "mitochondria") => {
    setIsTestMode(true);
    const labels = DIAGRAM_LABELS[type];
    const randomTarget = labels[Math.floor(Math.random() * labels.length)];
    setTestTarget(randomTarget);
  };

  const handleHotspotClick = (label: any) => {
    if (isTestMode) {
      // 1. Check if the clicked ID matches the target ID
      if (testTarget && label.id === testTarget.id) {
        triggerToast("✅ Correct! Well done.");

        setScore((prev) => ({
          correct: prev.correct + 1,
          total: prev.total + 1,
        }));

        // 2. Logic to pick a NEW random target after a correct answer
        const type =
          zoomImage === "The Compound Microscope"
            ? "microscope"
            : "mitochondria";
        const labels = DIAGRAM_LABELS[type];
        const nextTarget = labels[Math.floor(Math.random() * labels.length)];
        setTestTarget(nextTarget);
      } else {
        // 3. Handle incorrect click
        triggerToast("❌ Try again! That's not the " + testTarget?.title);
        setScore((prev) => ({ ...prev, total: prev.total + 1 }));
      }
    } else {
      // Instead of alert, set the info state
    setActiveInfo(`${label.title}: ${label.desc}`);
    // Optional: Also trigger a success toast to show it's working
    triggerToast(`📖 Viewing ${label.title}`);
    }
  };

  // --- Inside EduStream component states ---
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // --- The Toast Function ---
  const triggerToast = (msg: string) => {
    const isCorrect = msg.includes("✅");
    setToast({ msg, type: isCorrect ? "success" : "error" });

    // Auto-hide after 2 seconds
    setTimeout(() => setToast(null), 2000);
  };

const persistentSelection = useRef("");

  // --- Selection Logic ---
 const handleMouseUp = () => {
  const sel = window.getSelection();
  const text = sel?.toString().trim();
  if (text && sel && sel.rangeCount > 0) {
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 60 });
    setSelectedText(text);
    persistentSelection.current = text; // Save to ref
  } else {
    // DO NOT setMenuPos(null) here if clicking inside the menu
    // We handle closing manually in the buttons
  }
};
  const handleAskAI = (query: string) => {
    setAiQuery(query);
    setIsAiOpen(true);
    setIsLoading(true);
    setMenuPos(null);
    setTimeout(() => {
      setAiResponse(
        `Regarding "${query}": This is a core concept in ${selectedBook.title}. It explains the structural efficiency required for biological homeostasis.`
      );
      setIsLoading(false);
    }, 1500);
  };

  // --- View 1: Library ---
// --- View 1: Library ---
  if (!selectedBook) {
    // Get unique subjects for the filter buttons
    const subjects = ["All", ...new Set(LIBRARY_DATA.map((book) => book.subject.split(" • ")[0]))];

    // Filter the books based on selection
    const filteredBooks = activeFilter === "All" 
      ? LIBRARY_DATA 
      : LIBRARY_DATA.filter(book => book.subject.includes(activeFilter));

    return (
      <div className="app-root" data-theme={isDark ? "dark" : "light"}>
        <div className="library-wrapper">
          <header className="premium-header">
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
            <div className="brand">
              <div className="brand-dot"></div>
              <h1 className="logo">
                Expanded<span>Book Content</span>
              </h1>
            </div>
            <div className="header-actions">
              <span className="user-profile">Welcome, Student</span>
              <button
                className="theme-toggle"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? "Light Appearance" : "Dark Appearance"}
                <span className="toggle-icon">{isDark ? "☀️" : "🌙"}</span>
              </button>
            </div>
          </header>

          <main className="content-area">
            <section className="welcome-hero">
              <h2>Your Digital Library</h2>
              <p>Continue where you left off in your learning journey.</p>
            </section>

            {/* --- NEW SUBJECT FILTER BAR --- */}
            {/* --- SUBJECT FILTER BAR --- */}
<div className="filter-container">
  <div className="filter-bar">
    {subjects.map((subject) => (
      <button
        key={subject}
        className={`filter-chip ${activeFilter === subject ? "active" : ""}`}
        onClick={() => setActiveFilter(subject)}
      >
        {subject}
      </button>
    ))}
  </div>
</div>

            <div className="book-grid">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="book-card-premium"
                  onClick={() => {
                    setSelectedBook(book);
                    setActiveChapter(book.chapters[0]);
                  }}
                >
                  <div
                    className="book-visual"
                    style={{ background: book.color }}
                  >
                    <div className="book-spine"></div>
                    <div className="book-glare"></div>
                    <span className="book-symbol">
                       {book.subject.includes("Science") ? "⚛" : 
                        book.subject.includes("Math") ? "π" : "📜"}
                    </span>
                  </div>
                  <div className="book-info">
                    <span className="subject-tag">{book.subject}</span>
                    <h3>{book.title}</h3>
                    <div className="progress-mini">
                      <div
                        className="progress-bar"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                    <div className="card-footer">
                      <span className="chapters-count">{book.chapters.length} Chapters</span>
                      <div className="arrow-btn">→</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // --- View 2: Reader ---
  return (
    <div
      className={`app-root ${isFocus ? "focus-active" : ""}`}
      data-theme={isDark ? "dark" : "light"}
    >
      <div className="workstation">
        {/* Sidebar */}
        <aside className="sidebar glass">
          <button className="exit-btn" onClick={() => setIsSummaryOpen(true)}>
            ← Back to Subjects
          </button>
          <div className="nav-group">
            <label>Chapters</label>
            {selectedBook.chapters.map((ch: any) => (
              <div
                key={ch.id}
                className={`nav-item ${
                  activeChapter.id === ch.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveChapter(ch);
                  setIsContentEnhanced(false);
                }}
              >
                <span className="nav-item-number">{ch.id}</span>
                <span className="nav-item-title">{ch.title}</span>
              </div>
            ))}
          </div>
          <div className="insight-box">
            <label>Saved Insights ({highlights.length})</label>
            {highlights.map((h, i) => (
              <div key={i} className="h-pill">
                {h.substring(0, 30)}...
              </div>
            ))}
          </div>
        </aside>

        {/* Reader */}
        <main className="main-viewport">
          <header className="reader-header glass">
            <div className="timer">⏱️ {formatTime(timer)}</div>

            <Link href="/dashboard">
              {/* <Button>Back to Dashboard</Button> */}
            </Link>
            <div className="actions" style={{ display:"flex",gap: "0.5rem" }}>
              <Button
                variant="outline"
                className="quiz-trigger"
                onClick={() => setIsQuizOpen(true)}
              >
                <TestTube2 className="mr-2 h-4 w-4" />
                Take Quiz
              </Button>
              {isContentEnhanced ? (
                <Button
                  className="btn-premium-active"
                  onClick={() => setIsContentEnhanced(false)}
                >
                  <ChevronsLeft className="mr-2 h-4 w-4" />
                  Collapse Content
                </Button>
              ) : (
                <Button
                  onClick={handleEnhanceContent}
                  disabled={!activeChapter.enhancedContent}
                >
                  <ChevronsRight className="mr-2 h-4 w-4" />
                  Expand Content
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFocus(!isFocus)}
              >
                <BookOpen className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDark(!isDark)}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </header>

          <div className="scroll-canvas" onMouseUp={handleMouseUp}>
          {menuPos && (
  <div
    className="context-menu glass"
    style={{ 
      top: menuPos.y, 
      left: menuPos.x,
      position: 'fixed', // Use fixed to stay relative to viewport
      zIndex: 9999 
    }}
    // Critical: prevent global mouseup from firing when clicking the menu
    onMouseUp={(e) => e.stopPropagation()}
    onMouseDown={(e) => e.preventDefault()} 
  >
    <button
      onClick={(e) => {
        e.stopPropagation();
        const text = persistentSelection.current;
        setHighlights(prev => [...prev, text]);
        setMenuPos(null);
      }}
    >
      Highlight
    </button>
    
    <button 
      className="ai-accent"
      onClick={(e) => {
        e.stopPropagation();
        handleAskAI(`Explain this in detail: "${persistentSelection.current}"`);
        setMenuPos(null);
      }}
    >
      🔍 Explain
    </button>

    <button 
      className="ai-accent"
      onClick={(e) => {
        e.stopPropagation();
        handleAskAI(`Summarize this passage: "${persistentSelection.current}"`);
        setMenuPos(null);
      }}
    >
      📝 Summarize
    </button>

    <button
      className="ai-accent"
      onClick={(e) => {
        e.stopPropagation();
        handleAskAI(persistentSelection.current);
        setMenuPos(null);
      }}
    >
      ✨ Ask AI
    </button>
  </div>
)}
            <article className="page glass">
              <span className="badge">Chapter {activeChapter.id}</span>
              <h1>{activeChapter.title}</h1>
               <AnimatePresence mode="wait">
                <motion.p
                  key={isContentEnhanced ? "enhanced" : "normal"}
                  className="reading-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {isContentEnhanced
                    ? activeChapter.enhancedContent
                    : activeChapter.content}
                </motion.p>
              </AnimatePresence>

              {/* Chapter 1: Microscope */}
              {activeChapter.id === 1 && (
                <div
                  className="img-container glass animate-pop"
                  onClick={() => handleImageClick("The Compound Microscope")}
                >
                  <div className="img-frame">
                    <div className="zoom-overlay">
                      <span>🔍 Click to Zoom</span>
                    </div>
                  </div>
                  <p className="img-caption">
                    Fig 1.1: Robert Hooke's original 1665 drawings of cork
                    cells.
                  </p>
                </div>
              )}

              {/* Chapter 2: Mitochondria */}
              {activeChapter.id === 2 && (
                <div
                  className="img-container glass animate-pop"
                  onClick={() => handleImageClick("Mitochondria Structure")}
                >
                  <div className="img-frame">
                    <div className="zoom-overlay">
                      <span>🔍 Click to Zoom</span>
                    </div>
                  </div>
                  <p className="img-caption">
                    Fig 1.2: Cross-section of a Mitochondrion highlighting the
                    inner membrane.
                  </p>
                </div>
              )}

              <div className="lightbox-image-placeholder">
                <div className="interactive-diagram-container">
                  {/* 1. ADD THE ACTUAL IMAGE HERE */}
                  <img
                   src={zoomImage === "The Compound Microscope" ? imgone : imgtwo}
                    alt="Diagram"
                    className="diagram-base-image"
                  />

                  {/* 2. HOTSPOTS OVERLAY THE IMAGE */}
                  {DIAGRAM_LABELS[
                    zoomImage === "The Compound Microscope"
                      ? "microscope"
                      : "mitochondria"
                  ].map((label) => (
                    <button
                      key={label.id}
                      className="hotspot-trigger"
                      style={{ top: label.top, left: label.left }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHotspotClick(label);
                      }}
                    >
                      <div className="ping"></div>
                    </button>
                  ))}
                </div>
                <div className="diagram-controls glass">
                  <button
                    className={`mode-toggle ${isTestMode ? "active" : ""}`}
                    onClick={toggleTestMode}
                  >
                    {isTestMode ? "🎯 Quiz Mode: ON" : "📖 Study Mode"}
                  </button>

                  {isTestMode && testTarget && (
                    <div className="test-prompt animate-pop">
                      Locate the: <strong>{testTarget.title}</strong>
                      <span className="score-pill">
                        {score.correct}/{score.total}
                      </span>
                    </div>
                  )}
                </div>
                <p className="instruction-text">
  {activeInfo ? (
    <span className="info-highlight animate-pop">✨ {activeInfo}</span>
  ) : (
    "Click on the pulsing icons to learn about specific parts."
  )}
</p>
              </div>

              <p className="reading-text">
                Select any passage above to generate AI summaries or save it to
                your research insights.
              </p>
            </article>
          </div>
        </main>

        {/* AI Lab */}
        <aside className={`ai-lab glass ${isAiOpen ? "open" : ""}`}>
          <div className="lab-head">
            <h3>✨ AI Learning Lab</h3>
            <button onClick={() => setIsAiOpen(false)}>✕</button>
          </div>
          <div className="lab-body">
            <div className="query-ref">Context: "{aiQuery}"</div>
            {isLoading ? (
              <div className="shimmer">Analyzing Text...</div>
            ) : (
              <div className="ai-card">
                <p>{aiResponse}</p>
                <button
                  className="btn-premium sm"
                  onClick={() => setHighlights([...highlights, aiQuery])}
                >
                  Save to Insights
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {isEnhancing && (
        <div className="overlay">
          <div className="loader"></div>
        </div>
      )}

      {/* Quiz Overlay */}
      {isQuizOpen && (
        <div className="overlay ">
          <div className="modal glass animate-pop">
            <h2>Knowledge Check</h2>
            <p>{QUIZ_DATA[activeChapter.id]?.q}</p>
            <div className="opt-list">
              {QUIZ_DATA[activeChapter.id]?.opts.map((o, i) => (
  <button
    key={i}
    className="opt-btn"
    onClick={() => {
      const isCorrect = i === QUIZ_DATA[activeChapter.id].a;
      if (isCorrect) {
        triggerToast("✅ Correct! Excellent understanding.");
        setIsQuizOpen(false); // Close only on success
      } else {
        triggerToast("❌ Incorrect. Review the chapter text!");
      }
    }}
  >
    {o}
  </button>
))}
            </div>
          </div>
        </div>
      )}

      {/* Session Summary */}
      {isSummaryOpen && (
        <div className="overlay ">
          <div className="modal glass animate-pop">
            <div className="medal">🏆</div>
            <h2>Session Complete</h2>
            <div className="stats">
              <div>
                <strong>{formatTime(timer)}</strong>
                <br />
                <small>Time</small>
              </div>
              <div>
                <strong>{highlights.length}</strong>
                <br />
                <small>Insights</small>
              </div>
            </div>
            <button
              className="btn-premium full"
              onClick={() => {
                setSelectedBook(null);
                setIsSummaryOpen(false);
                setTimer(0);
              }}
            >
              Finish & Save
            </button>
          </div>
        </div>
      )}

      <style>{styles}</style>
      {toast && (
        <div className={`toast-notification ${toast.type} animate-pop`}>
          {toast.msg}
        </div>
      )}

      {/* Floating AI Action Button */}
{/* Floating AI Container */}
{/* Premium Floating AI Assistant Container */}
{/* Premium Floating AI Assistant Container */}
{!isAiOpen && selectedBook && (
  <div className={`premium-fab-container ${isMiniChatOpen ? 'is-open' : ''}`}>
    
    {/* The Chat Window */}
    <div className="premium-chat-box glass animate-pop">
      <div className="chat-header">
        <div className="assistant-info">
          <div className="avatar-sparkle">✨</div>
          <div>
            <p className="assistant-name">Ask AI</p>
            <span className="assistant-status">Online • Ready to help</span>
          </div>
        </div>
        <button className="close-mini" onClick={() => setIsMiniChatOpen(false)}>✕</button>
      </div>

      <div className="chat-body">
        <div className="welcome-msg">
          How can I help you with <strong>{activeChapter.title}</strong> today?
        </div>
        
        {/* --- NEW QUICK ACTION CHIPS --- */}
        <div className="quick-actions">
          <button onClick={() => handleAskAI("Summarize this chapter in 3 bullet points")}>
            📝 Summarize
          </button>
          <button onClick={() => handleAskAI("Explain the core concept of this page like I'm 5 years old")}>
            👶 ELI5
          </button>
          <button onClick={() => handleAskAI("Give me a real-world example of this concept")}>
            🌍 Example
          </button>
        </div>

        <textarea 
          placeholder="Ask a question..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAskAI(localQuery);
              setIsMiniChatOpen(false);
              setLocalQuery("");
            }
          }}
        />
      </div>

      <div className="chat-footer">
        <button 
          className="premium-send-btn" 
          onClick={() => {
            handleAskAI(localQuery);
            setIsMiniChatOpen(false);
            setLocalQuery("");
          }}
        >
          <span>Get Answer</span>
          <div className="btn-shine"></div>
        </button>
      </div>
    </div>

    {/* The Premium Circular Button */}
    <button 
      className={`premium-fab ${isMiniChatOpen ? 'active' : ''}`}
      onClick={() => setIsMiniChatOpen(!isMiniChatOpen)}
    >
      <div className="fab-ring"></div>
      <div className="fab-inner">
        <span className="fab-icon">{isMiniChatOpen ? "✕" : "✨"}</span>
      </div>
    </button>
  </div>
)}
    </div>
  );
};

const styles = `
  :root {
  --bg-app: #fcfcfd;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --card-bg: rgba(255, 255, 255, 0.8);
  --border: #f1f5f9;
  --accent: #6366f1;
  --shadow: 0 10px 30px -10px rgba(0,0,0,0.04);
}

[data-theme='dark'] {
  --bg-app: #020617;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --card-bg: rgba(15, 23, 42, 0.6);
  --border: #1e293b;
  --shadow: 0 10px 40px -15px rgba(0,0,0,0.4);
}
.app-root {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, sans-serif;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.premium-fab-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}
/* Quick Action Chips */
.quick-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.quick-actions::-webkit-scrollbar {
  display: none; /* Hide scrollbar for a cleaner look */
}

.quick-actions button {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  white-space: nowrap;
  cursor: pointer;
  transition: 0.3s;
}

.quick-actions button:hover {
  background: var(--accent);
  color: white;
  transform: translateY(-2px);
}

/* Enhanced Fab Rotation Speed on Open */
.is-open .fab-ring {
  animation: rotate-ring 1.5s linear infinite;
  filter: hue-rotate(90deg);
}

/* Entrance animation for the chips */
.is-open .quick-actions button {
  animation: slideInChips 0.5s ease-out forwards;
  opacity: 0;
}

.is-open .quick-actions button:nth-child(1) { animation-delay: 0.2s; }
.is-open .quick-actions button:nth-child(2) { animation-delay: 0.3s; }
.is-open .quick-actions button:nth-child(3) { animation-delay: 0.4s; }

@keyframes slideInChips {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
/* Glassmorphic Chat Box */
.premium-chat-box {
  width: 340px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  
  /* Slide & Scale Animation */
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  pointer-events: none;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.is-open .premium-chat-box {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

/* Chat Header */
.chat-header {
  padding: 20px;
  background: rgba(99, 102, 241, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.avatar-sparkle {
  width: 40px;
  height: 40px;
  background: var(--accent);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  margin-right: 12px;
}

.assistant-info { display: flex; align-items: center; }
.assistant-name { font-weight: 800; font-size: 0.95rem; margin: 0; }
.assistant-status { font-size: 0.7rem; color: #22c55e; font-weight: 600; }

/* Chat Body */
.chat-body { padding: 20px; }
.welcome-msg { font-size: 0.85rem; margin-bottom: 15px; opacity: 0.8; line-height: 1.5; }

.chat-body textarea {
  width: 100%;
  height: 100px;
  background: rgba(0,0,0,0.03);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  font-family: inherit;
  resize: none;
  transition: 0.3s;
}

.chat-body textarea:focus {
  outline: none;
  border-color: var(--accent);
  background: white;
}

/* Premium Button */
.premium-send-btn {
  width: calc(100% - 40px);
  margin: 0 20px 20px;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: 0.5s;
  animation: shine 3s infinite;
}

@keyframes shine {
  to { left: 200%; }
}

/* Floating Action Button */
.premium-fab {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: white;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.fab-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #6366f1);
  animation: rotate-ring 4s linear infinite;
}

.fab-inner {
  position: absolute;
  inset: 2px;
  background: var(--bg-app);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.fab-icon { font-size: 1.6rem; color: var(--accent); }

[data-theme='dark'] .premium-chat-box {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(255,255,255,0.1);
}

[data-theme='dark'] .fab-inner { background: #020617; }
.toast-notification {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 28px;
  border-radius: 16px;
  font-weight: 700;
  z-index: 9999;
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
}

.toast-notification.success {
  background: rgba(34, 197, 94, 0.9); /* Green */
}

.toast-notification.error {
  background: rgba(239, 68, 68, 0.9); /* Red */
}
.library-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

/* Header */
.premium-header {
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.brand { display: flex; align-items: center; gap: 12px; }
.brand-dot { width: 12px; height: 12px; background: var(--accent); border-radius: 50%; }
.logo { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.5px; }
.logo span { font-weight: 300; opacity: 0.6; margin-left: 4px; }

.header-actions { display: flex; align-items: center; gap: 32px; }
.user-profile { font-size: 0.85rem; font-weight: 500; color: var(--text-muted); }

.theme-toggle {
  background: var(--card-bg);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 99px;
  cursor: pointer;
  color: var(--text-main);
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
}
.theme-toggle:hover { transform: translateY(-2px); box-shadow: var(--shadow); }

/* Hero */
.welcome-hero { padding: 80px 0 60px; }
.welcome-hero h2 { font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
.welcome-hero p { color: var(--text-muted); font-size: 1.1rem; }

/* Book Grid */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 40px;
  padding-bottom: 100px;
}

.book-card-premium {
  background: var(--card-bg);
  border-radius: 24px;
  border: 1px solid var(--border);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.book-card-premium:hover {
  transform: translateY(-12px);
  border-color: var(--accent);
}

.book-visual {
  height: 180px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 15px 30px -10px rgba(0,0,0,0.2);
}

.book-spine { position: absolute; left: 0; width: 12px; height: 100%; background: rgba(0,0,0,0.1); border-right: 1px solid rgba(255,255,255,0.1); }
.book-glare { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(105deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%); }
.book-symbol { font-size: 4rem; color: white; opacity: 0.9; }
.diagram-controls {
  margin-bottom: 20px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  border-radius: 16px;
}

.mode-toggle {
  background: var(--card-bg);
  border: 1px solid var(--accent);
  color: var(--text-main);
  padding: 8px 20px;
  border-radius: 99px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.3s;
}

.mode-toggle.active {
  background: var(--accent);
  color: white;
}

.test-prompt {
  background: rgba(99, 102, 241, 0.1);
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 1.1rem;
  color: var(--text-main);
  border-left: 4px solid var(--accent);
}

.score-pill {
  margin-left: 15px;
  background: var(--text-main);
  color: var(--bg-app);
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
}
.subject-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
  color: var(--accent);
}

.book-info h3 { font-size: 1.4rem; font-weight: 700; margin: 8px 0 16px; line-height: 1.3; }

.progress-mini {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  margin-bottom: 24px;
}
.progress-bar { height: 100%; background: var(--accent); border-radius: 2px; transition: 1s ease-in-out; }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chapters-count { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }

.arrow-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--text-main);
  color: var(--bg-app);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: 0.3s;
}
.book-card-premium:hover .arrow-btn { background: var(--accent); transform: scale(1.1); }
/* Workstation */
  * { box-sizing: border-box; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg-app); color: var(--text-main); }

//   .app-root { height: 100vh; overflow: hidden; } 
  .glass { background: var(--glass); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 28px; }

  /* Library */
  .library-container { max-width: 1100px; margin: 80px auto; padding: 0 20px; }
  .lib-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
  .lib-header h1 { font-size: 2.5rem; font-weight: 600; }
  .lib-header .search-input { width: 400px; }
  /* Workstation */
  .workstation { display: flex; height: 100vh; padding: 20px; gap: 20px; }
  .sidebar { width: 280px; padding: 30px; display: flex; flex-direction: column; gap: 30px; }
  .exit-btn { background: transparent; border: none; color: var(--accent); cursor: pointer; font-weight: 800; text-align: left; }
  .nav-item { 
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px 18px;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 8px;
    position: relative;
    overflow: hidden;
    color: var(--text-muted);
  }
  .nav-item:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: var(--accent);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }
  .nav-item:hover, .nav-item.active {
    background: rgba(99, 102, 241, 0.1);
    color: var(--text-main);
  }
  .nav-item.active:before {
    transform: scaleY(1);
  }
  .nav-item-number {
    color: var(--accent);
    font-weight: 700;
  }
  .h-pill { background: rgba(99, 102, 241, 0.1); padding: 8px 12px; border-radius: 10px; font-size: 0.8rem; margin-top: 5px; border-left: 3px solid var(--accent); }
/* --- Premium Glassmorphic Image Container --- */
.img-container {
  margin: 40px auto;
  max-width: 90%;
  padding: 20px;
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.img-container:hover {
  transform: translateY(-5px);
  border-color: var(--accent);
}

.img-frame {
  width: 100%;
  min-height: 250px;
  background: rgba(0, 0, 0, 0.03); /* Subtle backdrop for the image */
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}
/* --- Zoom Overlay Styles --- */
.img-frame {
  position: relative;
  cursor: zoom-in;
}
  /* Container to manage layout */
.filter-container {
  width: 100%;
  margin-bottom: 40px;
  position: relative;
}

/* The actual scrolling bar */
.filter-bar {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 10px 5px 20px 5px; /* Bottom padding for scrollbar space */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* Smooth scroll for mobile */
}

/* Custom Scrollbar Styling */
.filter-bar::-webkit-scrollbar {
  height: 6px; /* Height of the horizontal scrollbar */
}

.filter-bar::-webkit-scrollbar-track {
  background: transparent;
}

.filter-bar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
  transition: background 0.3s;
}

.filter-bar:hover::-webkit-scrollbar-thumb {
  background: var(--accent); /* Scrollbar turns accent color on hover */
  opacity: 0.5;
}

/* Firefox Support */
.filter-bar {
  scrollbar-width: thin;
  scrollbar-color: var(--accent) transparent;
}

.filter-chip {
  padding: 10px 24px;
  border-radius: 99px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap; /* Prevents text from wrapping to next line */
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0; /* CRITICAL: Prevents buttons from squishing */
}

.filter-chip.active,
.filter-chip:hover {
  background: var(--accent);
  color: white;
}

/* --- Zoom Overlay Styles --- */
.img-frame {
  position: relative;
  cursor: zoom-in;
}
.zoom-overlay {
  position: absolute;
  inset: 0;
  background: rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}

.img-frame:hover .zoom-overlay {
  opacity: 1;
}

.zoom-overlay span {
  background: var(--accent);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.8rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

/* --- Lightbox Modal --- */
.zoom-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(25px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.lightbox-content {
  width: 90%;
  max-width: 1000px;
  text-align: center;
  color: white;
}

.lightbox-image-placeholder {
  background: white;
  padding: 20px;
  border-radius: 24px;
  margin-bottom: 20px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.5);
}
.lightbox-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px;
}

.zoom-content-wrapper {
  animation: slideUpFade 0.4s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.zoom-subtext {
  font-size: 0.9rem;
  color: var(--accent);
  background: rgba(99, 102, 241, 0.1);
  padding: 6px 15px;
  border-radius: 12px;
  font-weight: 600;
}

@keyframes slideUpFade {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
.interactive-diagram-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.hotspot-trigger {
overflow: visible; /* Ensures the hotspot is visible */
  position: absolute;
  width: 30px; /* Slightly larger hit area */
  height: 30px;
  background: var(--accent);
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  z-index: 999; /* 3. Ensures it is on top of the image */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  pointer-events: auto; /* 4. Forces click detection */
}
.diagram-base-image {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  display: block;
  border-radius: 12px;
}

.info-highlight {
  color: var(--accent);
  font-weight: 700;
  font-size: 1rem;
  display: block;
  padding: 10px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
}
/* Ensure the container allows clicks */
.interactive-diagram-container {
  position: relative;
  display: inline-block;
  pointer-events: auto;
}

.hotspot-trigger:hover {
  transform: scale(1.3);
  background: #f472b6; /* Color shift on hover */
}

/* Pulsing Animation */
.ping {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.6;
  animation: pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}

.instruction-text {
  margin-top: 20px;
  font-size: 0.85rem;
  color: white;
  opacity: 0.6;
  letter-spacing: 0.5px;
}
/* Make sure images inside the lightbox don't overflow */
.lightbox-image-placeholder img,
.lightbox-image-placeholder svg {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 10px;
}
[data-theme='dark'] .lightbox-image-placeholder {
  background: #1e293b;
}

.close-lightbox {
  position: absolute;
  top: 40px;
  right: 40px;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: bold;
  cursor: pointer;
}

/* Animation */
@keyframes zoomInEffect {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.animate-zoom {
  animation: zoomInEffect 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
/* Dark mode adjustment for frames */
[data-theme='dark'] .img-frame {
  background: rgba(255, 255, 255, 0.05);
}

.img-caption {
  font-size: 0.9rem;
  font-style: italic;
  opacity: 0.7;
  color: var(--text);
  margin-top: 10px;
  padding: 0 10px;
}

/* Animation to make images fade in beautifully */
@keyframes popUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-pop {
  animation: popUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
  /* Main Reader */
  .main-viewport { flex: 1; display: flex; flex-direction: column; gap: 15px; }
  .reader-header { height: 75px; display: flex; justify-content: space-between; align-items: center; padding: 0 25px; position: relative; }
  .timer { font-family: monospace; font-weight: 700; color: var(--accent); font-size: 1.1rem; }
  .scroll-canvas { flex: 1; overflow-y: auto; padding-right: 10px; position: relative; }
  .page { max-width: 800px; margin: 0 auto 100px; padding: 80px; }
  .badge { background: rgba(99, 102, 241, 0.1); color: var(--accent); padding: 6px 15px; border-radius: 20px; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; }
  h1 { font-size: 2.5rem; font-weight: 900; margin: 20px 0; letter-spacing: -2px; }
  .reading-text { font-size: 1.1rem; line-height: 1.9; margin-bottom: 25px; opacity: 0.9; }

  /* Premium Buttons */
  .btn-premium { 
    background: var(--accent); color: white; border: none; padding: 10px 20px; 
    border-radius: 12px; font-weight: 600; cursor: pointer; 
    box-shadow: 0 5px 15px rgba(99, 102, 241, 0.2);
    transition: all 0.3s ease;
  }
  .btn-premium:hover { 
    transform: translateY(-2px); 
    filter: brightness(1.1); 
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3); 
  }
  .btn-premium.btn-premium-active {
    background: #4f46e5;
    box-shadow: 0 2px 5px rgba(79, 70, 229, 0.3);
  }
  .btn-premium:disabled {
    background-color: #a5b4fc;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    filter: none;
  }
  .btn-premium.sm { font-size: 0.8rem; padding: 8px 16px; margin-top: 15px; }
  .btn-circle { 
    background: var(--card-bg); 
    border: 1px solid var(--border); 
    color: var(--text-muted); 
    width: 40px;
    height: 40px;
    border-radius: 50%; 
    cursor: pointer; 
    margin-left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-circle:hover {
    background: rgba(99, 102, 241, 0.1);
    color: var(--accent);
  }


  /* AI Drawer */
  .ai-lab { width: 360px; position: fixed; right: -400px; top: 20px; bottom: 20px; transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1); padding: 30px; }
  .ai-lab.open { right: 20px; }
  .query-ref { font-style: italic; opacity: 0.6; border-left: 3px solid var(--accent); padding-left: 15px; margin-bottom: 20px; }
  .ai-card { background: rgba(99, 102, 241, 0.05); padding: 25px; border-radius: 20px; border: 1px solid var(--accent); line-height: 1.6; }

  /* Context Menu */

 
  .ai-accent { color: var(--accent) !important; }

  /* Enhanced Context Menu */
.context-menu {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: row; /* Default: Left to Right */
  flex-wrap: wrap;    /* Allows wrapping to Top to Bottom */
  gap: 4px;
  padding: 6px;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  pointer-events: all !important;
  user-select: none; /* Prevents text inside buttons from being selected */
  cursor: default;
  /* Constraints for Responsiveness */
  max-width: 280px;   /* Forces wrap if too many buttons */
  min-width: 120px;
  justify-content: center;
  align-items: center;
  animation: contextMenuPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.context-menu button {
  background: transparent;
  border: none;
  color: var(--text-main);
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  white-space: nowrap; /* Keeps text on one line within the button */
  flex: 1 1 auto;      /* Allows buttons to grow and fill space */
  text-align: center;
  pointer-events: auto !important;
  cursor: pointer !important;
}

.context-menu button:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateY(-1px);
}

.ai-accent {
  color: var(--accent) !important;
}

/* Animation for the menu appearance */
@keyframes contextMenuPop {
  from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.9); }
  to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

/* Mobile Tweak: Force vertical if screen is very narrow */
@media (max-width: 480px) {
  .context-menu {
    flex-direction: column;
    min-width: 160px;
  }
  .context-menu button {
    width: 100%;
  }
}
  /* Modals */
  /* 1. Remove 'filter: blur()' if you have it anywhere in your CSS */

.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  /* Darken the background slightly */
  background: rgba(0, 0, 0, 0.4); 
}

.overlay.blur {
  /* THIS IS THE KEY: it blurs what is BEHIND the div, not the div itself */
  backdrop-filter: blur(8px); 
  -webkit-backdrop-filter: blur(8px); /* For Safari support */
}

.modal {
  /* Ensure the modal has a solid or semi-solid background so it stands out */
  background: var(--card-bg);
  padding: 40px;
  border-radius: 28px;
  border: 1px solid var(--border);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  width: 90%;
  position: relative; /* Keep it above the blur */
  z-index: 2001;
}
  .opt-btn { width: 100%; padding: 18px; border-radius: 18px; border: 1px solid var(--border); background: var(--bg); color: var(--text); margin-bottom: 10px; cursor: pointer; font-weight: 600; }
  .opt-btn:hover { border-color: var(--accent); background: rgba(99, 102, 241, 0.05); }
  .stats { display: flex; justify-content: center; gap: 40px; margin: 30px 0; }
  .medal { font-size: 4rem; margin-bottom: 20px; }
  .full { width: 100%; }

  .shimmer { animation: shimmer 1.5s infinite; opacity: 0.6; }
  @keyframes shimmer { 50% { opacity: 1; } }
  @keyframes popUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .animate-pop { animation: popUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }

  .focus-active .sidebar { width: 0; opacity: 0; padding: 0; margin: 0; pointer-events: none; }
  .focus-active .ai-lab { right: -400px !important; }

  .loader {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 5px solid var(--border);
    border-top-color: var(--accent);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default BookContentWindow;