# Development documentation

This documentation is specialized for OsX and Bash, our current development environment. Please contribute variations.

This document assume you're running a shell in the root of the project.

## Installation

### Initial setup

To perform the initial setup, which installs `nvm` and `pnpm`, run:

```sh
make setup
# Start a new shell
nvm use
```

If you dont want to run `nvm use` every time you start a new shell you can add these lines to your `~/.bash_profile`:

```sh
# If there is a .nvmrc file, automatically switch to that version of Node
if [ -f .nvmrc ]; then
  NODE_VERSION=$(cat .nvmrc)
  nvm use "$NODE_VERSION" || nvm install "$NODE_VERSION"
fi
```

## Development

- `make deps`: Install all dependencies (using lockfile)
- `make build`: Build everything that needs to be built
- `make test`: Test everything that can be tested
- `make lint`: Check that everything follows the style guide
- `make format`: Format everything to follow the style guide
- `make clean`: Removes all build artifact, dependencies, and temps files
- `make setup`: One-time initialisation

## Release

- `pnpm changeset`: Create a new changeset to indicate a release
- Merge the automatically created PR on GitHub to perform the release
