export function applySchoolBranding(school) {
  if (!school || !school.colors) {
    throw new Error("School branding data is missing.");
  }

  const root = document.documentElement;

  root.style.setProperty("--school-primary", school.colors.primary || "#003A8F");
  root.style.setProperty("--school-secondary", school.colors.secondary || "#FFFFFF");
  root.style.setProperty("--school-accent", school.colors.accent || "#000000");
  root.style.setProperty("--school-neutral", school.colors.neutral || "#6B7280");

  document.title = `${school.name} | PrepLegacy`;
}
