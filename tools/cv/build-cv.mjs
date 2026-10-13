// Generates the public, sanitised CV PDFs (no birth date, nationality, marital status, phone or street address).
// Usage: npm run cv   → public/cv/Nawar_Meree_Lebenslauf.pdf + public/cv/Nawar_Meree_CV.pdf
// Needs Microsoft Edge or Google Chrome installed (headless print-to-PDF).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CONTACT, SITE } from '../../src/content.js';
import { escapeHtml as e } from '../../src/render.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../../public/cv');

const CV = {
  de: {
    file: 'Nawar_Meree_Lebenslauf.pdf',
    title: 'Lebenslauf',
    role: 'Systemadministrator · IT-Infrastruktur · SaaS-Entwicklung',
    location: 'Leverkusen, Deutschland',
    h: { profile: 'Profil', exp: 'Berufserfahrung & Projekte', edu: 'Ausbildung', skills: 'Technische Fähigkeiten', langs: 'Sprachen' },
    profile: 'Systemadministrator mit über 4 Jahren Erfahrung im Aufbau, Betrieb und der Absicherung von IT-Infrastrukturen in einem Industrieunternehmen mit 1.200 Mitarbeitenden. Starke Kenntnisse in Windows Server, Netzwerken (MikroTik, Huawei), FortiGate-Firewall sowie Backup- und Recovery-Lösungen. Entwickelt heute zusätzlich mandantenfähige SaaS-Plattformen und KI-Anwendungen. Strukturierte Arbeitsweise, schnelle Auffassungsgabe, hohe Serviceorientierung.',
    exp: [
      {
        t: 'Cobra SaaS – Mandantenfähige SaaS-Plattform', w: 'Eigenes Produkt', d: '',
        p: [
          'Zwei Produkte auf gemeinsamem Kernel: Cobra Commerce (ERP + Kasse) und Cobra Beauty (CRM)',
          'Offline-first Electron-Apps mit bidirektionaler Cloud-Synchronisation',
          'PostgreSQL Row-Level Security, Gerätelizenzierung, LAN-Sync, verschlüsselte Offsite-Backups',
          'TypeScript · React · Electron · Express · Prisma · PostgreSQL · SQLite',
        ],
      },
      {
        t: 'LexAI – KI-gestützter Rechtsdokument-Assistent', w: 'Projekt · github.com/nowarmerey/pdf-rag-agent', d: '',
        p: [
          'SaaS-Plattform mit RAG-Architektur und Vektordatenbank (Supabase pgvector) für semantische Suche',
          'Multi-Format-Verarbeitung (PDF, Word, Bilder) mit der Gemini Vision API',
          'Multi-Tenant-System mit JWT-Authentifizierung, zweisprachige UI (DE/EN), Deployment auf Railway',
          'Python · FastAPI · PostgreSQL · Google Gemini',
        ],
      },
      {
        t: 'Praktikum IT-Support', w: 'Berger IT Services, Lahr', d: '08.12.2025 – 12.12.2025',
        p: [
          'Technischer Support für Endanwender per Telefon und Remote',
          'Mitarbeit bei der Einrichtung von Microsoft 365 und Cloud-Lösungen für ein Ingenieurbüro',
          'Konfiguration von Antivirus-Software und Cloud-Backup',
          'Unterstützung beim Umzug der IT-Infrastruktur einer Kindergartenverwaltung',
        ],
      },
      {
        t: 'Systemadministrator', w: 'Sada, Homs (Syrien) · Chemiedüngerwerk, 1.200 Mitarbeitende', d: '02/2021 – 08/2025',
        p: [
          'Mitwirkung am Aufbau der vollständigen IT-Infrastruktur: Netzwerk, WLAN und Serverräume über 4 Etagen',
          'Installation und Konfiguration von ca. 250 PCs, 100 Druckern, IP-Telefonen sowie MikroTik- & Huawei-Netzwerkkomponenten',
          'Aufbau und Verwaltung von Windows-Servern (inkl. File Server) in vier Serverräumen',
          'Sicherheitsmaßnahmen: FortiGate-Firewall, Backup & Recovery; Monitoring mit Zabbix',
          'Helpdesk & Remote-Support für ca. 400 Mitarbeitende; ZKTeco-Zeiterfassungssystem',
          'Automatisierung von Verwaltungs- und Gehaltsprozessen mit VBA – über 60 % weniger Bearbeitungszeit',
          'Systemupdates, Migrationen, Leistungsoptimierung und technische Dokumentation',
        ],
      },
    ],
    edu: [
      { t: 'Bachelor of Engineering, Informatik-Ingenieurwesen', w: 'Albaath Universität, Homs · Softwaretechnik und Informationssysteme · 5-jähriges Studium', d: '2019' },
      { t: 'Zeugnisbewertung der ZAB (KMK)', w: 'Reg.-Nr. LN2024/1318-1', d: '2024' },
    ],
    skills: [
      ['Betriebssysteme', 'Windows Server, Linux (Grundkenntnisse)'],
      ['Netzwerke & Sicherheit', 'LAN/WAN, MikroTik, Huawei, FortiGate, Active Directory, Group Policy'],
      ['Server & Infrastruktur', 'File Server, Backup & Recovery, Systemmigration, Zabbix'],
      ['IT-Support', 'Helpdesk, Remote-Support, Microsoft 365, Drucker & IP-Telefonie'],
      ['Entwicklung', 'TypeScript, JavaScript, React, Electron, Python, FastAPI, PostgreSQL, VBA'],
    ],
    langs: 'Arabisch (Muttersprache) · Deutsch (B2) · Englisch (B2)',
  },
  en: {
    file: 'Nawar_Meree_CV.pdf',
    title: 'Curriculum Vitae',
    role: 'System Administrator · IT Infrastructure · SaaS Development',
    location: 'Leverkusen, Germany',
    h: { profile: 'Profile', exp: 'Experience & projects', edu: 'Education', skills: 'Technical skills', langs: 'Languages' },
    profile: 'System administrator with 4+ years of experience building, running and securing the IT infrastructure of an industrial company with 1,200 employees. Strong skills in Windows Server, networking (MikroTik, Huawei), FortiGate firewalls and backup & recovery. Today also builds multi-tenant SaaS platforms and AI applications. Structured, fast learner, service-minded.',
    exp: [
      {
        t: 'Cobra SaaS – multi-tenant SaaS platform', w: 'Own product', d: '',
        p: [
          'Two products on a shared kernel: Cobra Commerce (ERP + point of sale) and Cobra Beauty (CRM)',
          'Offline-first Electron apps with bidirectional cloud sync',
          'PostgreSQL Row-Level Security, device licensing, LAN sync, encrypted offsite backups',
          'TypeScript · React · Electron · Express · Prisma · PostgreSQL · SQLite',
        ],
      },
      {
        t: 'LexAI – AI legal-document assistant', w: 'Project · github.com/nowarmerey/pdf-rag-agent', d: '',
        p: [
          'SaaS platform with a RAG architecture and vector database (Supabase pgvector) for semantic search',
          'Multi-format processing (PDF, Word, images) with the Gemini Vision API',
          'Multi-tenant system with JWT authentication, bilingual UI (DE/EN), deployed on Railway',
          'Python · FastAPI · PostgreSQL · Google Gemini',
        ],
      },
      {
        t: 'IT support internship', w: 'Berger IT Services, Lahr', d: '08 Dec 2025 – 12 Dec 2025',
        p: [
          'End-user support by phone and remote',
          'Helped set up Microsoft 365 and cloud solutions for an engineering office',
          'Configured antivirus software and cloud backup',
          'Supported the IT relocation of a kindergarten administration',
        ],
      },
      {
        t: 'System Administrator', w: 'Sada, Homs (Syria) · chemical fertilizer plant, 1,200 employees', d: '02/2021 – 08/2025',
        p: [
          'Helped build the complete IT infrastructure: network, WiFi and server rooms across 4 floors',
          'Installed and configured ~250 PCs, 100 printers, IP phones and MikroTik & Huawei network equipment',
          'Built and administered Windows Servers (incl. file servers) in four server rooms',
          'Security: FortiGate firewall, backup & recovery; monitoring with Zabbix',
          'Helpdesk & remote support for ~400 staff; ZKTeco attendance system',
          'Automated admin and payroll processes with VBA – processing time cut by more than 60%',
          'System updates, migrations, performance tuning and technical documentation',
        ],
      },
    ],
    edu: [
      { t: 'Bachelor of Engineering, Computer Engineering', w: 'Al-Baath University, Homs · Software Engineering & Information Systems · 5-year program', d: '2019' },
      { t: 'Degree evaluation by the ZAB (KMK), Germany', w: 'Reg.-No. LN2024/1318-1', d: '2024' },
    ],
    skills: [
      ['Operating systems', 'Windows Server, Linux (basics)'],
      ['Networking & security', 'LAN/WAN, MikroTik, Huawei, FortiGate, Active Directory, Group Policy'],
      ['Servers & infrastructure', 'File servers, backup & recovery, system migration, Zabbix'],
      ['IT support', 'Helpdesk, remote support, Microsoft 365, printers & IP telephony'],
      ['Development', 'TypeScript, JavaScript, React, Electron, Python, FastAPI, PostgreSQL, VBA'],
    ],
    langs: 'Arabic (native) · German (B2) · English (B2)',
  },
};

const html = (c, lang) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8" /><title>Nawar Meree — ${e(c.title)}</title>
<style>
  @page { size: A4; margin: 16mm 16mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 9.6pt/1.45 'Segoe UI', Arial, sans-serif; color: #1b1f27; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5pt solid #0f9d63; padding-bottom: 8pt; }
  h1 { font-size: 22pt; margin: 0; letter-spacing: -0.02em; }
  .role { color: #0f7a4d; font-weight: 600; margin-top: 2pt; }
  .contact { text-align: right; font-size: 8.6pt; color: #4a5160; line-height: 1.55; }
  .contact a { color: inherit; text-decoration: none; }
  h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.08em; color: #0f7a4d; margin: 13pt 0 5pt; }
  .item { margin-bottom: 8pt; break-inside: avoid; }
  .row { display: flex; justify-content: space-between; gap: 12pt; }
  .row b { font-size: 10pt; }
  .date { color: #4a5160; white-space: nowrap; font-size: 8.8pt; }
  .where { color: #4a5160; font-size: 8.8pt; }
  ul { margin: 3pt 0 0; padding-left: 13pt; }
  li { margin: 1pt 0; }
  table { border-collapse: collapse; width: 100%; }
  td { padding: 2pt 0; vertical-align: top; }
  td:first-child { width: 34%; font-weight: 600; padding-right: 8pt; }
  p { margin: 0; }
</style></head><body>
<header>
  <div><h1>Nawar Meree</h1><div class="role">${e(c.role)}</div></div>
  <div class="contact">${e(c.location)}<br /><a href="mailto:${e(CONTACT.email)}">${e(CONTACT.email)}</a><br />
    <a href="${e(SITE)}">nawarmeree.com</a><br /><a href="${e(CONTACT.linkedin)}">linkedin.com/in/nawar-meree-036491164</a><br />
    <a href="${e(CONTACT.github)}">github.com/nowarmerey</a></div>
</header>
<h2>${e(c.h.profile)}</h2><p>${e(c.profile)}</p>
<h2>${e(c.h.exp)}</h2>
${c.exp.map((x) => `<div class="item"><div class="row"><b>${e(x.t)}</b><span class="date">${e(x.d)}</span></div>
<div class="where">${e(x.w)}</div><ul>${x.p.map((p) => `<li>${e(p)}</li>`).join('')}</ul></div>`).join('')}
<h2>${e(c.h.edu)}</h2>
${c.edu.map((x) => `<div class="item"><div class="row"><b>${e(x.t)}</b><span class="date">${e(x.d)}</span></div><div class="where">${e(x.w)}</div></div>`).join('')}
<h2>${e(c.h.skills)}</h2>
<table>${c.skills.map(([k, v]) => `<tr><td>${e(k)}</td><td>${e(v)}</td></tr>`).join('')}</table>
<h2>${e(c.h.langs)}</h2><p>${e(c.langs)}</p>
</body></html>`;

const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const browser = BROWSERS.find((b) => fs.existsSync(b));
if (!browser) throw new Error('No Edge/Chrome found for PDF printing');

fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-'));
for (const [lang, c] of Object.entries(CV)) {
  const src = path.join(tmp, `${lang}.html`);
  fs.writeFileSync(src, html(c, lang));
  const out = path.join(outDir, c.file);
  execFileSync(browser, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--user-data-dir=${path.join(tmp, 'profile')}`,
    `--print-to-pdf=${out}`, `file:///${src.replace(/\\/g, '/')}`], { stdio: 'ignore' });
  console.log(`✓ ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
}
fs.rmSync(tmp, { recursive: true, force: true });
