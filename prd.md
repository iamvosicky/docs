# Product Requirements Document (PRD)

**Project:** Automated Contract Generation Platform **Date:** 5 May 2025**Author:** ChatGPT draft — to be refined with the team

---

## 1 ⭐️ Purpose

Build a self‑service web application that lets authenticated users generate customized legal documents (e.g. *Smlouva o dílo*, DPP, Kupní smlouva) in **.docx** and **.pdf** formats by filling in variable data (name, address, IČO, bank account …).

---

## 2 🎯 Goals & Non‑Goals

| Goals (MVP)                                                         | Non‑Goals (v1)                 |
| ------------------------------------------------------------------- | ------------------------------ |
| 🔹 Secure login (SSO / email link).                                 | Electronic signatures (PAdES). |
| 🔹 Browse & select predefined templates.                            | Multi‑language UI.             |
| 🔹 Dynamic form auto‑generated from template‑schema.                | Complex workflow approvals.    |
| 🔹 Generate DOCX locally in Worker and PDF via self‑hosted service. | In‑browser document editing.   |
| 🔹 Admin dashboard for template & user management.                  | Mobile app.                    |
| 🔹 Cloudflare‑native stack (Pages, Workers, R2, D1).                | Support for non‑DOCX sources.  |

---

## 4 📝 User Stories (high‑level)

1. **User** logs in, chooses a contract type, fills in a short form, clicks *Generate* → receives DOCX & PDF download links.
2. **Admin** uploads a new DOCX template with placeholders, defines its JSON schema, enables it for users.
3. **Admin** views audit log of generated files and deletes any erroneously generated output.

---

## 5 🏗️ Architecture Overview

```
┌──────────────┐   HTTPS    ┌──────────────────────┐
│   Browser    │◀──────────▶  Cloudflare  Pages   │  (Next.js + React + TS + Tailwind 4 + shadcn/ui)
└──────────────┘            └────────┬────────────┘
                                      │ REST/JSON
                                      ▼
                           ┌─────────────────────┐   R2 (object store)
                           │  Cloudflare Worker  │◀─────────────────┐
                           │  TypeScript/Miniflare│                 │
                           └────────┬────────────┘                 │
                                    │ Queue msg (PDF)
                                    ▼                              │
                           ┌─────────────────────┐                 │
                           │  PDF Service (Fly)  │─LibreOffice─────┘
                           │  Docker, `libreoffice` headless        
                           └─────────────────────┘
```

**Data store:** D1 (SQLite) — tables *Users, Templates, Files, AuditLog, QueueJobs*.

---

## 6 💻 Frontend Requirements

### 6.1 Tech Stack

- **Next.js 15 / React 19** on Cloudflare Pages.
- **TypeScript** everywhere.
- **Tailwind CSS v4** for utility‑first styling; configured in `/tailwind.config.ts`.
- **shadcn/ui** component library for accessible, themeable primitives.
- Form management: *react‑hook‑form* + *zod* for schema validation.

### 6.2 UI & UX Principles

- Responsive (≥320 px).
- Dark‑mode ready via Tailwind `dark:` variants.
- Consistent spacing (`8 px` base).
- Animations via **Framer Motion** (fade/slide on modal & toast).
- Text hierarchy: `text‑2xl`/`xl`/`base`/`sm`.

### 6.3 Page Map

| Route                  | Component                 | Notes                                    |
| ---------------------- | ------------------------- | ---------------------------------------- |
| `/login`               | `<SignIn />`              | Magic‑link or SSO via Cloudflare Access. |
| `/`                    | `<TemplateCatalog />`     | Cards with template thumbnails & tags.   |
| `/template/[id]`       | `<DynamicForm />`         | Auto‑generated inputs from JSON schema.  |
| `/dashboard`           | `<AdminLayout>`           | Protected route (role = admin).          |
| `/dashboard/templates` | `<TemplateTable />`       | CRUD, versioning, upload DOCX.           |
| `/dashboard/files`     | `<GeneratedFilesTable />` | Search, revoke link.                     |
| `/dashboard/users`     | `<UserManagement />`      | Invite/disable users.                    |
| `/dashboard/logs`      | `<AuditLog />`            | Read‑only list, filter by date/user.     |

---

## 7 🔙 Backend Requirements (Cloudflare Worker)

- **Language:** TypeScript, targeting Workers API (`fetch`, `R2`, `D1`, CF Queues).

- **Endpoints**

  | Method   | Path                        | Auth  | Description                                |
  | -------- | --------------------------- | ----- | ------------------------------------------ |
  | `GET`    | `/api/templates`            | user  | List available templates (metadata only).  |
  | `POST`   | `/api/generate/:templateId` | user  | Accept JSON payload → returns signed URLs. |
  | `POST`   | `/api/templates`            | admin | Upload/replace DOCX template.              |
  | `DELETE` | `/api/files/:id`            | admin | Remove generated file from R2.             |

- **DOCX Generation**: `docxtemplater` (bundled via `esm‑sh`).

- **Queue to PDF Service**: write message `{fileId, docxUrl}` to CF Queues.

- **Rate limiting**: `10 req/min` per user via Worker KV.

### 7.1 Data Model (D1)

```sql
CREATE TABLE Users(
  id TEXT PRIMARY KEY, email TEXT UNIQUE, role TEXT, created_at TIMESTAMP);
CREATE TABLE Templates(
  id TEXT PRIMARY KEY, name TEXT, version TEXT, schema_json TEXT, r2_key TEXT, created_at TIMESTAMP);
CREATE TABLE Files(
  id TEXT PRIMARY KEY, template_id TEXT, user_id TEXT, docx_key TEXT, pdf_key TEXT NULL,
  created_at TIMESTAMP, FOREIGN KEY(template_id) REFERENCES Templates(id));
CREATE TABLE AuditLog(
  id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT, action TEXT, obj_id TEXT, ts TIMESTAMP);
```

---

## 8 🖨️ Self‑hosted PDF Service

- **Runtime:** Docker container deployed to Fly.io (or OCI host).
- **Image:** `libreoffice:7.6` slim + Node script reading Queue messages.
- **Flow:**
  1. Downloads DOCX from R2 via signed URL.
  2. Runs `libreoffice --headless --convert-to pdf`.
  3. Uploads PDF back to R2 → updates record in D1.
  4. Emits success/failure event to Queue.

---

## 9 🔒 Security & Compliance

- All traffic over **HTTPS**.
- **JWT** in CF Access cookie; role claim determines admin.
- R2 objects encrypted at rest; signed URLs expire ⩽24 h.
- Full **audit trail** of template & file actions (GDPR).
- **OWASP** headers via Worker middleware.

---

## 10 🚀 Dev + Ops

| Area          | Tooling                                              |
| ------------- | ---------------------------------------------------- |
| Repo          | GitHub — trunk‑based flow (`main`, PRs).             |
| CI            | GitHub Actions → `wrangler deploy` to Pages/Workers. |
| Lint / Format | ESLint, Prettier, Stylelint for Tailwind.            |
| Testing       | Vitest (unit), Playwright (e2e).                     |
| Monitoring    | Cloudflare Analytics (Workers traces), Sentry.       |
| Secrets       | `wrangler.toml [vars]` + GitHub Secrets.             |

---

## 12 ✅ Acceptance Criteria (MVP)

1. User can generate and download both DOCX & PDF within 60 s.
2. All variable fields in provided templates are substituted correctly.
3. Admin can upload new version of a template without downtime.
4. System logs who generated what & when.
5. Codebase passes CI, unit tests > 95 %.

---

## 13 📎 Appendix

### 13.1 Placeholder Naming Convention

`{{ENTITY_PREFIX_FIELD}}` — uppercase, ASCII, underscores between tokens.Example: `{{KUP_JMENO}}`, `{{OBJ_ICO}}`.

### 13.2 Existing DOCX Templates

| File                                     | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `smlouva_o_dilo_template.docx`           | B2B Smlouva o dílo (vzor).               |
| `dohoda_o_provedeni_prace_template.docx` | DPP (zaměstnanec ≤300 hod/rok).          |
| `kupni_smlouva_template.docx`            | Standardní kupní smlouva na movitou věc. |

---

> **Next actions**: Review this PRD, comment inline, and confirm the milestone dates.
