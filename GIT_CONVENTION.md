# Git Contribution Guidelines

Since the project language is EN-US, all commit messages should be written in English.

## When to Commit
- **Atomic Commits**: Try to keep commits focused on a single task or change. Avoid bundling unrelated changes (e.g., a bug fix and a new feature) in the same commit.
- **Working State**: Commit when you have a working piece of code, even if the entire feature isn't finished.
- **Before Context Switch**: Commit before switching to a different task or branch.

## Commit Message Convention
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format
```
<type>(<scope>): <subject>
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Examples
- `feat(auth): add login page`
- `fix(api): handle timeout error`
- `docs(readme): update installation instructions`
- `style(ui): fix button alignment`
