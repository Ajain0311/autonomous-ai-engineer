# Project Context Manifest: Tech Hub
Description: A SaaS application for tech professionals to discover, learn, and collaborate on trending technologies and projects.

## Core Specifications
- **Scope:** saas
- **Milestones Count:** 5
- **Backend Framework:** Node.js
- **Styling Framework:** Tailwind CSS


## JSON Database Schema Design
```yaml
projects:
- contributors: array
  description: string
  id: string
  name: string
  tags: array
trending:
- description: string
  id: string
  language: string
  name: string
  stars: number
users:
- email: string
  id: string
  password: string
  projects: array
  username: string

```

## API Endpoints & Routes Contracts
```yaml
auth:
  login:
    method: POST
    request:
      password: string
      username: string
    response:
      token: string
    route: /api/auth/login
  register:
    method: POST
    request:
      email: string
      password: string
      username: string
    response:
      token: string
    route: /api/auth/register
projects:
  create:
    method: POST
    request:
      description: string
      name: string
      tags: array
    response:
      description: string
      id: string
      name: string
      tags: array
    route: /api/projects
  get:
    method: GET
    response:
      description: string
      id: string
      name: string
      tags: array
    route: /api/projects/:id

```

## Workspace Source Code Files
### File: `app/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tech Hub</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### File: `app/netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "build"
[functions]
  directory = "functions"
```

### File: `app/package.json`
```json
{"name": "tech-hub", "version": "1.0.0", "scripts": {"start": "vite", "build": "vite build"}, "dependencies": {"react": "^18.2.0", "react-dom": "^18.2.0", "react-router-dom": "^6.3.0", "zustand": "^4.1.5", "tailwindcss": "^3.1.8", "express": "^4.17.1"}, "devDependencies": {"@types/react": "^18.0.17", "@types/react-dom": "^18.0.6", "@types/react-router-dom": "^5.3.3", "@types/express": "^4.17.13", "typescript": "^4.8.3", "vite": "^3.1.0", "@vitejs/plugin-react": "^2.1.0"}}
```

### File: `app/postcss.config.js`
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### File: `app/tailwind.config.js`
```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### File: `app/tsconfig.json`
```json
{"compilerOptions": {"target": "es6", "lib": ["dom", "dom.iterable", "esnext"], "allowJs": true, "skipLibCheck": true, "esModuleInterop": false, "allowSyntheticDefaultImports": true, "strict": true, "forceConsistentCasingInFileNames": true, "noFallthroughCasesInSwitch": true, "module": "esnext", "moduleResolution": "node", "resolveJsonModule": true, "outDir": "build", "jsx": "react"}}
```

### File: `app/vite.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: './',
  plugins: [react()]
});
```

### File: `app/src/App.tsx`
```tsx
import React from 'react';
function App() {
  return (
    <div className="container mx-auto p-4 pt-6 mt-10">
      <h1 className="text-3xl font-bold">Tech Hub</h1>
    </div>
  );
}
export default App;
```

### File: `app/src/index.css`
```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

```

### File: `app/src/main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```
