/**
 * Detect which body part a click landed on based on (x, y) percentage
 * coordinates within the silhouette container.
 *
 * The silhouette is roughly centered with body regions mapped
 * as percentage zones. These zones are approximate and work for
 * both male and female silhouettes.
 *
 * Coordinate system: (0,0) = top-left, (100,100) = bottom-right
 */

const BODY_REGIONS = [
  // Head & Neck
  { name: "Head",             xMin: 38, xMax: 62, yMin: 0,  yMax: 12 },
  { name: "Neck",             xMin: 42, xMax: 58, yMin: 12, yMax: 16 },

  // Shoulders
  { name: "Left Shoulder",    xMin: 28, xMax: 42, yMin: 14, yMax: 20 },
  { name: "Right Shoulder",   xMin: 58, xMax: 72, yMin: 14, yMax: 20 },

  // Upper Arms
  { name: "Left Upper Arm",   xMin: 20, xMax: 32, yMin: 20, yMax: 32 },
  { name: "Right Upper Arm",  xMin: 68, xMax: 80, yMin: 20, yMax: 32 },

  // Elbows
  { name: "Left Elbow",       xMin: 17, xMax: 28, yMin: 32, yMax: 37 },
  { name: "Right Elbow",      xMin: 72, xMax: 83, yMin: 32, yMax: 37 },

  // Forearms
  { name: "Left Forearm",     xMin: 14, xMax: 26, yMin: 37, yMax: 46 },
  { name: "Right Forearm",    xMin: 74, xMax: 86, yMin: 37, yMax: 46 },

  // Hands
  { name: "Left Hand",        xMin: 10, xMax: 22, yMin: 46, yMax: 54 },
  { name: "Right Hand",       xMin: 78, xMax: 90, yMin: 46, yMax: 54 },

  // Chest / Upper Torso
  { name: "Upper Chest",      xMin: 38, xMax: 62, yMin: 16, yMax: 24 },
  { name: "Left Chest",       xMin: 32, xMax: 48, yMin: 20, yMax: 30 },
  { name: "Right Chest",      xMin: 52, xMax: 68, yMin: 20, yMax: 30 },

  // Abdomen
  { name: "Upper Abdomen",    xMin: 36, xMax: 64, yMin: 30, yMax: 38 },
  { name: "Lower Abdomen",    xMin: 36, xMax: 64, yMin: 38, yMax: 46 },

  // Back (same zones — the silhouette is a front view, so these
  // overlap. The label is contextual; we default to the front-view name.)

  // Hips / Pelvis
  { name: "Left Hip",         xMin: 32, xMax: 46, yMin: 44, yMax: 52 },
  { name: "Right Hip",        xMin: 54, xMax: 68, yMin: 44, yMax: 52 },
  { name: "Pelvis",           xMin: 40, xMax: 60, yMin: 46, yMax: 52 },

  // Upper Legs / Thighs
  { name: "Left Thigh",       xMin: 32, xMax: 48, yMin: 52, yMax: 65 },
  { name: "Right Thigh",      xMin: 52, xMax: 68, yMin: 52, yMax: 65 },

  // Knees
  { name: "Left Knee",        xMin: 34, xMax: 48, yMin: 65, yMax: 72 },
  { name: "Right Knee",       xMin: 52, xMax: 66, yMin: 65, yMax: 72 },

  // Lower Legs / Shins
  { name: "Left Shin",        xMin: 34, xMax: 48, yMin: 72, yMax: 85 },
  { name: "Right Shin",       xMin: 52, xMax: 66, yMin: 72, yMax: 85 },

  // Ankles
  { name: "Left Ankle",       xMin: 36, xMax: 46, yMin: 85, yMax: 90 },
  { name: "Right Ankle",      xMin: 54, xMax: 64, yMin: 85, yMax: 90 },

  // Feet
  { name: "Left Foot",        xMin: 32, xMax: 46, yMin: 90, yMax: 100 },
  { name: "Right Foot",       xMin: 54, xMax: 68, yMin: 90, yMax: 100 },
];

/**
 * Given (x, y) in percent of the silhouette container,
 * return the best-matching body part name.
 *
 * Uses distance-to-center as a tiebreaker when a point
 * falls inside multiple overlapping regions.
 */
export function detectBodyPart(x, y) {
  let best = null;
  let bestDist = Infinity;

  for (const region of BODY_REGIONS) {
    if (x >= region.xMin && x <= region.xMax && y >= region.yMin && y <= region.yMax) {
      // Point is inside this region — pick the closest center
      const cx = (region.xMin + region.xMax) / 2;
      const cy = (region.yMin + region.yMax) / 2;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < bestDist) {
        bestDist = dist;
        best = region.name;
      }
    }
  }

  return best || "Body";
}
