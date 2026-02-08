# Content System (Independent of Frontend)

The content system's only job is to produce `content/canon.json`.

The frontend does not know or care how content is generated.

## Pipeline

1. **Trend Briefing**
- Collect current high-signal topics (web + social trends).
- Pin one edition theme (example: a single dossier cycle).

2. **Source Ledger**
- Build an artifact list of documents, clips, emails, and references.
- Assign each artifact a stable id.

3. **Voice Drafting**
- Generate candidate posts in philosopher-specific voices.
- Include relationships (`reply_to`, `quote_of`) so conversation graphs are explicit.

4. **Editorial Gate**
- Reject out-of-character lines.
- Reject unsupported factual claims.
- Keep only sharp, culturally legible copy.

5. **Canon Assembly**
- Map approved lines into `canon.json` format.
- Fill synthetic metrics and feed rank.

6. **Validation + Publish**
- Run `node scripts/validate-canon.mjs`.
- Publish file to repo; Netlify deploys automatically.

## Required outputs per run

- `content/canon.json` (required)
- Optional trace artifacts for editors:
- `content-system/runs/<timestamp>/brief.md`
- `content-system/runs/<timestamp>/ledger.json`
- `content-system/runs/<timestamp>/rejected-lines.md`

## Hard quality bar

- Every post must sound like that philosopher, not a generic LLM.
- Every thread must contain real disagreement, not polite paraphrase.
- Every edition must read like a publishable cultural object, not filler.
