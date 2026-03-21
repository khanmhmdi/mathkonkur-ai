# Frontend UI Architecture

Component architecture, styling patterns, and UI organization.

## Component Structure

```
src/components/
├── AuthPage.tsx           # Login/register forms
├── AuthTestComponent.tsx   # Auth testing UI
├── ChatInterface.tsx       # AI chat interface
├── ErrorBoundary.tsx       # Error boundary wrapper
├── Landing.tsx             # Landing page (Navbar + Hero)
└── QuestionBank.tsx        # Question browser
```

## Component Categories

### Page Components

| Component | Route | Description |
|------------|-------|-------------|
| `Landing` | `/` | Landing page with sections |
| `AuthPage` | `/auth` | Login/register forms |
| `QuestionBank` | `/bank` | Question browsing |

### Feature Components

| Component | Purpose |
|-----------|---------|
| `ChatInterface` | AI chat overlay |
| `AuthTestComponent` | Auth debugging |

### Utility Components

| Component | Purpose |
|-----------|---------|
| `ErrorBoundary` | React error boundary |
| `Navbar` (from Landing) | Navigation header |
| `Hero` (from Landing) | Hero section |

## Styling Architecture

**Framework**: Tailwind CSS 4

**Configuration**: `vite.config.ts` with `@tailwindcss/vite`

### Global Styles (`index.css`)

```css
@import "tailwindcss";

@theme {
  --color-indigo-50: #eef2ff;
  --color-indigo-100: #e0e7ff;
  --color-indigo-600: #4f46e5;
  /* ... more theme variables */
}
```

### RTL Support

**Direction**: `dir="rtl"` applied to root element

```tsx
<div className="min-h-screen bg-white font-sans text-slate-900" dir="rtl">
```

### Responsive Design

**Breakpoints**: Default Tailwind breakpoints

| Breakpoint | Prefix | Example |
|------------|--------|---------|
| Mobile | Default | `text-sm` |
| Tablet | `md:` | `md:text-lg` |
| Desktop | `lg:` | `lg:grid-cols-4` |

## Component Patterns

### Props Interface Pattern

```typescript
interface ComponentNameProps {
  // Required props
  requiredProp: string;
  // Optional props
  optionalProp?: number;
  // Callback props
  onAction: () => void;
  // Data props
  data: DataType;
}
```

### Functional Component Pattern

```typescript
import React from 'react';

interface Props {
  title: string;
  onClick: () => void;
}

export const ComponentName: React.FC<Props> = ({ title, onClick }) => {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  );
};
```

### Error Boundary Pattern

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>خطایی رخ داده است</div>;
    }
    return this.props.children;
  }
}
```

## Animation

**Library**: `motion` (Framer Motion alternative)

```typescript
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  {children}
</motion.div>
```

## Icon System

**Library**: `lucide-react`

```typescript
import { Sigma, Menu, X, ChevronRight } from 'lucide-react';

<Sigma className="w-8 h-8 text-indigo-600" />
```

## Form Patterns

### Controlled Input

```typescript
const [value, setValue] = useState('');

<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="border rounded px-4 py-2"
/>
```

### Form Submission

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
    await api.post('/auth/login', { email, password });
    navigate('/');
  } catch (error) {
    const message = getErrorMessage(error);
    setError(message);
  }
};
```

## Data Display Patterns

### Question Card

```typescript
<div className="bg-white p-6 rounded-lg shadow">
  <h3 className="font-bold">{question.text}</h3>
  <div className="mt-4 space-y-2">
    {question.options.map((option, i) => (
      <button key={i} className="block w-full text-right p-2 border rounded">
        {i + 1}. {option}
      </button>
    ))}
  </div>
</div>
```

### Chat Message

```typescript
<div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
  <div className={`max-w-[80%] p-3 rounded-lg ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
    {content}
  </div>
</div>
```

## Common CSS Classes

### Layout

| Class | Purpose |
|-------|---------|
| `min-h-screen` | Full viewport height |
| `flex` | Flexbox container |
| `grid` | CSS Grid container |
| `container mx-auto` | Centered container |

### Spacing

| Class | Purpose |
|-------|---------|
| `p-4` | Padding all sides |
| `m-4` | Margin all sides |
| `gap-4` | Gap between flex/grid items |
| `space-y-4` | Vertical spacing between children |

### Typography

| Class | Purpose |
|-------|---------|
| `text-right` | Right-align text (RTL) |
| `font-sans` | Sans-serif font |
| `text-lg` | Large text size |
| `font-bold` | Bold text |

### Colors

| Class | Purpose |
|-------|---------|
| `bg-white` | White background |
| `bg-indigo-600` | Indigo background |
| `text-slate-900` | Dark text |
| `border-slate-100` | Light border |

## Component Communication

### Props Down

```typescript
// Parent
<ChildComponent data={data} onAction={handleAction} />

// Child
interface Props {
  data: DataType;
  onAction: () => void;
}
```

### Callbacks Up

```typescript
// Child
<button onClick={() => onAction(data)}>Click</button>

// Parent
const handleAction = (data) => { ... }
```

### Context

```typescript
// Provider
<AuthContext.Provider value={value}>{children}</AuthContext.Provider>

// Consumer
const { user } = useAuth();
```

## Related Files

| File | Purpose |
|------|---------|
| `src/components/*.tsx` | All UI components |
| `src/index.css` | Global styles |
| `src/App.tsx` | Component composition |
| `vite.config.ts` | Tailwind configuration |
