# Setting Up Required Status Checks

This document explains how to configure required status checks for branch protection.

## Understanding Status Check Names

GitHub uses **job names** from workflows as status check names, not workflow names.

### Available Status Checks from This Repository

#### From Code Quality Workflow (`code-quality.yml`)
- `🔍 Lint & Validate`

#### From E2E Tests Workflow (`playwright-tests.yml`)
- `🔥 Smoke Tests (chromium)`
- `🔥 Smoke Tests (firefox)`
- `🔥 Smoke Tests (webkit)`
- `🎯 Full Test Suite (chromium)`
- `🎯 Full Test Suite (firefox)`
- `🎯 Full Test Suite (webkit)`
- `📱 Mobile Tests (mobile-chrome)`
- `📱 Mobile Tests (Mobile Safari)`

#### External Service
- `Cursor Bugbot` (already configured)

## How to Add Status Checks

1. **First Requirement**: Status checks only appear after running at least once on a pull request
2. **Location**: GitHub → Repository Settings → Branches → Branch protection rules
3. **Search**: After workflows run on a PR, use the "+ Add checks" button
4. **Select**: Choose the job names you want to require

## Recommended Required Checks

For optimal protection, require:
- ✅ `Cursor Bugbot`
- ✅ `🔍 Lint & Validate` (Code Quality)
- ✅ `🔥 Smoke Tests (chromium)` (Fast feedback on critical tests)

## Notes

- You don't need to require ALL browser combinations unless necessary
- Smoke tests provide fast feedback (~2-3 minutes)
- Full tests are comprehensive but slower (~30 minutes)
- Consider your merge frequency when choosing which checks to require

