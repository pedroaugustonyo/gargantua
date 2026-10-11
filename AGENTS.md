# Project notes

Gargantua is a personal browser experiment inspired by Interstellar. It is not a school project or a scientific simulator. Keep it small, easy to run, and focused on the black hole.

## Working on it

- Use the existing JavaScript, CSS, Three.js, and GLSL setup. There is no backend.
- Keep the interface simple. The scene should get most of the attention.
- Keep the title and factual description. Avoid slogans and extra interface decoration.
- Preserve camera controls, mobile support, reduced-motion behavior, and the option to minimize settings.
- Read the relevant parts of [the project guide](docs/index.md) before changing rendering or behavior.
- Update existing documentation when something changes. Write in plain English.
- Keep changes focused. Do not add frameworks or dependencies without a practical reason.

## Checking changes

Run `npm run build`. For visual or interaction changes, also check the app in a browser at desktop and mobile sizes. Browser check commands are in the project guide. Be clear about what was tested.

Do not commit dependencies, build output, temporary screenshots, credentials, or local configuration. Screenshots selected for the README belong in `docs/images/`.
