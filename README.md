# AI UX Web Components

A collection of web components for AI user interfaces that can be used in any project.

## Usage

These components can be imported directly from GitHub in several ways:

### Option 1: Import the entire bundle

```html
<script type="module" src="https://username.github.io/aiux-experiments/dist/bundle.js"></script>
```

### Option 2: Import specific components

```html
<script type="module" src="https://username.github.io/aiux-experiments/dist/components/my-button.js"></script>
```

### Option 3: Import via ES modules

```javascript
import { MyButton } from 'https://username.github.io/aiux-experiments/dist/components/my-button.js';
```

## Available Components

### `<my-button>`

A simple button component with customizable label.

**Properties:**
- `label`: String - The button text

**Events:**
- `button-click`: Dispatched when the button is clicked

**Example:**
```html
<my-button label="Submit"></my-button>
```

## Development

### Setup
```
npm install
```

### Build
```
npm run build
```

### Development Server
```
npm run serve
```

## Deployment

1. Push changes to GitHub
2. Enable GitHub Pages in your repository settings (set it to serve from the root folder)
3. Your components will be available at `https://username.github.io/aiux-experiments/dist/`

## Adding New Components

1. Create a new file in `src/components/`
2. Export your Lit component class
3. Add it to the exports in `src/index.js`
4. Build the project
