/**
 * Minimal in-browser PDF generator.
 *
 * Produces a valid single-page PDF/1.4 file using nothing but string
 * concatenation + TextEncoder. No external libraries, no server round-trip —
 * great for demos where a real download beats a "preparing…" toast.
 *
 * The text is restricted to the Helvetica / WinAnsi glyph set (basic Latin);
 * non-printable or multibyte chars are stripped so byte offsets in the PDF
 * xref table always match the encoded payload.
 */

const PAGE_WIDTH = 612; // US Letter, 72 dpi
const PAGE_HEIGHT = 792;
const MARGIN_X = 54;
const TITLE_SIZE = 22;
const BODY_SIZE = 11;
const LINE_HEIGHT = 15;
const WRAP_COLS = 86;

function escapePdfText(raw) {
  return String(raw ?? "")
    // Strip non-Latin1 printable chars. Keeps the byte/char mapping 1:1 so
    // the offsets we write into the xref table stay accurate.
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLines(text, cols = WRAP_COLS) {
  const paragraphs = String(text ?? "").split(/\r?\n/);
  const out = [];
  for (const para of paragraphs) {
    if (!para.trim()) {
      out.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length <= cols) {
        line = candidate;
      } else {
        if (line) out.push(line);
        // very long token: hard-split
        if (word.length > cols) {
          for (let i = 0; i < word.length; i += cols) {
            out.push(word.slice(i, i + cols));
          }
          line = "";
        } else {
          line = word;
        }
      }
    }
    if (line) out.push(line);
  }
  return out;
}

/**
 * @param {{ title: string, subtitle?: string, body?: string, footer?: string }} opts
 * @returns {string} UTF-8-safe PDF body
 */
function buildPdf(opts) {
  const title = escapePdfText(opts.title || "Document");
  const subtitle = opts.subtitle ? escapePdfText(opts.subtitle) : "";
  const footer = opts.footer ? escapePdfText(opts.footer) : "";
  const bodyLines = wrapLines(opts.body || "").map(escapePdfText);

  const topY = PAGE_HEIGHT - 90;
  let stream = "BT\n";
  stream += `/F1 ${TITLE_SIZE} Tf\n`;
  stream += `${MARGIN_X} ${topY} Td\n`;
  stream += `(${title}) Tj\n`;

  if (subtitle) {
    stream += "0 -24 Td\n";
    stream += "/F1 12 Tf\n";
    stream += `(${subtitle}) Tj\n`;
    stream += `0 -${LINE_HEIGHT + 4} Td\n`;
  } else {
    stream += `0 -${LINE_HEIGHT + 12} Td\n`;
  }

  stream += `/F1 ${BODY_SIZE} Tf\n`;
  stream += `${LINE_HEIGHT} TL\n`;
  for (let i = 0; i < bodyLines.length; i += 1) {
    const line = bodyLines[i];
    if (i === 0) {
      stream += `(${line}) Tj\n`;
    } else {
      stream += line ? `T* (${line}) Tj\n` : "T*\n";
    }
  }

  if (footer) {
    stream += "ET\n";
    stream += "BT\n";
    stream += "/F1 9 Tf\n";
    stream += `${MARGIN_X} 54 Td\n`;
    stream += `(${footer}) Tj\n`;
  }

  stream += "ET";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];

  let buffer = "%PDF-1.4\n";
  const offsets = [];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(buffer.length);
    buffer += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = buffer.length;
  buffer += `xref\n0 ${objects.length + 1}\n`;
  buffer += "0000000000 65535 f \n";
  for (const off of offsets) {
    buffer += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  buffer += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  buffer += `startxref\n${xrefOffset}\n%%EOF`;

  return buffer;
}

function sanitizeFilename(name) {
  return String(name || "document")
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g, " ")
    .trim()
    .slice(0, 120) || "document";
}

/**
 * Triggers a real browser download of a minimal PDF with the given content.
 * Safe to call from any user-initiated event (click, action menu pick).
 *
 * @param {{
 *   filename: string,
 *   title: string,
 *   subtitle?: string,
 *   body?: string,
 *   footer?: string,
 * }} opts
 */
export function downloadPdf(opts) {
  const pdf = buildPdf(opts);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const name = sanitizeFilename(opts.filename);
  a.href = url;
  a.download = name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
