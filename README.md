# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Running the Project

1. Clone the repository and navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Build for Production

To build the project for production:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## Design Reference

Please use the following Figma design for building out the frontend:
[Figma Design](https://www.figma.com/design/HQp2j9epTTKq6vggiGQRzl/Untitled?node-id=22-685&p=f&t=FZBmcBq74PBjmbF1-0)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
## Environment Variables

The frontend requires the following environment variables:

### Development (.env)

VITE_API_BASE_URL=http://localhost:3000

### Production

VITE_API_BASE_URL=https://your-backend-domain.com

⚠️ The backend must allow CORS for the frontend CLIENT_URL.
Example:
CLIENT_URL=https://your-frontend-domain.com

## Education & Learn Page

The `/learn` page is now fully integrated with the backend API. Content can be updated dynamically without requiring a frontend redeployment.

### Backend Endpoints
- `GET /api/education/guides`: Fetches the list of educational guides.
- `GET /api/education/tip`: Fetches the current "alpha" tip of the day.

### Components
- `LearnPage`: Main container fetching and managing state for education content.
- `GuideCard`: Premium card component for displaying individual guides.
- `TipCard`: High-impact card component for the daily tip.
- `StatusStates`: Reusable Loading, Error, and Empty state components.

### Testing
Unit tests are implemented using Vitest and React Testing Library.
Run unit tests:
```bash
npm run test:unit
```
