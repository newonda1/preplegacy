import { getSchoolSlug } from "./getSchoolSlug.js";

export async function getCurrentSchool() {
  const slug = getSchoolSlug();

  if (!slug) {
    throw new Error("No school slug found in URL.");
  }

  const response = await fetch("/data/schools.json");

  if (!response.ok) {
    throw new Error("Could not load schools registry.");
  }

  const schools = await response.json();
  const school = schools.find((entry) => entry.slug === slug);

  if (!school) {
    throw new Error(`No school found for slug: ${slug}`);
  }

  return school;
}
