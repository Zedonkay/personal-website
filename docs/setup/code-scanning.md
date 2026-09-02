# Code Scanning Setup

This repository includes a CodeQL workflow (`.github/workflows/codeql.yml`) for automated security analysis. To use this workflow, you need to enable code scanning in the repository settings.

## Prerequisites

- For **public repositories**: GitHub Code Security is available by default
- For **private repositories**: Requires GitHub Team or Enterprise with GitHub Advanced Security

## Enabling Code Scanning

Follow these steps to enable code scanning for this repository:

1. Navigate to the repository on GitHub
2. Click on **Settings**
3. In the left sidebar, under "Security", click **Code security and analysis**
4. Scroll down to "Code scanning"
5. Click **Set up** next to "CodeQL analysis"
6. Choose **Advanced** setup (the workflow is already configured)

## Workflow Configuration

The CodeQL workflow is configured to:

- Analyze JavaScript/TypeScript and Ruby code
- Run on pushes to the `main` branch
- Run on pull requests to the `main` branch
- Run weekly on a schedule (Wednesdays at 04:45 UTC)

## Troubleshooting

If you see an error like:

```
Error: Please verify that the necessary features are enabled: Code scanning is not enabled for this repository.
```

This means code scanning has not been enabled yet. Follow the steps above to enable it.

For more information, see:

- [About code scanning](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning)
- [Setting up code scanning for a repository](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/setting-up-code-scanning-for-a-repository)
