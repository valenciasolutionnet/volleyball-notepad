export const C = {
  bg: "#131F19",
  bg2: "#0E1712",
  panel: "#1C2B22",
  panel2: "#24382C",
  panel3: "#2C4234",
  chalk: "#EDEAE0",
  chalkDim: "#AAB8A6",
  chalkFaint: "rgba(237,234,224,0.45)",
  amber: "#E0872C",
  amberDim: "#B96C22",
  amberInk: "#241505",
  sage: "#79A07A",
  red: "#C4453A",
  line: "rgba(237,234,224,0.14)",
};

let idCounter = 1;
export const uid = () => idCounter++;

export function recoverIdCounter(persistedState) {
  const matches = JSON.stringify(persistedState || {}).matchAll(/"id":(\d+)/g);
  let max = 0;
  for (const m of matches) max = Math.max(max, Number(m[1]));
  if (max >= idCounter) idCounter = max + 1;
}

export function addItem(setItems, text) {
  if (!text.trim()) return;
  setItems((items) => [...items, { id: uid(), text: text.trim(), done: false }]);
}
export function toggleItem(setItems, id) {
  setItems((items) => items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
}
export function removeItem(setItems, id) {
  setItems((items) => items.filter((i) => i.id !== id));
}
export function createDiagram(name, category = "offense") {
  return { id: uid(), name, category, markers: [], lines: [] };
}

export const DRILL_CATEGORIES = [
  { key: "serving", label: "Serving", color: "amber" },
  { key: "passing", label: "Passing / Receive", color: "sage" },
  { key: "setting", label: "Setting", color: "sage" },
  { key: "hitting", label: "Hitting / Attacking", color: "amber" },
  { key: "blocking", label: "Blocking", color: "red" },
  { key: "defense", label: "Defense / Digging", color: "red" },
  { key: "transition", label: "Transition", color: "sage" },
  { key: "conditioning", label: "Conditioning", color: "dim" },
];

export function defaultDrills() {
  return [
    { id: uid(), name: "Target Serving", category: "serving", duration: 8, description: "Serve to marked zones on the opponent's court. Focus on consistency and placement.", beginnerTip: "Start closer to the net and aim for the middle back zone.", advancedTip: "Add float serve technique and aim for sharp corners." },
    { id: uid(), name: "Serve and Sprint", category: "serving", duration: 6, description: "Serve, then immediately sprint to base position. Builds serve-and-cover habits.", beginnerTip: "Slow jog back to base after each serve.", advancedTip: "Require a dive or roll after the sprint." },
    { id: uid(), name: "Pepper (2-Person)", category: "passing", duration: 8, description: "Pass-set-hit cycle between two players. The bread-and-butter of ball control.", beginnerTip: "Focus on clean passes to the target area before adding the hit.", advancedTip: "Require one-hand sets or switch to 3-person pepper with movement." },
    { id: uid(), name: "Serve Receive Lanes", category: "passing", duration: 10, description: "Three passers receive serves from a server. Rotate after 5 quality passes.", beginnerTip: "Server tosses instead of serves so passers focus on platform.", advancedTip: "Server uses jump float serves at game speed." },
    { id: uid(), name: "Setting to Targets", category: "setting", duration: 8, description: "Setters deliver consistent sets to four target zones on the net.", beginnerTip: "Use a toss instead of a pass to start each rep.", advancedTip: "Add a live passer and require quick tempo sets." },
    { id: uid(), name: "Back-Set Progression", category: "setting", duration: 6, description: "Setter works on back-setting to the right-side pin with consistent height.", beginnerTip: "Start without a net and focus on hand shape.", advancedTip: "Add a live blocker jumping in front of the setter." },
    { id: uid(), name: "Approach and Swing", category: "hitting", duration: 8, description: "Hitters work on three-step approach timing and arm swing mechanics.", beginnerTip: "Remove the block and focus on a controlled swing.", advancedTip: "Add a live block and require line or cross-court shots." },
    { id: uid(), name: "Tool the Block", category: "hitting", duration: 6, description: "Hitters aim to use the blocker's hands to score off the block.", beginnerTip: "Use a standing block at first to build confidence.", advancedTip: "Add a double block and require a specific tool zone." },
    { id: uid(), name: "Blocking Footwork", category: "blocking", duration: 6, description: "Work on shuffle-step and crossover footwork to close the block.", beginnerTip: "Walk through the footwork pattern first.", advancedTip: "Add a live setter and require reading the set before moving." },
    { id: uid(), name: "Read and Block", category: "blocking", duration: 8, description: "Blockers read the setter and hitter to time their jump and penetration.", beginnerTip: "Coach calls the set location so blockers can focus on timing.", advancedTip: "Live offense with no call — blockers read on the fly." },
    { id: uid(), name: "Digging Progression", category: "defense", duration: 8, description: "Defensive positioning and platform digging from coach-driven attacks.", beginnerTip: "Coach rolls balls to start — no live swings yet.", advancedTip: "Add a live hitter and require a pass to target after the dig." },
    { id: uid(), name: "Defense Lanes", category: "defense", duration: 8, description: "Back-row players cover their defensive zones during live attacks.", beginnerTip: "Coach hits to one zone at a time.", advancedTip: "Live setter + hitter with full coverage required." },
    { id: uid(), name: "Transition Wash Drill", category: "transition", duration: 10, description: "Offense becomes defense and back again after each rally. Teaches quick transition.", beginnerTip: "Coach initiates each ball to control pace.", advancedTip: "Live play with a point-scoring system." },
    { id: uid(), name: "6-on-6 Scrimmage", category: "transition", duration: 15, description: "Full-court play with rally scoring. Focus on communication and system.", beginnerTip: "Allow free ball initiations to keep rallies alive.", advancedTip: "Play to 25 with rotation enforcement and subs." },
    { id: uid(), name: "Suicide Sprints", category: "conditioning", duration: 5, description: "Sprint to lines and back. Classic volleyball court conditioning.", beginnerTip: "Reduce reps or extend rest between sets.", advancedTip: "Add a dive or roll at each turn." },
    { id: uid(), name: "Plyo Box Jumps", category: "conditioning", duration: 5, description: "Explosive jumps onto a plyo box to build vertical for hitting and blocking.", beginnerTip: "Use a lower box and focus on landing form.", advancedTip: "Add approach jumps or single-leg takeoffs." },
  ];
}
export function defaultWarmups() {
  return [
    { id: uid(), name: "Arm Circles", category: "stretch", duration: 1, description: "Small to large circles forward and backward to loosen the shoulders." },
    { id: uid(), name: "Wrist and Ankle Rolls", category: "stretch", duration: 1, description: "Roll both wrists and ankles in each direction to prep for ball contact and quick movement." },
    { id: uid(), name: "Torso Twists", category: "stretch", duration: 1, description: "Rotate the trunk side to side to warm up the core and lower back." },
    { id: uid(), name: "Standing Hamstring Stretch", category: "stretch", duration: 2, description: "Reach toward the toes with a soft knee to loosen the hamstrings." },
    { id: uid(), name: "Hip Openers", category: "stretch", duration: 2, description: "Deep squat with elbows pressing knees out to open the hips for defensive movement." },
    { id: uid(), name: "High Knees", category: "exercise", duration: 2, description: "Jog in place driving the knees up to raise heart rate." },
    { id: uid(), name: "Butt Kicks", category: "exercise", duration: 2, description: "Jog kicking heels toward the glutes to activate the hamstrings." },
    { id: uid(), name: "Jumping Jacks", category: "exercise", duration: 2, description: "Full-body movement to get blood flowing before drills start." },
    { id: uid(), name: "Lateral Shuffles", category: "exercise", duration: 2, description: "Low, wide shuffles side to side to fire up defensive footwork." },
    { id: uid(), name: "Light Pepper", category: "exercise", duration: 4, description: "Easy pass-set-hit between partners to get a touch on the ball and warm up the shoulders." },
  ];
}

export function categoryAccent(colorKey) {
  if (colorKey === "sage") return C.sage;
  if (colorKey === "amber") return C.amber;
  if (colorKey === "red") return C.red;
  return C.chalkDim;
}

export function VolleyballIcon({ cx, cy, r }) {
  const x0 = cx - r, x1 = cx + r, y0 = cy - r, y1 = cy + r;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#F4F1E8" stroke="#7A3D0F" strokeWidth={r * 0.09} />
      <path d={`M ${x0} ${cy - r * 0.25} Q ${cx + r * 0.1} ${cy - r * 0.55} ${x1} ${cy + r * 0.15}`} fill="none" stroke="#3A1F0A" strokeWidth={r * 0.08} />
      <path d={`M ${x0} ${cy + r * 0.25} Q ${cx + r * 0.1} ${cy + r * 0.55} ${x1} ${cy - r * 0.15}`} fill="none" stroke="#3A1F0A" strokeWidth={r * 0.08} />
      <path d={`M ${cx} ${y0} Q ${cx + r * 0.45} ${cy - r * 0.15} ${cx + r * 0.2} ${y1}`} fill="none" stroke="#3A1F0A" strokeWidth={r * 0.08} />
      <path d={`M ${cx} ${y0} Q ${cx - r * 0.45} ${cy - r * 0.15} ${cx - r * 0.2} ${y1}`} fill="none" stroke="#3A1F0A" strokeWidth={r * 0.08} />
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.4} rx={r * 0.3} ry={r * 0.18} fill="#FFFFFF" opacity="0.22" />
    </g>
  );
}