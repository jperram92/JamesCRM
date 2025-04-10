# Branch Protection Setup for JamesCRM

Since GitHub doesn't allow users to approve their own pull requests (even repository owners), we need to set up branch protection rules directly in the GitHub repository settings.

## Setting Up Branch Protection Rules

1. Go to your repository on GitHub: https://github.com/jperram92/JamesCRM
2. Navigate to Settings > Branches (in the left sidebar)
3. Under "Branch protection rules", click "Add rule"
4. In the "Branch name pattern" field, enter `master`
5. Configure the following settings:

### Required Settings:
- ✅ Require a pull request before merging
  - ❌ Do NOT check "Require approvals" (this would prevent you from merging your own PRs)
- ✅ Require status checks to pass before merging
  - Search for and select the status checks from your GitHub Actions workflows:
    - `lint` (from the CI/CD workflow)
    - `test` (from the CI/CD workflow)
    - `auto-approve-owner` (from the branch protection workflow)
- ✅ Require branches to be up to date before merging

### Optional Settings (Recommended):
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

6. Click "Create" to save the branch protection rule

## How This Works

With these settings:
1. All changes to the `master` branch must be made through pull requests
2. Your GitHub Actions workflows will run to verify code quality
3. For PRs created by you (jperram92), the branch protection workflow will automatically pass
4. For PRs created by other contributors, the branch protection workflow will fail until you approve the PR
5. You can merge your own PRs without needing approval (since we didn't check "Require approvals")

## Workflow Files

The repository includes two GitHub Actions workflow files:

1. `.github/workflows/main.yml` - Runs linting, tests, and builds
2. `.github/workflows/branch-protection.yml` - Checks PR authorship and approvals

These workflows work together with the GitHub branch protection rules to ensure code quality and maintain control over what gets merged into the `master` branch.
