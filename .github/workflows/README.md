# GitHub Actions Workflows for JamesCRM

This directory contains GitHub Actions workflow configurations for the JamesCRM project.

## Workflows

### 1. Main CI/CD Pipeline (`main.yml`)

This workflow handles the continuous integration and deployment pipeline for the JamesCRM application.

**Triggered by:**
- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Jobs:**
- **Lint**: Checks code quality using ESLint
- **Test**: Runs automated tests for both client and server
- **Build**: Creates production builds of the application

### 2. Branch Protection (`branch-protection.yml`)

This workflow enforces branch protection rules for the `main` branch.

**Triggered by:**
- Pull requests to the `main` branch

**Protection Rules:**
- Requires approval from GitHub user `jperram92` before merging
- Blocks merging if the required approval is not present

## How Branch Protection Works

1. When a pull request is opened against the `main` branch, the `branch-protection.yml` workflow runs
2. The workflow checks if the PR has been approved by `jperram92`
3. If not approved, the workflow will fail, preventing the PR from being merged
4. Once `jperram92` approves the PR, the workflow will pass, allowing the PR to be merged

## Testing the Workflows

You can run tests for these workflows using:

```bash
npm run test:github-actions
```

These tests verify that:
- The workflow files exist
- The YAML is valid
- The workflows contain the expected jobs and configurations

## Additional Configuration

For complete branch protection, you should also configure the repository settings in GitHub:

1. Go to the repository on GitHub
2. Navigate to Settings > Branches
3. Add a branch protection rule for `main`:
   - Require pull requests before merging
   - Require status checks to pass before merging
   - Require conversation resolution before merging
   - Include administrators in these restrictions
