# AI UX Experiments

A library of web components for AI UX patterns.

## Documentation and Examples

Visit our [homepage](https://aidankmcl.github.io/aiux-experiments/) for documentation and examples.

## Installation

### Direct Import (CDN)

You can use the components directly from GitHub Pages:

```html
<script type="module" src="https://aidankmcl.github.io/aiux-experiments/lib/components/my-button.js"></script>
```

Then use the component in your HTML:

```html
<my-button label="Click Me"></my-button>
```

### NPM (Coming Soon)

```bash
npm install aiux-experiments
```

Then import in your JavaScript/TypeScript:

```js
import 'aiux-experiments/lib/components/my-button.js';
```

## TypeScript Support

Type definitions are included for all components when importing via npm or using direct imports in a TypeScript project.

## Development

1. Clone this repository
2. Install dependencies: `pnpm install` (intentional `p` in `pnpm`)
3. Start dev server: `npm run dev` (can use `pnpm` or regular `npm`)
4. Build: `npm run build` (same)

## Deployment

1. Push changes to GitHub
2. Enable GitHub Pages in your repository settings (set it to serve from the root folder)
3. Your components will be available at `https://username.github.io/aiux-experiments/dist/`

## Adding New Components

1. Create a new file in `src/components/`
2. Export your Lit component class
3. Add it to the exports in `src/index.js`
4. Build the project
