import { CourseSystem, GradeLevel, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Track = "ADV" | "REG" | "DIS" | null;

const courseCatalog = [
  { rawName: "Adv. Expansive English (Adv.)", grade: 12 },
  { rawName: "AP English Literature & Composition (Adv.)", grade: 12 },
  { rawName: "Chinese III (Reg.)", grade: 12 },
  { rawName: "Chinese Strategy (Reg.)", grade: 12 },
  { rawName: "*AP Research (Dis.)", grade: 12 },
  { rawName: "Humanities Labs (Dis.)", grade: 12 },
  { rawName: "Assimilation and Differences Across Societies (Dis.)", grade: 12 },
  { rawName: "Cross-Cultural Philosophy and Ethics (Dis.)", grade: 12 },
  { rawName: "Contemporary China (Dis.)", grade: 12 },
  { rawName: "General Math (Reg.)", grade: 12 },
  { rawName: "AP Calculus AB (Adv.)", grade: 12 },
  { rawName: "AP Statistics (Adv.)", grade: 12 },
  { rawName: "Adv. Linear Algebra and Group Theory (Adv.)", grade: 12 },
  { rawName: "Multivariable Calculus (Adv.)", grade: 12 },
  { rawName: "PE (Reg.)", grade: 12 },
  { rawName: "Career Readiness", grade: 12 },
  { rawName: "AP Cybersecurity (Adv.)", grade: 12 },
  { rawName: "Adv. Further Physics (Adv.)", grade: 12 },
  { rawName: "Adv. Data Analyze in Physics (Adv.)", grade: 12 },
  { rawName: "Adv. Introduction to Modern Astrophysics (Adv.)", grade: 12 },
  { rawName: "AP Chemistry (Adv.)", grade: 12 },
  { rawName: "Adv. Organic Chemistry (Adv.)", grade: 12 },
  { rawName: "Practical & Research Chemistry (Adv.)", grade: 12 },
  { rawName: "Adv. Genetic Analysis (Adv.)", grade: 12 },
  { rawName: "AP Biology (Adv.)", grade: 12 },
  { rawName: "General Biology (Reg.)", grade: 12 },
  { rawName: "AP Environmental Science (Adv.)", grade: 12 },
  { rawName: "AP Macro-Economics (Adv.)", grade: 12 },
  { rawName: "AP Human Geography (Adv.)", grade: 12 },
  { rawName: "History of Ideas: Revolution and Change (Reg.)", grade: 12 },
  { rawName: "Gender Studies (Adv.)", grade: 12 },
  { rawName: "AP European History (Adv.)", grade: 12 },
  { rawName: "The Anthropology of Consumption: Culture, Power, and Transformation (Reg.)", grade: 12 },
  { rawName: "AP Comparative Government & Politics (Adv.)", grade: 12 },
  { rawName: "Introduction to French Language and Culture (Reg.)", grade: 12 },
  { rawName: "Introduction to Japanese Language and Culture (Reg.)", grade: 12 },
  { rawName: "Introduction to Spanish Language and Culture (Reg.)", grade: 12 },
  { rawName: "AP Psychology (Adv.)", grade: 12 },
  { rawName: "Visual Art (Reg.)", grade: 12 },
  { rawName: "Film Production (Reg.)", grade: 12 },
  { rawName: "AP Art History (Adv.)", grade: 12 },
  { rawName: "Architecture Foundation (Reg.)", grade: 12 },
  { rawName: "Advanced Theatre (Reg.)", grade: 12 },
  { rawName: "Music Performance (Reg.)", grade: 12 },
  { rawName: "Adv. English (Adv.)", grade: 11 },
  { rawName: "AP English Language & Composition (Adv.)", grade: 11 },
  { rawName: "Chinese II (Chinese Literature) (Reg.)", grade: 11 },
  { rawName: "AP Seminar (Dis.)", grade: 11 },
  { rawName: "Colloquy (Dis.)", grade: 11 },
  { rawName: "Cross-Cultural Leadership Program (Dis.)", grade: 11 },
  { rawName: "AP Calculus AB (Adv.)", grade: 11 },
  { rawName: "AP Calculus BC (Adv.)", grade: 11 },
  { rawName: "AP Statistics (Adv.)", grade: 11 },
  { rawName: "PE (Reg.)", grade: 11 },
  { rawName: "Career Readiness", grade: 11 },
  { rawName: "AP Physics C: Mechanics (Adv.)", grade: 11 },
  { rawName: "AP Physics C: Electricity & Magnetism (Adv.)", grade: 11 },
  { rawName: "General Chemistry (Reg.)", grade: 11 },
  { rawName: "AP Chemistry (Adv.)", grade: 11 },
  { rawName: "AP Biology (Adv.)", grade: 11 },
  { rawName: "Physiology and Ecology (Reg.)", grade: 11 },
  { rawName: "AP Environmental Science (Adv.)", grade: 11 },
  { rawName: "AP Studio Art (Adv.)", grade: 11 },
  { rawName: "AP Art History (Adv.)", grade: 11 },
  { rawName: "World Theatre Studies (Reg.)", grade: 11 },
  { rawName: "AP Music Theory (Adv.)", grade: 11 },
  { rawName: "United States History II (Reg.)", grade: 11 },
  { rawName: "World History II (Reg.)", grade: 11 },
  { rawName: "AP United States History (Adv.)", grade: 11 },
  { rawName: "AP World History (Adv.)", grade: 11 },
  { rawName: "AP Human Geography (Adv.)", grade: 11 },
  { rawName: "AP European History (Adv.)", grade: 11 },
  { rawName: "AP Computer Science A (Adv.)", grade: 11 },
  { rawName: "Adv. Artificial Intelligence (Adv.)", grade: 11 },
  { rawName: "AP Psychology (Adv.)", grade: 11 },
  { rawName: "AP Comparative Government & Politics (Adv.)", grade: 11 },
  { rawName: "AP Micro-Economics (Adv.)", grade: 11 },
  { rawName: "AP Macro-Economics (Adv.)", grade: 11 },
  { rawName: "Adv. Differential Equations & Graph Theory (Adv.)", grade: 11 },
  { rawName: "AP Physics C: Mechanics (Adv.)", grade: 11 },
  { rawName: "AP Physics C: Electricity & Magnetism (Adv.)", grade: 11 },
  { rawName: "AP Chemistry (Adv.)", grade: 11 },
  { rawName: "AP Biology (Adv.)", grade: 11 },
  { rawName: "AP Environmental Science (Adv.)", grade: 11 },
  { rawName: "College Preparatory English (Reg.)", grade: 10 },
  { rawName: "Pre-AP English (Adv.)", grade: 10 },
  { rawName: "Chinese I (Chinese Literature) (Reg.)", grade: 10 },
  { rawName: "SDP (Dis.)", grade: 10 },
  { rawName: "Colloquy (Dis.)", grade: 10 },
  { rawName: "AP Pre-Calculus (Reg.)", grade: 10 },
  { rawName: "College Algebra (Reg.)", grade: 10 },
  { rawName: "PE (Reg.)", grade: 10 },
  { rawName: "Career Readiness", grade: 10 },
  { rawName: "General Physics (Reg.)", grade: 10 },
  { rawName: "AP Physics 1 (Adv.)", grade: 10 },
  { rawName: "Pre-AP Chemistry (Reg.)", grade: 10 },
  { rawName: "Pre-AP Biology (Reg.)", grade: 10 },
  { rawName: "Art (Reg.)", grade: 10 },
  { rawName: "Drama (Reg.)", grade: 10 },
  { rawName: "Music (Reg.)", grade: 10 },
  { rawName: "U.S. History I (Reg.)", grade: 10 },
  { rawName: "World History I (Reg.)", grade: 10 },
  { rawName: "AP Computer Science Principles (Adv.)", grade: 10 },
  { rawName: "Pre-AP Chemistry (Reg.)", grade: 10 },
  { rawName: "Pre-AP Biology (Reg.)", grade: 10 },
  { rawName: "AP Micro-Economics (Adv.)", grade: 10 },
  { rawName: "Pre-AP Psychology (Reg.)", grade: 10 }
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function extractTrack(rawName: string): Track {
  const match = rawName.match(/\((Adv\.|Reg\.|Dis\.)\)\s*$/);

  if (!match) {
    return null;
  }

  if (match[1] === "Adv.") return "ADV";
  if (match[1] === "Reg.") return "REG";
  return "DIS";
}

function cleanCourseName(rawName: string) {
  return rawName
    .replace(/^\*/, "")
    .replace(/\s+\((Adv\.|Reg\.|Dis\.)\)\s*$/, "")
    .trim();
}

function inferSystem(name: string) {
  if (name.startsWith("AP ") || name.startsWith("Pre-AP ")) {
    return CourseSystem.AP;
  }

  return CourseSystem.GENERAL;
}

function inferSubject(name: string) {
  if (/english/i.test(name)) return "English";
  if (/chinese/i.test(name)) return "Chinese";
  if (/calculus|statistics|algebra|math|pre-calculus/i.test(name)) return "Mathematics";
  if (/physics|astrophysics/i.test(name)) return "Physics";
  if (/chemistry/i.test(name)) return "Chemistry";
  if (/biology|ecology|environmental science|genetic|physiology/i.test(name)) return "Biology";
  if (/computer science|cybersecurity|artificial intelligence/i.test(name)) return "Computer Science";
  if (/economics/i.test(name)) return "Economics";
  if (/psychology/i.test(name)) return "Psychology";
  if (/history|government|geography|china|anthropology|gender studies|philosophy|ethics|societies/i.test(name)) return "Humanities";
  if (/french|japanese|spanish|language and culture/i.test(name)) return "World Languages";
  if (/art|drama|music|theatre|film|architecture/i.test(name)) return "Arts";
  if (/leadership|research|humanities labs|colloquy|sdp/i.test(name)) return "Interdisciplinary Studies";
  if (/pe/i.test(name)) return "Physical Education";
  if (/career readiness/i.test(name)) return "College and Career";
  return "General Studies";
}

function buildDescription(name: string, grade: number, track: Track) {
  const trackLabel =
    track === "ADV" ? "Advanced track." : track === "REG" ? "Regular track." : track === "DIS" ? "Discussion track." : "";

  return `${name} for Grade ${grade} students.${trackLabel ? ` ${trackLabel}` : ""}`;
}

function inferPrerequisites(track: Track, system: CourseSystem) {
  if (system === CourseSystem.AP || track === "ADV") {
    return "Prior coursework or department approval recommended.";
  }

  if (track === "DIS") {
    return "Participation and seminar-style discussion expected.";
  }

  return "None.";
}

function mapGradeLevel(grade: number) {
  if (grade === 10) return GradeLevel.G10;
  if (grade === 11) return GradeLevel.G11;
  return GradeLevel.G12;
}

async function main() {
  const seen = new Set<string>();
  const duplicateKeys: string[] = [];

  const rows = courseCatalog.flatMap(({ rawName, grade }) => {
    const name = cleanCourseName(rawName);
    const key = `${grade}:${name.toLowerCase()}`;

    if (seen.has(key)) {
      duplicateKeys.push(key);
      return [];
    }

    seen.add(key);

    const track = extractTrack(rawName);
    const system = inferSystem(name);
    const slugBase = `${name} grade ${grade}`;

    return [
      {
        slug: slugify(slugBase),
        code: slugify(slugBase).toUpperCase(),
        name,
        subject: inferSubject(name),
        description: buildDescription(name, grade, track),
        gradeLevels: [mapGradeLevel(grade)],
        system,
        prerequisites: inferPrerequisites(track, system)
      }
    ];
  });

  await prisma.course.deleteMany();
  await prisma.course.createMany({ data: rows });

  console.log(`Synced ${rows.length} courses.`);

  if (duplicateKeys.length > 0) {
    console.log(`Skipped ${duplicateKeys.length} duplicate grade/name entries.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
