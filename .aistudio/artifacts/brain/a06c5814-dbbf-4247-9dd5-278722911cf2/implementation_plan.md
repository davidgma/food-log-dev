# Implementation Plan: Automated Daily GitHub Rebuild & Manual Build Guide

Configure GitHub Actions to automatically rebuild and redeploy the food log site every day at 12:00 PM (midday UK / 12:00 UTC) so that new pCloud entries posted daily are automatically parsed into the static site. Also provide instructions on manual triggering.

## User Requirements
- Automatically trigger a GitHub Actions build & deployment every day around midday (12:00 UTC / UK time).
- Provide clear instructions on how to manually trigger the build at any time from GitHub.

## Proposed Changes

### 1. Update GitHub Actions Workflow File (`.github/workflows/deploy.yml`)
Add a `schedule` trigger with a cron schedule `0 12 * * *` (12:00 PM UTC daily) alongside the existing `push` and `workflow_dispatch` triggers:

```yaml
on:
  push:
    branches:
      - main
      - master
  schedule:
    - cron: '0 12 * * *'
  workflow_dispatch:
```

### 2. Manual Build Instructions (Provided in UI & Documentation)
How to trigger a rebuild manually on GitHub:
1. Open your repository on **GitHub.com**.
2. Click the **Actions** tab near the top of the repository page.
3. In the left navigation bar under "Workflows", select **Deploy Food Log to GitHub Pages**.
4. On the right side above the workflow run list, click the **Run workflow** button.
5. Keep the branch as `main` (or `master`) and click the green **Run workflow** button to start an instant rebuild.

## Verification & Testing
1. Update `.github/workflows/deploy.yml`.
2. Verify YAML syntax and workflow validity.
3. Run `compile_applet` and `lint_applet` to ensure codebase integrity.
