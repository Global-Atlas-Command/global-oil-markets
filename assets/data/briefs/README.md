# Global Oil Markets Automated Brief Feed

This package replaces the current placeholder `GOM Daily Update` workflow with a real research-to-publication pipeline.

Pipeline: Research → structured generation → validation → dated archive → `latest.json` → Git commit.

## One-time setup
1. Copy these files into `Global-Atlas-Command/global-oil-markets` using the same paths.
2. Remove or disable the old `.github/workflows/gom.yml` placeholder workflow.
3. GitHub → Repository Settings → Secrets and variables → Actions → New repository secret.
4. Add `OPENAI_API_KEY`.
5. Actions → GOM Automated Daily Brief → Run workflow.
6. Verify `assets/data/briefs/YYYY-MM-DD.json` and `latest.json` are created.

## Important
The current repository workflow writes fixed statements such as “Brent-WTI remains wide” and “ARA stable with no visible pressure.” Those are placeholder statements, not live research, and should not be used as the production intelligence feed.

## Website feed
Read `/assets/data/briefs/latest.json`. Dated files form the archive.

Never place the API key in source code.

## Optional production deployment (replaces manual FileZilla for the brief feed)

Add these repository secrets if you want the workflow to upload the brief JSON directly to the live hosting account after each run:

- `FTP_HOST` — e.g. the hosting FTP hostname.
- `FTP_USERNAME` — dedicated deployment FTP user.
- `FTP_PASSWORD` — FTP password.
- `FTP_REMOTE_BRIEF_DIR` — remote directory that corresponds to `/assets/data/briefs`.
- `GOM_BRIEF_PUBLIC_URL` — public URL of `latest.json`, used for post-deploy verification.

If these are not configured, the workflow still generates, validates, archives, and commits the brief to GitHub; FTP deployment and live verification are skipped safely.
