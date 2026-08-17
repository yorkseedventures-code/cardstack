export const CONTACT_COLORS = [
  { id: "grey", label: "Default", bg: "#f5f3f0", strip: "#c8c0b8" },
  { id: "purple", label: "Purple", bg: "#f0e6ff", strip: "#9333ea" },
  { id: "pink", label: "Pink", bg: "#fce7f3", strip: "#ec4899" },
  { id: "blue", label: "Blue", bg: "#dbeafe", strip: "#3b82f6" },
  { id: "green", label: "Green", bg: "#dcfce7", strip: "#22c55e" },
  { id: "yellow", label: "Yellow", bg: "#fef9c3", strip: "#eab308" },
  { id: "red", label: "Red", bg: "#fee2e2", strip: "#ef4444" },
];

export function getColor(id: string) {
  return CONTACT_COLORS.find(c => c.id === id) || CONTACT_COLORS[0];
}
