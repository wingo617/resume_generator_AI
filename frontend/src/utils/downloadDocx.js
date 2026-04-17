import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  LevelFormat, BorderStyle, TabStopType,
} from "docx";

// ─── Colours ──────────────────────────────────────────────────────
const ACCENT = "1E3A5F";   // deep navy – section titles
const RULE   = "CCCCCC";   // light grey – rules
const MUTED  = "666666";   // dates, companies
const BODY   = "222222";   // body text

// ─── Helpers ──────────────────────────────────────────────────────
function rule() {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 1 } },
    children: [],
  });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 240, after: 60 },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 20, color: ACCENT, font: "Calibri", characterSpacing: 60 }),
    ],
  });
}

function spacer(before = 80) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [] });
}

// ─── Main export ──────────────────────────────────────────────────
export async function downloadResumeDocx(resume) {
  const contentWidth = 9360; // US Letter 8.5" − 2×0.75" margins in DXA

  const children = [];

  // ── NAME ──────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({ text: resume.name || "", bold: true, size: 56, color: "111111", font: "Calibri" }),
      ],
    })
  );

  // ── CONTACT LINE ──────────────────────────────────────────────
  const contactParts = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter(Boolean);
  if (contactParts.length) {
    const runs = [];
    contactParts.forEach((part, i) => {
      runs.push(new TextRun({ text: part, size: 18, color: MUTED, font: "Calibri" }));
      if (i < contactParts.length - 1)
        runs.push(new TextRun({ text: "   |   ", size: 18, color: RULE, font: "Calibri" }));
    });
    children.push(new Paragraph({ spacing: { before: 0, after: 120 }, children: runs }));
  }
  children.push(rule());

  // ── SUMMARY ───────────────────────────────────────────────────
  if (resume.summary) {
    children.push(sectionHeading("Professional Summary"), rule());
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 0 },
        children: [new TextRun({ text: resume.summary, size: 20, color: BODY, font: "Calibri" })],
      })
    );
  }

  // ── SKILLS ────────────────────────────────────────────────────
  if (resume.skills) {
    children.push(spacer(200), sectionHeading("Skills"), rule());
    const tech = resume.skills.technical?.join(" · ") || "";
    const soft = resume.skills.soft?.join(" · ") || "";
    if (tech)
      children.push(new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [
          new TextRun({ text: "Technical: ", bold: true, size: 20, color: BODY, font: "Calibri" }),
          new TextRun({ text: tech, size: 20, color: BODY, font: "Calibri" }),
        ],
      }));
    if (soft)
      children.push(new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({ text: "Professional: ", bold: true, size: 20, color: BODY, font: "Calibri" }),
          new TextRun({ text: soft, size: 20, color: BODY, font: "Calibri" }),
        ],
      }));
  }

  // ── EXPERIENCE ────────────────────────────────────────────────
  if (resume.experience?.length) {
    children.push(spacer(200), sectionHeading("Work Experience"), rule());
    resume.experience.forEach((exp, i) => {
      children.push(
        new Paragraph({
          spacing: { before: i === 0 ? 80 : 160, after: 20 },
          tabStops: [{ type: TabStopType.RIGHT, position: contentWidth }],
          children: [
            new TextRun({ text: exp.title || "", bold: true, size: 22, color: "111111", font: "Calibri" }),
            new TextRun({ text: ` · ${exp.company || ""}`, size: 20, color: MUTED, font: "Calibri" }),
            new TextRun({ text: "\t", size: 20, font: "Calibri" }),
            new TextRun({ text: exp.duration || "", size: 18, color: MUTED, italics: true, font: "Calibri" }),
          ],
        })
      );
      (exp.bullets || []).forEach((bullet) => {
        children.push(new Paragraph({
          numbering: { reference: `exp-${i}`, level: 0 },
          spacing: { before: 30, after: 30 },
          children: [new TextRun({ text: bullet, size: 20, color: BODY, font: "Calibri" })],
        }));
      });
    });
  }

  // ── EDUCATION ─────────────────────────────────────────────────
  if (resume.education?.length) {
    children.push(spacer(200), sectionHeading("Education"), rule());
    resume.education.forEach((ed, i) => {
      const right = [ed.year, ed.gpa ? `GPA ${ed.gpa}` : ""].filter(Boolean).join(" · ");
      children.push(new Paragraph({
        spacing: { before: i === 0 ? 80 : 120, after: 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: contentWidth }],
        children: [
          new TextRun({ text: ed.degree || "", bold: true, size: 22, color: "111111", font: "Calibri" }),
          new TextRun({ text: ` · ${ed.school || ""}`, size: 20, color: MUTED, font: "Calibri" }),
          new TextRun({ text: "\t", size: 20, font: "Calibri" }),
          new TextRun({ text: right, size: 18, color: MUTED, italics: true, font: "Calibri" }),
        ],
      }));
    });
  }

  // ── PROJECTS ──────────────────────────────────────────────────
  if (resume.projects?.length) {
    children.push(spacer(200), sectionHeading("Projects"), rule());
    resume.projects.forEach((proj, i) => {
      children.push(new Paragraph({
        spacing: { before: i === 0 ? 80 : 120, after: 20 },
        children: [
          new TextRun({ text: proj.name || "", bold: true, size: 20, color: "111111", font: "Calibri" }),
          ...(proj.tech?.length
            ? [new TextRun({ text: `  —  ${proj.tech.join(", ")}`, size: 18, color: ACCENT, font: "Calibri" })]
            : []),
        ],
      }));
      if (proj.description)
        children.push(new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: proj.description, size: 20, color: MUTED, font: "Calibri" })],
        }));
    });
  }

  // ── CERTIFICATIONS ────────────────────────────────────────────
  if (resume.certifications?.length) {
    children.push(spacer(200), sectionHeading("Certifications"), rule());
    resume.certifications.forEach((cert) => {
      children.push(new Paragraph({
        numbering: { reference: "certs", level: 0 },
        spacing: { before: 30, after: 30 },
        children: [new TextRun({ text: cert, size: 20, color: BODY, font: "Calibri" })],
      }));
    });
  }

  // ── BUILD DOCUMENT ────────────────────────────────────────────
  // One bullet config per experience entry + one for certs
  const bulletConfigs = [
    ...((resume.experience || []).map((_, i) => ({
      reference: `exp-${i}`,
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2022",   // only allowed inside numbering config text, not in Paragraph
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } } },
      }],
    }))),
    {
      reference: "certs",
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } } },
      }],
    },
  ];

  const doc = new Document({
    numbering: { config: bulletConfigs },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },                           // US Letter
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },   // 0.75" margins
        },
      },
      children,
    }],
  });

  // ── TRIGGER DOWNLOAD ──────────────────────────────────────────
  const blob     = await Packer.toBlob(doc);
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement("a");
  a.href         = url;
  a.download     = `${(resume.name || "resume").replace(/\s+/g, "_")}_resume.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
