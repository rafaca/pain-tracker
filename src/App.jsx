import { useState, useCallback, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, hasFirebase } from "./firebase/config";
import Silhouette from "./components/Silhouette";
import GenderToggle from "./components/GenderToggle";
import ProgressGraph from "./components/ProgressGraph";
import AuthButton from "./components/AuthButton";
import SpeedDial from "./components/SpeedDial";
import NotesDrawer from "./components/NotesDrawer";
import Timeline from "./components/Timeline";
import { detectBodyPart } from "./utils/bodyPartMap";

let nextId = 1;

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // UI state
  const [gender, setGender] = useState(() => localStorage.getItem("pt-gender") || "male");
  const [painPoints, setPainPoints] = useState([]);
  const [activeDial, setActiveDial] = useState(null);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Listen to auth
  useEffect(() => {
    if (!hasFirebase || !auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Persist gender choice
  useEffect(() => {
    localStorage.setItem("pt-gender", gender);
  }, [gender]);

  // Auth handlers
  const handleSignIn = useCallback(async () => {
    if (!auth || !googleProvider) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Sign in error:", err);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }, []);

  // Pain point handlers
  const handleBodyClick = useCallback((x, y) => {
    if (activeDial) {
      // Dial is active → just confirm it, don't open a new one
      setPainPoints((prev) => [
        ...prev,
        { ...activeDial, id: `pt-${nextId++}` },
      ]);
      setActiveDial(null);
      return;
    }
    // No active dial → open new one at click location
    const bodyPart = detectBodyPart(x, y);
    setActiveDial({ id: `tmp-${nextId++}`, x, y, intensity: 0, bodyPart });
  }, [activeDial]);

  const handleIntensityChange = useCallback((val) => {
    setActiveDial((prev) => (prev ? { ...prev, intensity: val } : null));
  }, []);

  const handleConfirmPoint = useCallback(() => {
    if (!activeDial) return;
    setPainPoints((prev) => [
      ...prev,
      { ...activeDial, id: `pt-${nextId++}` },
    ]);
    setActiveDial(null);
  }, [activeDial]);

  const handleRemovePoint = useCallback(() => {
    setActiveDial(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setPainPoints([]);
    setActiveDial(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (painPoints.length === 0) return;
    // TODO: Save to Firestore when auth is configured
    console.log("Submitting entry:", {
      gender,
      points: painPoints,
      notes,
      timestamp: Date.now(),
    });
    alert("Entry saved! (Firebase integration pending)");
    setPainPoints([]);
    setActiveDial(null);
    setNotes("");
  }, [painPoints, gender, notes]);

  return (
    <div className="flex h-screen h-[100dvh]">
      {/* ======= SIDEBAR (desktop only) ======= */}
      <aside className="hidden w-[260px] min-w-[260px] shrink-0 flex-col justify-between
                        overflow-y-auto border-r border-border bg-bg-sidebar md:flex">
        {/* Top section */}
        <div className="flex flex-col gap-4 p-5">
          {/* Brand */}
          <div className="pb-1">
            <h1 className="text-base font-bold tracking-tight text-text-primary">Pain Tracker</h1>
          </div>

          {/* Intro */}
          <p className="text-[12.5px] leading-relaxed text-white">
            Tap anywhere on the body to mark pain. Drag the dial to set intensity.
            Submit to save your entry.
          </p>

          {/* Gender toggle */}
          <div className="flex flex-col gap-1.5">
            <GenderToggle gender={gender} onGenderChange={setGender} />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Notes
            </label>
            <textarea
              className="h-20 w-full resize-none rounded-lg border border-border bg-white/4
                         p-2.5 text-[13px] leading-relaxed text-text-primary
                         placeholder:text-white/25 transition-colors duration-200
                         focus:border-accent focus:outline-none"
              placeholder="Describe your symptoms, triggers, medication..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Progress graph */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Progress
            </label>
            <ProgressGraph />
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-2 border-t border-border p-4">
          <AuthButton
            user={user}
            loading={authLoading}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
          />
        </div>
      </aside>

      {/* ======= MAIN AREA ======= */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center gap-2 border-b border-border bg-bg-sidebar p-2.5
                       pt-[calc(0.6rem+env(safe-area-inset-bottom,0))] md:hidden">
          <h1 className="shrink-0 text-sm font-bold text-text-primary">Pain Tracker</h1>
          <div className="w-24">
            <GenderToggle gender={gender} onGenderChange={setGender} />
          </div>
          <div className="ml-auto flex shrink-0 gap-1.5">
            {/* Mobile auth */}
            {!user && !authLoading && (
              <button
                onClick={handleSignIn}
                className="rounded-lg border border-border bg-white/5 px-2.5 py-1 text-[11px]
                           text-text-secondary transition-colors hover:border-accent hover:text-text-primary"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Silhouette area */}
        <div className="flex flex-1 items-center justify-center overflow-visible p-2">
          <Silhouette
            gender={gender}
            painPoints={painPoints}
            activeDial={activeDial}
            onBodyClick={handleBodyClick}
            onIntensityChange={handleIntensityChange}
            onConfirmPoint={handleConfirmPoint}
            onRemovePoint={handleRemovePoint}
          />
        </div>

        {/* ======= SPEED DIAL (FAB) ======= */}
        <SpeedDial
          onToggleNotes={() => setShowNotes(true)}
          onToggleTimeline={() => setShowTimeline(!showTimeline)}
          onSubmit={handleSubmit}
          onClearAll={handleClearAll}
          hasPoints={painPoints.length > 0}
          isLoggedIn={!!user}
        />
      </main>

      {/* ======= OVERLAYS ======= */}
      <NotesDrawer
        open={showNotes}
        notes={notes}
        onChange={setNotes}
        onClose={() => setShowNotes(false)}
      />

      {showTimeline && (
        <Timeline
          entries={[]}
          loading={false}
          onClose={() => setShowTimeline(false)}
          onSelectEntry={(entry) => console.log("Selected:", entry)}
        />
      )}
    </div>
  );
}
