const MaleIcon = () => (
  <svg viewBox="311 405 22 30" width="14" height="20" fill="currentColor">
    <path d="M320.31,414.76c1.7,0,3.09-1.38,3.09-3.09s-1.38-3.09-3.09-3.09-3.09,1.38-3.09,3.09,1.38,3.09,3.09,3.09Z" />
    <path d="M322.11,415.79h-3.61c-1.99,0-3.62,1.63-3.62,3.62v3.18c0,1.75,1.26,3.22,2.92,3.55-.13.29-.21.62-.21.96v3.84c0,1.3,1.07,2.37,2.37,2.37h.69c1.3,0,2.37-1.07,2.37-2.37v-3.84c0-.34-.08-.66-.21-.96,1.66-.33,2.92-1.79,2.92-3.55v-3.18c0-1.99-1.63-3.62-3.62-3.62Z" />
  </svg>
);

const FemaleIcon = () => (
  <svg viewBox="289 405 22 30" width="14" height="20" fill="currentColor">
    <path d="M298.08,414.8c1.7,0,3.08-1.38,3.08-3.09s-1.38-3.08-3.08-3.08-3.09,1.38-3.09,3.08,1.38,3.09,3.09,3.09Z" />
    <path d="M303.15,419.75l-1.69-3.78c-.25-.56-.81-.93-1.42-.93h-3.91c-.61,0-1.17.36-1.42.93l-1.69,3.78c-.15.33-.12.72.08,1.03.2.31.55.5.92.5h1.46v5.67c0,1.3,1.07,2.37,2.37,2.37h.69c1.3,0,2.37-1.07,2.37-2.37v-5.67h1.46c.37,0,.72-.19.92-.5.2-.31.23-.69.08-1.03Z" />
  </svg>
);

export default function GenderToggle({ gender, onGenderChange }) {
  return (
    <div className="flex w-full">
      <div className="flex w-full rounded-lg bg-white/5 p-0.5">
        <button
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs
                     transition-all duration-200 ${
                       gender === "male"
                         ? "bg-accent text-bg-primary"
                         : "text-text-secondary hover:text-text-primary"
                     }`}
          onClick={() => onGenderChange("male")}
          aria-label="Male silhouette"
          title="Male"
        >
          <MaleIcon />
        </button>
        <button
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs
                     transition-all duration-200 ${
                       gender === "female"
                         ? "bg-accent text-bg-primary"
                         : "text-text-secondary hover:text-text-primary"
                     }`}
          onClick={() => onGenderChange("female")}
          aria-label="Female silhouette"
          title="Female"
        >
          <FemaleIcon />
        </button>
      </div>
    </div>
  );
}
