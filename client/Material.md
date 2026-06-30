# Week 3 Study Material — Frontend Engineering & UX
### Complete Concept Handbook (React, TypeScript, State Management, APIs, Accessibility, Security, Deployment)

> Project used throughout: **Task Management Dashboard**

---

## How To Use This Document
Each topic below follows the same structure:
- **What it is**
- **Why it exists** (the problem it solves)
- **How it works internally**
- **Code Example**
- **Real-world / project usage**
- **Advantages & Disadvantages**
- **Interview Questions**

---

# SECTION 1: REACT ADVANCED

## 1.1 TypeScript with React

**What it is**
TypeScript is a superset of JavaScript that adds static typing. With React, it means your components, props, and state have defined types checked at compile time, not just at runtime.

**Why it exists**
JavaScript is dynamically typed — bugs like passing a string where a number is expected only appear at runtime, sometimes in production. TypeScript catches these errors while you write code.

**How it works internally**
TypeScript code is compiled (transpiled) down to plain JavaScript using the TypeScript compiler (`tsc`) or a bundler-integrated transpiler (e.g., esbuild/SWC in Vite). Type information is stripped out before the code reaches the browser — types exist only at compile time, never at runtime.

**Code Example**
```tsx
type Task = {
  id: number;
  title: string;
  completed: boolean;
};

type TaskListProps = {
  tasks: Task[];
};

function TaskList({ tasks }: TaskListProps) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

**Project usage**
In the Task Management Dashboard, every Task object (id, title, status, dueDate, priority) was typed so that typos like `task.titel` would be caught immediately by the editor instead of failing silently in the UI.

**Advantages**
- Compile-time error detection
- Self-documenting code (types act as documentation)
- Better autocomplete/IntelliSense
- Easier refactoring at scale

**Disadvantages**
- Extra learning curve
- Slightly more verbose code
- Build step required (extra compile time)

**Interview Questions**
1. What is the difference between `interface` and `type` in TypeScript?
2. Does TypeScript exist at runtime in the browser?
3. How does TypeScript help in large React codebases with multiple developers?
4. What is type narrowing?

---

## 1.2 React Hooks (Deep Dive)

**What it is**
Hooks are functions that let functional components "hook into" React features (state, lifecycle, context) without writing a class component.

**Why it exists**
Before Hooks (pre-React 16.8), only class components could hold state or run lifecycle logic. Classes led to duplicated logic across lifecycle methods (`componentDidMount`, `componentDidUpdate`) and made logic reuse hard (HOCs/render props were clunky). Hooks solve this by letting you extract and reuse stateful logic as plain functions.

**How it works internally**
React maintains a **linked list of hooks per component instance** called the "Fiber" structure. Each call to `useState`/`useEffect` etc. is tied to an index in that list. This is *why hooks must be called in the same order every render* — React doesn't track hooks by name, it tracks them by call order.

---

### 1.2.1 `useState`

**What/Why**: Adds local, re-render-triggering state to a function component.

**Code**
```tsx
const [tasks, setTasks] = useState<Task[]>([]);

function addTask(newTask: Task) {
  setTasks((prev) => [...prev, newTask]);
}
```

**Internals**: Calling `setTasks` schedules a re-render. React batches multiple `setState` calls inside the same event handler into a single re-render (since React 18, batching also applies inside promises/timeouts).

**Project usage**: Local UI state — form input values, modal open/close, filter toggle.

**Pros/Cons**: Simple and direct, but multiple related `useState` calls can get messy for complex state (→ use `useReducer`).

**Interview Q**: Why does `setState` not update the variable immediately? What is functional `setState` (`setTasks(prev => ...)`) and why use it over direct value updates?

---

### 1.2.2 `useEffect`

**What/Why**: Runs side effects (data fetching, subscriptions, DOM manipulation, timers) after render, decoupled from the render phase itself.

**Code**
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    console.log("Checking for due tasks...");
  }, 5000);

  return () => clearInterval(interval); // cleanup
}, []);
```

**Internals**: Effects run **after the DOM has painted**, asynchronously, unlike `useLayoutEffect` which runs synchronously before paint. The dependency array tells React when to re-run the effect — React does a shallow comparison of each dependency between renders.

**Project usage**: Fetching tasks on mount, setting up due-date reminder timers, syncing `document.title` with task count.

**Pros/Cons**: Powerful, but a common bug source — missing dependencies cause stale closures (the "stale state" bug); too many dependencies cause infinite refetch loops.

**Interview Q**: What's the difference between `useEffect` and `useLayoutEffect`? Why does the empty dependency array `[]` mean "run once"? What is a cleanup function and when does it run?

---

### 1.2.3 `useRef`

**What/Why**: Holds a mutable value that persists across renders **without** causing a re-render when changed, and provides direct access to DOM nodes.

**Code**
```tsx
function TaskInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    inputRef.current?.focus();
  }

  return <input ref={inputRef} />;
}
```

**Internals**: A ref is a plain JS object `{ current: value }` that React preserves across renders. Mutating `.current` does **not** trigger reconciliation.

**Project usage**: Auto-focusing the "new task" input after a task is added; storing the previous render's task count to compare against the current one.

**Interview Q**: Why doesn't updating a ref cause a re-render? Difference between `useRef` and `useState`?

---

### 1.2.4 `useContext`

**What/Why**: Reads a value from a Context Provider without manually passing props down every level (solves **prop drilling**).

**Code**
```tsx
const ThemeContext = createContext("light");

function Header() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Dashboard</div>;
}
```

**Internals**: When the Provider's value changes, **every component consuming that context re-renders**, regardless of whether it uses the changed part of the value — this is a key performance gotcha.

**Project usage**: Theme (light/dark), logged-in user info, language/locale.

**Interview Q**: What problem does Context solve? Why can Context cause unnecessary re-renders, and how do you mitigate it (memoization, splitting contexts)?

---

### 1.2.5 `useMemo`

**What/Why**: Caches (memoizes) the **result of an expensive calculation** so it's not recomputed on every render unless its dependencies change.

**Code**
```tsx
const completedTasks = useMemo(
  () => tasks.filter((t) => t.completed),
  [tasks]
);
```

**Internals**: React stores the previous dependency array and the previous returned value. On re-render, it shallow-compares the new dependencies — if unchanged, it returns the cached value instead of re-running the function.

**Project usage**: Filtering/sorting large task lists, computing dashboard statistics (e.g., % tasks completed).

**Interview Q**: When should you avoid `useMemo` (i.e., when is the overhead not worth it)? Is `useMemo` a guarantee or a hint to React?

---

### 1.2.6 `useCallback`

**What/Why**: Like `useMemo`, but specifically caches a **function reference** instead of a computed value — important because in JS, a new function is created on every render unless memoized.

**Code**
```tsx
const handleDeleteTask = useCallback(
  (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  },
  []
);
```

**Internals**: Without `useCallback`, passing a freshly-created function as a prop to a `React.memo`-wrapped child defeats the memoization, because the prop "changes" (new reference) every render even if logically identical.

**Project usage**: Passing stable `onDelete`/`onComplete` handlers to a memoized `<TaskCard />` list so the whole list doesn't re-render when one task changes.

**Interview Q**: `useMemo` vs `useCallback` — what's the actual difference? (`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.)

---

### 1.2.7 `useReducer`

**What/Why**: An alternative to `useState` for state with **complex transition logic** — multiple sub-values that change together, or state changes that depend on the previous state in non-trivial ways.

**Code**
```tsx
type Action =
  | { type: "ADD"; payload: Task }
  | { type: "DELETE"; payload: number };

function taskReducer(state: Task[], action: Action): Task[] {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];
    case "DELETE":
      return state.filter((t) => t.id !== action.payload);
    default:
      return state;
  }
}

const [tasks, dispatch] = useReducer(taskReducer, []);
dispatch({ type: "ADD", payload: newTask });
```

**Internals**: Same Fiber-based hook mechanism as `useState`, but state transitions are centralized in a pure reducer function — predictable, testable, similar in shape to Redux.

**Project usage**: Task CRUD operations (add/edit/delete/toggle status) where logic was getting tangled with multiple `useState` calls.

**Interview Q**: When would you choose `useReducer` over `useState`? How is it conceptually similar to Redux?

---

## 1.3 Error Boundaries

**What it is**
A React component (must be a class component, or wrapped via a library for function components) that catches JavaScript errors anywhere in its child component tree during rendering, and displays a fallback UI instead of crashing the whole app.

**Why it exists**
Before Error Boundaries, a single thrown error in any component would unmount the entire React tree — a tiny bug in one widget would take down the whole page.

**How it works internally**
Error Boundaries use the lifecycle methods `static getDerivedStateFromError()` and `componentDidCatch()`. React only catches errors in the **render phase**, lifecycle methods, and constructors of the tree below the boundary — it does **not** catch errors in event handlers, async code, or server-side rendering.

**Code Example**
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong loading tasks.</h2>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <TaskDashboard />
</ErrorBoundary>
```

**Project usage**: Wrapping the Tasks widget so that if the chart-rendering library throws (e.g., bad data shape), only that widget shows an error message — the rest of the dashboard (nav, sidebar) stays usable.

**Advantages**: Prevents full app crashes; isolates failure to a UI region.
**Disadvantages**: Doesn't catch async errors, event-handler errors, or errors in itself; must currently be a class component (no official hook equivalent).

**Interview Questions**
1. What types of errors does an Error Boundary NOT catch?
2. Why must Error Boundaries be class components?
3. How would you log errors caught by an Error Boundary to a monitoring service?

---

## 1.4 Re-render Optimization

**What it is**
The set of techniques used to prevent React components from re-rendering when their output wouldn't actually change.

**Why it exists**
React re-renders a component whenever its state or its parent's state changes — even if the new render produces an identical UI. On large trees (e.g., a task list with hundreds of items), unnecessary re-renders cause visible lag.

**How it works internally**
React's reconciliation (diffing) algorithm always re-runs the component function and then diffs the resulting React element tree against the previous one. `React.memo` short-circuits this: it skips re-running the component function if props are shallow-equal to the previous render. `useMemo`/`useCallback` keep prop *references* stable so `React.memo` comparisons actually succeed.

**Code Example**
```tsx
const TaskCard = React.memo(function TaskCard({ task, onDelete }: TaskCardProps) {
  console.log("Rendering:", task.title);
  return (
    <div>
      <p>{task.title}</p>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
});
```

**Project usage**: Wrapping `<TaskCard />` in `React.memo` plus `useCallback` for `onDelete`/`onToggle` so that editing one task's title doesn't re-render all 200 other task cards.

**Advantages**: Smoother UI, better perceived performance on large lists.
**Disadvantages**: Premature memoization adds complexity and a small comparison overhead; over-using it can make code harder to read for negligible gain.

**Interview Questions**
1. What does `React.memo` actually compare?
2. Why does passing an inline arrow function as a prop break `React.memo`?
3. How do React DevTools Profiler / "Highlight updates" help diagnose unnecessary re-renders?

---

## 1.5 Chrome DevTools, React DevTools & Lighthouse

**What it is**
- **Chrome DevTools**: Built-in browser tools for inspecting DOM, network requests, performance timelines, and console logs.
- **React DevTools**: A browser extension that shows the React component tree, props, state, and hooks live, plus a Profiler for render timing.
- **Lighthouse**: An automated auditing tool (built into Chrome DevTools) that scores a page on Performance, Accessibility, Best Practices, and SEO.

**Why they exist**
Without these, debugging "why is this component re-rendering" or "why is my page slow/inaccessible" would require manual `console.log` sprinkling and guesswork.

**How they're used in the project**
- React DevTools → Profiler tab → recorded a render while typing in the new-task input, found `<TaskList>` re-rendering on every keystroke, fixed it by lifting the input's local state.
- Lighthouse → ran an audit on the dashboard, got flagged for missing `alt` text and low color contrast, which fed directly into the Accessibility section's fixes.

**Interview Questions**
1. What does the React DevTools Profiler flame graph show you?
2. Name three categories Lighthouse scores a page on.
3. How would you use the Network tab to diagnose a slow API call?

---

## 1.6 State Management (Local vs Global)

**What it is**
State management is the strategy for deciding *where* a piece of data lives and *how* components read/update it.

- **Local state**: Owned by a single component (`useState`/`useReducer`), invisible to the rest of the app.
- **Global state**: Shared across many components regardless of where they sit in the tree (Context API, Redux, Zustand).

**Why it matters**
Choosing the wrong scope causes two classic problems:
1. **Prop drilling** — passing a prop through five layers of components that don't use it, just to reach a deeply nested child.
2. **Over-globalizing** — putting everything in global state causes unrelated components to re-render unnecessarily and makes data flow harder to trace.

**Project usage**: In the Task Dashboard — `isModalOpen` was kept local to the modal component; `currentUser` and `theme` were lifted to global Context because the Navbar, Sidebar, and Settings page all needed them.

**Interview Questions**
1. How do you decide if a piece of state should be local or global?
2. What's "prop drilling" and what are two ways to avoid it?

---

## 1.7 Context API

**What it is**
A built-in React feature for sharing data across the component tree without manually passing props at every level.

**Why it exists**
To solve prop drilling for low-frequency-changing, broadly-needed data (theme, auth, locale) without pulling in a full external state library.

**How it works internally**
`createContext()` creates a Context object. `<MyContext.Provider value={...}>` makes that value available to all descendants. Internally, React stores the current value on the Fiber tree; when the Provider's `value` prop changes (by reference), React schedules a re-render for **every component calling `useContext(MyContext)`**, even ones that only use an unrelated piece of that value object — this is why large unsplit contexts hurt performance.

**Code Example**
```tsx
type ThemeContextType = { theme: string; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextType | null>(null);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Project usage**: Theme switching (light/dark mode) across the entire dashboard, auth/user info available to Navbar and protected routes.

**Advantages**: No extra library, simple for low-frequency global data.
**Disadvantages**: Not optimized for high-frequency updates (e.g., every keystroke) — causes broad re-renders; no built-in devtools/middleware like Redux has.

**Interview Questions**
1. Context API vs Redux — when would you choose one over the other?
2. How can splitting one big context into multiple smaller contexts improve performance?

---

## 1.8 Redux Toolkit

**What it is**
Redux is a predictable global state container. Redux Toolkit (RTK) is the modern, official way to write Redux — it removes most of the old boilerplate (action types, action creators, manual immutable updates).

**Why it exists**
Classic Redux required writing action type constants, action creator functions, and reducers with manual spread-based immutability — a huge amount of boilerplate for even simple state changes. Redux itself exists to make state changes **predictable and traceable** in large apps: one single source of truth, updated only through dispatched actions, observable via devtools/time-travel debugging.

**How it works internally**
1. Components **dispatch** an action (a plain object describing "what happened").
2. The **store** sends the action to the **reducer**.
3. The reducer is a pure function: `(state, action) => newState`. It never mutates state directly — RTK uses the **Immer** library internally so you can write "mutating-looking" code that's actually translated into immutable updates.
4. The store saves the new state and notifies all subscribed components, which re-render with the new data.

```
Component → dispatch(action) → Reducer (pure fn) → New State → Store → UI re-renders
```

**Code Example**
```tsx
// tasksSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Task = { id: number; title: string; completed: boolean };

const tasksSlice = createSlice({
  name: "tasks",
  initialState: [] as Task[],
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.push(action.payload); // looks mutating, Immer makes it safe
    },
    removeTask: (state, action: PayloadAction<number>) => {
      return state.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addTask, removeTask } = tasksSlice.actions;
export default tasksSlice.reducer;
```

```tsx
// In a component
const dispatch = useDispatch();
const tasks = useSelector((state: RootState) => state.tasks);

dispatch(addTask({ id: 1, title: "Learn Redux", completed: false }));
```

**Project usage**: Centralizing the entire task list, filters, and sort order, so the Sidebar, Dashboard chart, and Task List page all read from one synced source of truth.

**Advantages**: Predictable state changes, excellent DevTools (time-travel debugging), great for large apps with many interacting state slices, strong middleware ecosystem (e.g., for async logic via `createAsyncThunk`).
**Disadvantages**: More setup/concepts to learn (store, slices, selectors, dispatch) than simpler alternatives; can be overkill for small apps.

**Interview Questions**
1. What problem does Redux solve that Context API doesn't?
2. What is Immer and why does Redux Toolkit use it?
3. What's the difference between an action and a reducer?
4. How would you handle an async API call in Redux Toolkit (`createAsyncThunk`)?

---

## 1.9 Zustand

**What it is**
A small, unopinionated state management library for React that uses hooks directly, without needing Providers or boilerplate reducers/actions.

**Why it exists**
As an alternative to Redux's verbosity (even with RTK, you still set up slices, a store, a Provider) for apps that just need simple shared state with minimal ceremony.

**How it works internally**
Zustand creates a store **outside of React's render tree** using a simple closure-based subject/observer pattern. Components subscribe to specific slices of that store via a selector function — so a component only re-renders when the **specific value it selected** changes, not on every store update (better default render-isolation than Context API).

**Code Example**
```tsx
import { create } from "zustand";

type TaskStore = {
  tasks: Task[];
  addTask: (task: Task) => void;
};

const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
}));

// In a component — no Provider needed
function TaskCount() {
  const tasks = useTaskStore((state) => state.tasks);
  return <p>{tasks.length} tasks</p>;
}
```

**Project usage**: Considered as a lighter alternative to Redux for the Task Dashboard's filter/sort UI state, where the overhead of slices and actions felt unnecessary.

**Advantages**: Minimal boilerplate, no Provider wrapper required, fine-grained subscriptions out of the box, tiny bundle size.
**Disadvantages**: Smaller ecosystem than Redux, fewer enforced conventions (can get messy in very large teams without discipline), less mature devtools/time-travel support.

**Interview Questions**
1. How does Zustand avoid the "Provider wrapping everything" pattern?
2. Zustand vs Redux Toolkit — when would you pick each?
3. How does Zustand's selector-based subscription reduce re-renders compared to Context API?

---

## 1.10 React Router & Dynamic Routing

**What it is**
React Router is the standard client-side routing library for React. **Dynamic routing** means routes that contain a variable segment (like an ID) rather than a fixed path.

**Why it exists**
React is a Single Page Application (SPA) — there's only one actual HTML page. React Router simulates multi-page navigation (different URLs showing different content) without full page reloads, by intercepting URL changes and rendering the matching component.

**How it works internally**
React Router listens to the browser's History API (`pushState`/`popState`). When the URL changes, it matches the new path against your defined `<Route>` patterns and renders the matching component — entirely on the client, no server round-trip. For a dynamic segment like `/tasks/:id`, React Router parses the actual URL (e.g., `/tasks/42`) and exposes `id = "42"` via the `useParams()` hook.

**Code Example**
```tsx
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";

function TaskDetail() {
  const { id } = useParams(); // reads the dynamic segment
  return <h1>Task #{id}</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Project usage**: `/tasks/:id` opened a detail view for a specific task; `/tasks?status=completed` style query params filtered the list.

**Advantages**: True SPA navigation (fast, no full reload), nested routes, lazy loading per route, URL becomes shareable/bookmarkable app state.
**Disadvantages**: SEO requires extra care (or server-side rendering) since content renders client-side; deep linking needs server config (fallback to `index.html`) when deployed.

**Interview Questions**
1. How does React Router avoid full page reloads?
2. What is `useParams()` used for?
3. How would you protect a route so only logged-in users can access it (protected/private routes)?

---

## 1.11 Theme Switching (Light/Dark Mode)

**What it is**
A UI feature letting users toggle between light and dark color schemes, persisted across sessions.

**Why it exists**
Accessibility and user preference — some users find dark mode easier on the eyes, especially in low light; it's now a baseline expectation for modern apps.

**How it works internally**
Two common approaches:
1. **CSS variables + a class on `<html>`/`<body>`**: define `--bg-color`, `--text-color` etc., then swap a `dark` class which redefines those variables.
2. **`light-dark()` CSS function** (modern CSS): lets you define both values in one declaration and the browser/`color-scheme` picks the right one.

Combined with React Context to hold the current theme value and a toggle function, plus `localStorage` to persist the choice across reloads.

**Code Example**
```css
:root {
  --bg-color: white;
  --text-color: black;
}
.dark {
  --bg-color: #121212;
  --text-color: #f5f5f5;
}
```
```tsx
function toggleTheme() {
  const next = theme === "light" ? "dark" : "light";
  document.documentElement.className = next;
  localStorage.setItem("theme", next);
  setTheme(next);
}
```

**Project usage**: Theme toggle button in the dashboard navbar, persisted via `localStorage` so the user's preference survives a page refresh.

**Interview Questions**
1. Why use CSS variables instead of writing two full separate stylesheets?
2. Where would you persist the user's theme choice, and why?
3. What is the `prefers-color-scheme` media query used for?

---

# SECTION 2: API CONSUMPTION & DATA HANDLING

## 2.1 Environment Variables

**What it is**
Configuration values (API URLs, keys) kept outside your source code, injected at build/runtime.

**Why it exists**
Hardcoding values like `https://api.dev.example.com` directly in code means you'd have to edit and recompile the source every time you move from development to production. Env variables let the *same code* run differently depending on environment, and keep secrets out of version control.

**How it works internally (Vite)**
Vite only exposes variables prefixed with `VITE_` to client-side code (a deliberate security boundary — anything without that prefix stays server-only/build-only and never gets bundled into the shipped JS). Vite reads `.env`, `.env.development`, `.env.production` files based on the current **mode**, and replaces `import.meta.env.VITE_X` with the literal value at build time.

**Code Example**
```bash
# .env
VITE_API_URL=https://api.taskdashboard.com
```
```ts
const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/tasks`);
```

**Project usage**: Switching the Task Dashboard's API base URL between a local mock server during development and the real backend in production, without touching code.

**Advantages**: Clean separation of config from code; keeps secrets out of git (when `.env` is in `.gitignore`).
**Disadvantages**: Anything prefixed `VITE_` is still publicly visible in the shipped bundle — **never** put real secrets (private API keys) in frontend env vars.

**Interview Questions**
1. Why does Vite require a `VITE_` prefix for client-exposed env vars?
2. Why shouldn't you store a secret API key in a frontend `.env` file?
3. How do `.env.development` and `.env.production` differ in usage?

---

## 2.2 TanStack Query (React Query)

**What it is**
A data-fetching and **server-state** management library for React that handles fetching, caching, background refetching, and synchronization of remote data.

**Why it exists**
Manually fetching data with `useState` + `useEffect` means you have to hand-roll loading flags, error flags, caching, deduplication of repeated requests, and refetch-on-window-focus logic yourself — TanStack Query provides all of this out of the box with a tiny API surface.

**How it works internally**
1. `useQuery({ queryKey, queryFn })` registers a query identified by `queryKey` in a global in-memory **cache**.
2. On mount, it calls `queryFn`, stores the result under that key, and returns `{ data, isLoading, error }` to the component.
3. If another component calls `useQuery` with the **same key**, it instantly gets the cached data (no duplicate network request) and the query is automatically re-fetched in the background per its configured staleness rules.
4. Internally it tracks each query's status (`idle`, `loading`, `success`, `error`) and manages retries, garbage collection of unused cache entries, and refetch triggers (window refocus, network reconnect, interval).

**Code Example**
```tsx
const fetchTasks = async (): Promise<Task[]> => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos");
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

function Tasks() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading tasks</p>;

  return (
    <ul>
      {tasks!.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

**Mutations** (for create/update/delete):
```tsx
const queryClient = useQueryClient();

const { mutate: addTask } = useMutation({
  mutationFn: (newTask: Task) =>
    fetch("/api/tasks", { method: "POST", body: JSON.stringify(newTask) }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] }); // refetch fresh data
  },
});
```

**Project usage**: All task fetching, creating, updating, and deleting in the Task Dashboard used `useQuery`/`useMutation` instead of manual `useEffect` + `useState`, with `invalidateQueries` keeping the list in sync after every mutation.

**Advantages**: Drastically less boilerplate, automatic caching/deduping, background refetch keeps UI fresh, built-in retry/error handling, devtools for inspecting cache.
**Disadvantages**: Another concept/library to learn; not meant for purely client-only state (that's still `useState`/Redux/Zustand's job) — TanStack Query is specifically for **server state**.

**Interview Questions**
1. What is the difference between "client state" and "server state," and why does TanStack Query specifically target server state?
2. What does `queryKey` do, and why does it matter that it's an array?
3. What happens if two components call `useQuery` with the same `queryKey` at the same time?
4. How does `invalidateQueries` work after a mutation?

---

## 2.3 Async/Await in JavaScript

**What it is**
Syntax sugar over Promises that lets asynchronous code (network calls, timers) be written and read like synchronous code.

**Why it exists**
Before async/await, asynchronous JS relied on callbacks (leading to deeply nested "callback hell") or chained `.then()` calls. `async`/`await` makes asynchronous flows linear and far easier to read and debug, especially with `try/catch` for errors.

**How it works internally**
An `async` function always returns a Promise. The `await` keyword pauses execution of *that function* (not the whole program — JS is still single-threaded and non-blocking) until the awaited Promise settles, then resumes with the resolved value (or throws if rejected). Internally, this is built on the JS event loop and microtask queue — `await` schedules continuation as a microtask once the Promise resolves.

**Code Example**
```js
async function fetchTasks() {
  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    throw error;
  }
}
```

**Project usage**: Every API call in the dashboard (`fetchTasks`, `createTask`, `deleteTask`) used `async/await` for readability inside `queryFn`/`mutationFn`.

**Advantages**: Reads like synchronous code, easier error handling via `try/catch`, easier to debug (stack traces are clearer than promise chains).
**Disadvantages**: Easy to accidentally block sequential awaits that could run in parallel (`await a(); await b();` instead of `Promise.all([a(), b()])`), and forgetting `await` silently returns a pending Promise instead of the value.

**Interview Questions**
1. What does an `async` function always return?
2. How is `await` different from `.then()` under the hood?
3. How would you run two independent async calls in parallel instead of sequentially?
4. What happens if you `await` a rejected Promise without a `try/catch`?

---

## 2.4 Error Handling in JavaScript/React

**What it is**
Strategies for catching, handling, and gracefully recovering from runtime errors — both synchronous (`try/catch`) and asynchronous (`.catch()`, rejected promises).

**Why it exists**
Unhandled errors in JS either crash the script execution context or, in React, can crash the whole render tree (if not caught by an Error Boundary). Proper handling means users see a friendly message ("Couldn't load tasks, please retry") instead of a blank broken page.

**How it works internally**
`try { } catch (e) { }` catches synchronous throws **and** awaited promise rejections inside an `async` function (since `await` re-throws a rejected promise as a regular exception). For event handlers and effects, errors must be caught locally — React's Error Boundaries do **not** catch these.

**Code Example**
```tsx
async function handleAddTask(title: string) {
  try {
    await createTask({ title });
    showToast("Task added!");
  } catch (error) {
    showToast("Failed to add task. Please try again.", "error");
  }
}
```

**Project usage**: Wrapping every mutation (add/edit/delete task) with error feedback via toast notifications, plus a top-level Error Boundary for render-time failures.

**Advantages**: Predictable failure states, better UX, easier debugging with centralized error logging.
**Disadvantages**: Over-broad `try/catch` blocks can silently swallow bugs if not logged/reported properly.

**Interview Questions**
1. Why doesn't a React Error Boundary catch an error thrown inside an `onClick` handler?
2. How do you handle a rejected Promise inside an `async` function?
3. What's the difference between handling errors at the API-call level vs. at the UI/component level?

---

# SECTION 3: ACCESSIBILITY & UI RESPONSIVENESS

## 3.1 Responsive Design Principles

**What it is**
Designing UI so it adapts cleanly across screen sizes — mobile, tablet, desktop — using a single codebase.

**Why it exists**
Users access apps from wildly different devices. A fixed-width desktop-only layout breaks on mobile (overflow, tiny unreadable text); responsive design ensures one layout serves all.

**How it works internally**
- **Flexbox**: one-dimensional layout (row or column) — great for navbars, button groups, card rows.
- **CSS Grid**: two-dimensional layout — great for dashboard layouts (sidebar + main content + widgets).
- **Media queries**: conditionally apply CSS rules based on viewport width (`@media (max-width: 768px) { ... }`), letting layout/structure change at defined breakpoints.
- **Mobile-first approach**: write base styles for small screens, then add `min-width` media queries to progressively enhance for larger screens — generally produces leaner CSS than desktop-first.

**Code Example**
```css
.dashboard {
  display: grid;
  grid-template-columns: 1fr; /* mobile: single column */
}

@media (min-width: 768px) {
  .dashboard {
    grid-template-columns: 250px 1fr; /* tablet+: sidebar + main */
  }
}
```

**Project usage**: The Task Dashboard's sidebar collapsed into a bottom nav on mobile and became a fixed left panel on tablet/desktop, using Grid + media queries.

**Advantages**: One codebase serves all devices, better reach, improved Lighthouse scores.
**Disadvantages**: Testing across many breakpoints/devices takes real effort; complex grid layouts can get hard to reason about with many breakpoints.

**Interview Questions**
1. Flexbox vs Grid — when would you choose each?
2. What is "mobile-first" design and why is it generally preferred?
3. What's the difference between `min-width` and `max-width` media queries?

---

## 3.2 Accessibility (a11y) & WCAG

**What it is**
Designing and building applications so people with disabilities (visual, motor, auditory, cognitive) can use them — guided by the **WCAG** (Web Content Accessibility Guidelines) standard.

**Why it exists**
A meaningful portion of users rely on assistive technology (screen readers, keyboard-only navigation, voice control). Accessibility is also frequently a **legal requirement** (e.g., ADA in the US) for commercial products, not just a nice-to-have.

**How it works internally**
WCAG is organized around four principles, often remembered as **POUR**:
- **Perceivable** — content must be presentable in ways users can perceive (alt text for images, sufficient color contrast).
- **Operable** — all functionality available via keyboard, not just mouse.
- **Understandable** — predictable navigation, clear labels/instructions.
- **Robust** — content works across assistive technologies (compatible HTML/ARIA).

**Code Example**
```html
<!-- Bad: no label, no semantic element -->
<div onclick="submitForm()">Submit</div>

<!-- Good: semantic, keyboard accessible by default -->
<label for="task-title">Task Title</label>
<input id="task-title" type="text" />
<button type="submit">Submit</button>
```

**Project usage**: Ran a Lighthouse accessibility audit on the Task Dashboard; fixed missing form `<label>`s, added `alt` text to icons, and ensured every interactive element (delete buttons, checkboxes) was reachable and operable via `Tab` and `Enter`/`Space`.

**Advantages**: Larger usable audience, often improves UX for *everyone* (not just disabled users — e.g., good contrast helps in bright sunlight too), avoids legal risk.
**Disadvantages**: Requires deliberate testing (screen readers, keyboard-only walkthroughs) that's easy to skip under deadline pressure.

**Interview Questions**
1. What does WCAG's POUR stand for?
2. Why is using a `<button>` better than a `<div onClick>` for accessibility?
3. How would you test a page for keyboard accessibility without a mouse?

---

## 3.3 ARIA (Accessible Rich Internet Applications)

**What it is**
A set of HTML attributes that add accessibility information to elements that don't have it natively — mainly needed for custom/complex widgets that plain HTML doesn't cover well.

**Why it exists**
Plain semantic HTML (`<button>`, `<label>`, `<nav>`) is accessible by default. But custom components — a dropdown built from `<div>`s, a custom modal, a tab interface — have no inherent meaning to screen readers without extra hints. ARIA fills that gap.

**How it works internally**
ARIA attributes (`role`, `aria-label`, `aria-expanded`, `aria-hidden`, etc.) are read by the browser's **accessibility tree**, a parallel tree to the DOM that screen readers query. ARIA does not change visual behavior or functionality at all — it's purely a layer of semantic metadata for assistive tech. (Golden rule: "No ARIA is better than bad ARIA" — prefer native semantic HTML whenever possible.)

**Code Example**
```html
<button aria-label="Delete task" onClick={handleDelete}>
  🗑️
</button>

<div role="alert" aria-live="polite">
  Task added successfully!
</div>

<button aria-expanded={isOpen} aria-controls="task-menu">
  Menu
</button>
```

**Project usage**: Icon-only buttons (delete, edit) got `aria-label`s describing their action since there was no visible text; a live region (`aria-live="polite"`) announced toast notifications to screen reader users.

**Advantages**: Makes custom widgets accessible where native HTML can't express the intent.
**Disadvantages**: Misused ARIA (wrong role, contradicting native semantics) can make accessibility *worse* than having none at all.

**Interview Questions**
1. What is the "first rule of ARIA"? (Don't use ARIA if a native HTML element/attribute already does the job.)
2. What does `aria-live="polite"` do, and when would you use it?
3. Difference between `aria-hidden` and `display: none`?

---

## 3.4 Secure / Web Storage (localStorage, sessionStorage, Cookies)

**What it is**
Three different browser-provided ways to store small amounts of data client-side.

| Storage | Persistence | Sent to server automatically? | Typical size limit |
|---|---|---|---|
| `localStorage` | Until explicitly cleared | No | ~5–10MB |
| `sessionStorage` | Until tab/window closes | No | ~5–10MB |
| Cookies | Configurable (can persist or expire) | **Yes**, on every request to matching domain | ~4KB |

**Why each exists**
- `localStorage`: persistent client-only preferences (theme, saved filters) that don't need server visibility.
- `sessionStorage`: temporary, per-tab data that shouldn't survive closing the tab (e.g., a multi-step form draft).
- Cookies: the *only* one of the three automatically included in HTTP requests — historically used for session/auth identifiers because the server needs to receive them on every request.

**How it works internally**
`localStorage`/`sessionStorage` are synchronous, origin-scoped key-value stores exposed via the Web Storage API — accessible only via JavaScript, never sent over the network automatically. Cookies are attached by the browser to the `Cookie` header on every matching request, and can be marked `HttpOnly` (inaccessible to JS, mitigating XSS theft) and `Secure`/`SameSite` (mitigating CSRF and transmission over insecure connections).

**Code Example**
```js
// localStorage — theme preference
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme");

// sessionStorage — temporary draft
sessionStorage.setItem("draftTask", JSON.stringify({ title: "WIP" }));
```

**Project usage**: Theme preference → `localStorage` (should persist forever). A half-filled "create task" form → `sessionStorage` (only relevant for that browsing session).

**Advantages**: Simple synchronous API, no server round-trip needed, generous size limits compared to cookies.
**Disadvantages**: Both `localStorage`/`sessionStorage` are readable by any JS running on the page — vulnerable to **XSS** (a malicious script can read tokens stored there). This is the core reason auth tokens are often recommended to live in `HttpOnly` cookies instead (see Section 5).

**Interview Questions**
1. Why are cookies automatically sent with requests but `localStorage` is not?
2. What's the real-world security risk of storing a JWT in `localStorage`?
3. `localStorage` vs `sessionStorage` — give one good use case for each.

---

# SECTION 4: CHARTS & FORM VALIDATION

## 4.1 Chart.js (with React Chart.js 2)

**What it is**
A JavaScript charting library that draws charts (bar, line, pie, doughnut, etc.) onto an HTML `<canvas>` element. `react-chartjs-2` is a thin React wrapper around it.

**Why it exists**
Dashboards need visual summaries (e.g., "60% of tasks completed this week") that raw numbers/tables don't communicate as quickly. Chart.js provides ready-made, animated, responsive chart types instead of hand-rolling SVG/canvas drawing code.

**How it works internally**
Chart.js renders directly to a `<canvas>` 2D rendering context — it's **not** DOM-based like SVG charts, which makes it fast for large datasets but means individual chart elements aren't separately addressable DOM nodes (a minor accessibility tradeoff, mitigated with `aria-label`s on the canvas and accompanying data tables/legends). `react-chartjs-2` wraps this imperative canvas API into a declarative `<Bar data={...} options={...} />` component, managing the canvas lifecycle (mount/update/unmount) for you.

**Code Example**
```tsx
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Completed", "Pending", "Overdue"],
  datasets: [
    {
      data: [12, 5, 2],
      backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
    },
  ],
};

function TaskStatusChart() {
  return <Pie data={data} />;
}
```

**Project usage**: A pie chart showing task status breakdown (completed/pending/overdue) and a bar chart for tasks completed per day on the Task Dashboard's analytics widget.

**Advantages**: Wide variety of chart types, good default animations/responsiveness, large community, decent performance even on bigger datasets.
**Disadvantages**: Canvas-based rendering is less naturally accessible than SVG (needs extra ARIA work); deep customization can require diving into verbose config objects.

**Interview Questions**
1. Why is Chart.js canvas-based instead of SVG-based, and what tradeoff does that bring?
2. How would you make a Chart.js chart more accessible to screen reader users?
3. How do you update chart data reactively when the underlying task list changes?

---

## 4.2 React Hook Form

**What it is**
A library for managing form state (values, validation, submission) in React with minimal re-renders and minimal boilerplate.

**Why it exists**
Managing forms with plain `useState` means a `useState` call per field and a re-render on every keystroke for every field — fine for small forms, painful for large ones. React Hook Form solves this by using **uncontrolled inputs** under the hood (via refs) rather than controlling every keystroke through React state.

**How it works internally**
Instead of binding `value`/`onChange` to React state per field (controlled components, causing a re-render per keystroke), React Hook Form registers each input via a `ref` (`register("title")`) and reads values directly from the DOM only when needed (on submit, on blur, or on validate) — drastically reducing re-renders. It uses a subscription model internally so only components that actually need to re-render (e.g., to show a new validation error) do so.

**Code Example**
```tsx
import { useForm } from "react-hook-form";

type TaskFormData = { title: string; dueDate: string };

function TaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>();

  const onSubmit = (data: TaskFormData) => {
    console.log("New task:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title", { required: "Title is required" })} />
      {errors.title && <span>{errors.title.message}</span>}

      <input type="date" {...register("dueDate")} />
      <button type="submit">Add Task</button>
    </form>
  );
}
```

**Project usage**: The "Create/Edit Task" form (title, description, due date, priority) used React Hook Form to keep typing fast/snappy even with several fields and live validation messages.

**Advantages**: Far fewer re-renders than fully-controlled forms, small bundle size, built-in validation support, integrates cleanly with schema libraries like Zod.
**Disadvantages**: Slightly different mental model (uncontrolled inputs) than the "classic React" controlled-input pattern; debugging requires understanding `register`/`watch`/`formState`.

**Interview Questions**
1. Why does React Hook Form cause fewer re-renders than controlled inputs with `useState`?
2. What does `register()` actually do under the hood?
3. How would you show a field-specific error message with React Hook Form?

---

## 4.3 Zod Validation

**What it is**
A TypeScript-first schema declaration and validation library — you describe the *shape* data should have, and Zod both validates it at runtime and infers a matching TypeScript type.

**Why it exists**
TypeScript types vanish at runtime (Section 1.1) — they can't validate data coming from outside your code (API responses, form input, URL params). Zod bridges that gap: one schema definition gives you **both** compile-time types and runtime validation, instead of maintaining two separate sources of truth.

**How it works internally**
`z.object({...})` builds a schema tree of validator nodes. Calling `.parse(data)` (throws on failure) or `.safeParse(data)` (returns a result object) walks the actual data against that tree, checking each field's type/constraints. `z.infer<typeof schema>` then statically derives a TypeScript type from the same schema object, so your validation rules and your types can never drift out of sync.

**Code Example**
```ts
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
});

type Task = z.infer<typeof taskSchema>; // TypeScript type generated from the schema

const result = taskSchema.safeParse({ title: "Hi", priority: "low" });
if (!result.success) {
  console.log(result.error.issues); // [{ message: "Title must be at least 3 characters", ... }]
}
```

**With React Hook Form** (via `@hookform/resolvers`):
```tsx
import { zodResolver } from "@hookform/resolvers/zod";

const { register, handleSubmit } = useForm<Task>({
  resolver: zodResolver(taskSchema),
});
```

**Project usage**: Combined Zod + React Hook Form to validate the task creation form — title length, required due date format, valid priority enum — with one schema reused for both client validation and (potentially) shared with backend validation logic.

**Advantages**: Single source of truth for types + validation, very readable schema syntax, composable (schemas can nest/extend other schemas), great error messages.
**Disadvantages**: Adds another dependency/concept; very complex conditional validation logic can get verbose.

**Interview Questions**
1. Why is runtime validation still needed even when using TypeScript?
2. What does `z.infer<typeof schema>` do?
3. `.parse()` vs `.safeParse()` — what's the difference and when would you use each?

---

# SECTION 5: ADVANCED FRONTEND FEATURES (SECURITY)

## 5.1 JWT (JSON Web Token) & Storage Strategies

**What it is**
JWT is a compact, URL-safe token format used to represent claims (e.g., "this is user #42, logged in until 3pm") between two parties, typically issued by a backend after login and sent back with subsequent requests to prove identity.

**Why it exists**
Traditional server-side sessions require the server to store session state in memory/DB and look it up on every request. JWTs are **stateless** — all the necessary info is encoded *inside* the signed token itself, so any backend server (even a different one, in a distributed system) can verify it without a shared session store.

**How it works internally**
A JWT has three Base64URL-encoded parts separated by dots: `header.payload.signature`.
- **Header**: algorithm used (e.g., HS256).
- **Payload**: claims (user id, expiry, roles) — readable by anyone (not encrypted, just encoded!).
- **Signature**: a cryptographic signature of header+payload using a secret key the server holds — this is what makes the token **tamper-proof** (changing the payload invalidates the signature), even though the payload itself isn't hidden from anyone who decodes it.

```
Login → Backend verifies credentials → Backend signs and issues JWT
   ↓
Frontend stores JWT
   ↓
Frontend sends JWT on each request (Authorization header or cookie)
   ↓
Backend verifies signature → grants/denies access
```

**Storage Options Compared**

| Storage | XSS risk | CSRF risk | Notes |
|---|---|---|---|
| `localStorage` | High — any injected script can read it | Low (not auto-sent) | Common but discouraged for production-grade security |
| `sessionStorage` | High (same as above) | Low | Token lost when tab closes |
| `HttpOnly` Cookie | Low — JS cannot read it | Higher (auto-sent) — needs CSRF protection | Generally recommended best practice |

**Code Example**
```js
// Storing in localStorage (simple but XSS-exposed)
localStorage.setItem("token", jwt);

fetch("/api/tasks", {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
```
```
// Recommended production pattern: backend sets an HttpOnly cookie
Set-Cookie: token=eyJ...; HttpOnly; Secure; SameSite=Strict
```

**Project usage**: For the Task Dashboard's auth concept, discussed storing the JWT in an `HttpOnly` cookie set by the backend (so frontend JS never directly touches the raw token), with the backend reading it automatically on each API call.

**Advantages**: Stateless (scales easily across servers), self-contained claims, widely supported standard.
**Disadvantages**: Can't be easily "revoked" before expiry (since the server doesn't track active tokens) without extra infrastructure (blocklists, short expiry + refresh tokens); payload is readable by anyone (never put secrets in it).

**Interview Questions**
1. Why is a JWT's payload "readable but not editable"?
2. Why is storing a JWT in an `HttpOnly` cookie generally safer than `localStorage`?
3. How would you handle JWT expiry/refresh in a frontend app?
4. Can a JWT be "logged out" server-side before its expiry? Why is this tricky with pure stateless JWTs?

---

## 5.2 CSRF (Cross-Site Request Forgery)

**What it is**
An attack where a malicious site tricks a logged-in user's browser into sending an unwanted request (e.g., "transfer money", "delete account") to a legitimate site where the user is already authenticated — exploiting the fact that cookies are sent automatically.

**Why it exists (as a threat)**
Because browsers automatically attach cookies to requests to a given domain regardless of which page/site triggered the request, a hidden form or image tag on `evil.com` can silently submit a request to `yourbank.com`, and the browser will include the user's valid session cookie — making the request look legitimate to the server.

**How it works internally — Attack flow**
```
User logged into TaskApp (has session cookie)
   ↓
User visits malicious-site.com (in another tab)
   ↓
malicious-site.com auto-submits a hidden form to taskapp.com/delete-all-tasks
   ↓
Browser attaches TaskApp's cookie automatically
   ↓
TaskApp's server sees a "valid" authenticated request and executes it
```

**Defenses**
1. **CSRF tokens**: server generates a random token per session/form, embeds it in the page, and requires it to be sent back with state-changing requests — an attacker's cross-site form can't know/include this token.
2. **`SameSite` cookie attribute**: `SameSite=Strict` or `Lax` tells the browser not to send the cookie on cross-site requests at all, neutralizing most CSRF attacks at the browser level.
3. Requiring custom headers (e.g., `X-Requested-With`) on state-changing requests, since simple cross-site forms can't set custom headers.

**Code Example**
```http
Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly
```
```tsx
// CSRF token pattern: server embeds a token, frontend sends it back
fetch("/api/tasks/delete", {
  method: "POST",
  headers: { "X-CSRF-Token": csrfToken },
});
```

**Project usage**: Discussed as a security consideration for the Task Dashboard's delete/update endpoints — relying on `SameSite=Lax/Strict` cookies plus a CSRF token check on state-changing requests.

**Advantages of defenses**: `SameSite` cookies are a simple, modern, low-effort mitigation; CSRF tokens add defense-in-depth.
**Disadvantages**: `SameSite` alone may not cover every legacy browser/edge case; CSRF tokens add implementation complexity (must be generated, embedded, and validated correctly).

**Interview Questions**
1. Why does CSRF specifically exploit cookies rather than `localStorage`-based tokens?
2. What does `SameSite=Strict` vs `SameSite=Lax` actually change in browser behavior?
3. How does a CSRF token prevent an attacker's forged request from succeeding?

---

# SECTION 6: DEPLOYMENT

## 6.1 Deployment Concepts (Vercel & Netlify)

**What it is**
Vercel and Netlify are cloud platforms that take your frontend project's source code (usually from GitHub) and host it publicly on the internet, handling the build process automatically.

**Why they exist**
Running `npm run build` only produces static files on your own laptop — `http://localhost:5173` is only reachable by you. These platforms provide the missing piece: a server (CDN-backed), a public domain, automated builds, and HTTPS — all without you managing any server infrastructure yourself.

**How it works internally**
```
git push → GitHub webhook fires → Platform pulls latest code
   → Runs build command (e.g., npm run build)
   → Uploads resulting static files to a global CDN
   → Issues a public URL (and updates production domain if on main branch)
```
Both platforms detect your framework automatically (Vite/Next.js/CRA) and pick sensible build settings.

**Key Concepts**

| Concept | What it means |
|---|---|
| **Production Deploy** | Whatever is on your `main`/`production` branch becomes the live site at your main domain. |
| **Branch Deploy** (Netlify) | Each non-main branch (e.g., `feature-dark-mode`) gets its own unique preview URL automatically. |
| **Deploy Preview** | Opening a Pull Request automatically spins up a temporary live URL of that PR's changes, so teammates can test before merging. |
| **Atomic Deploys** (Netlify) | All files (HTML/CSS/JS) are uploaded and verified as a complete set *before* the site is switched live — so users never see a half-updated, broken site mid-deploy. |
| **Environment Variables** | Set per-deployment-environment (production/preview) in the platform dashboard, separate from your `.env` files in git. |

**Vercel CLI Workflow**
```bash
npm install -g vercel
vercel login
vercel          # deploy a preview
vercel --prod   # deploy to production
```

**Vercel vs Netlify**

| Feature | Vercel | Netlify |
|---|---|---|
| Best for | React & Next.js | Static sites & React |
| Next.js support | Best (made by the same company) | Limited |
| Deployment ease | Very easy | Very easy |
| GitHub integration | One-click | One-click |
| Special feature | Edge Functions, ISR for Next.js | Atomic deploys, deploy previews emphasis |

**Project usage**: The Task Management Dashboard was pushed to GitHub, then connected to Vercel for automatic deployment — every `git push` to `main` triggered a new production build at `https://task-manager.vercel.app`, and every Pull Request got its own preview URL for review before merging.

**Advantages**: Zero server management, automatic HTTPS, instant rollback to previous deploys, free tiers generous for personal/small projects, preview URLs make code review include a live visual check.
**Disadvantages**: Can get costly at scale; some platform-specific features (e.g., Vercel Edge Functions) create light vendor lock-in if used heavily.

**Interview Questions**
1. What actually happens between `git push` and your site being live on Vercel/Netlify?
2. What is a "Deploy Preview" and why is it useful in a team workflow?
3. What problem do "Atomic Deploys" solve?
4. How would you set an environment variable differently for production vs. preview deployments?

---

# SECTION 7: FOLDER STRUCTURE & TESTING

## 7.1 Feature-Based Folder Structure

**What it is**
An approach to organizing a React project's files by **feature/domain** (e.g., `features/tasks`, `features/auth`) rather than by **file type** (e.g., one giant `components/` folder, one giant `hooks/` folder) — popularized by patterns like "bulletproof-react."

**Why it exists**
In a "by type" structure, working on one feature (e.g., tasks) means jumping between `components/`, `hooks/`, `api/`, `types/` folders scattered across the project. A feature-based structure keeps everything related to one feature physically together, making the codebase easier to navigate, scale, and safely delete/refactor (deleting a feature folder removes everything related to it).

**Example Structure**
```
src/
├── app/                  # app-wide setup: routing, providers
├── features/
│   ├── tasks/
│   │   ├── components/   # TaskCard, TaskList, TaskForm
│   │   ├── hooks/        # useTasks, useCreateTask
│   │   ├── api/          # fetchTasks, createTask
│   │   └── types.ts
│   └── auth/
│       ├── components/
│       ├── hooks/
│       └── api/
├── components/           # truly shared/reusable UI (Button, Modal)
├── hooks/                # truly shared hooks
└── lib/                  # utilities, config
```

**Project usage**: The Task Management Dashboard organized `features/tasks` (list, form, card, hooks, API calls) separately from `features/auth` and a small shared `components/` folder for generic UI like buttons and modals.

**Advantages**: Easier to scale with more features/developers, related code stays co-located, easier to reason about ownership boundaries.
**Disadvantages**: Requires more upfront discipline/agreement on conventions; can feel like overkill for very small projects.

**Interview Questions**
1. Why might feature-based folder structure scale better than type-based structure for a large app?
2. What's a sensible rule for deciding whether something belongs in a shared `components/` folder vs inside a feature folder?

---

## 7.2 Testing with Vitest & React Testing Library

**What it is**
- **Vitest**: A fast unit-test runner built to integrate natively with Vite (same config, same transform pipeline), used to run and assert test logic.
- **React Testing Library (RTL)**: A testing utility for React components that encourages testing components the way a *user* would interact with them (clicking, typing, reading visible text) rather than testing internal implementation details (state, internal methods).

**Why they exist**
Tests that rely on internal implementation details (e.g., checking a component's internal state directly) break every time you refactor *how* something works, even if *what it does* for the user hasn't changed. RTL's philosophy — "test behavior, not implementation" — produces tests that are more resilient to refactors and more confidence-inspiring (they verify real user-facing behavior).

**How it works internally**
RTL renders your component into a real (virtual) DOM using `jsdom`, then gives you query functions (`getByText`, `getByRole`, `getByLabelText`) that search the rendered DOM the same way a screen reader or visual user would locate elements — by visible text or accessible role, not by CSS class or internal component name. Vitest provides the test runner, assertion library (`expect`), and mocking utilities, with near-identical API to Jest but much faster startup since it reuses Vite's transform pipeline.

**Code Example**
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaskForm from "./TaskForm";

describe("TaskForm", () => {
  it("shows a validation error when title is empty", () => {
    render(<TaskForm onSubmit={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /add task/i }));

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it("calls onSubmit with the entered task title", () => {
    const handleSubmit = vi.fn();
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Learn Testing" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Learn Testing" })
    );
  });
});
```

**Project usage**: Wrote tests for the Task Dashboard's `TaskForm` (validation errors), `TaskList` (renders correct number of tasks), and `useTasks` hook (returns expected loading/error/data states) using Vitest + RTL.

**Advantages**: Fast feedback loop (Vitest is quick), tests resilient to refactors (RTL's user-centric queries), `getByRole`/`getByLabelText` queries double as an accessibility check (if you can't query it accessibly, real users with assistive tech can't use it either).
**Disadvantages**: Initial learning curve around RTL's query priorities; mocking complex async data flows (like TanStack Query) requires extra setup (test query client, MSW for mocking network requests).

**Interview Questions**
1. What is RTL's core testing philosophy, summarized in one line? ("Test the way users use your app.")
2. Why is `getByRole` generally preferred over `getByTestId` when possible?
3. How does Vitest differ from Jest, and why is it often faster in a Vite project?
4. How would you test a component that fetches data with TanStack Query?

---

# SECTION 8: PROJECT TIE-TOGETHER — TASK MANAGEMENT DASHBOARD

All Week 3 concepts were applied hands-on through one project. Summary of what was implemented:

| Concept Area | Applied As |
|---|---|
| TypeScript | Typed `Task`, props, API responses |
| Hooks | `useState`/`useEffect`/`useRef`/`useMemo`/`useCallback`/`useReducer` for task CRUD & UI logic |
| Error Boundaries | Wrapped chart/analytics widget |
| Re-render optimization | `React.memo` + `useCallback` on `TaskCard` list |
| Context API | Theme (light/dark), current user |
| Redux Toolkit / Zustand | Centralized task list, filters, sort order |
| React Router | `/tasks`, `/tasks/:id` dynamic routing |
| Theme switching | CSS variables + Context + `localStorage` |
| Env variables | `VITE_API_URL` for dev vs prod backend |
| TanStack Query | Fetching, caching, mutating tasks |
| Async/Await + Error handling | All API calls, with toast feedback |
| Responsive design | Grid/Flexbox + media queries for sidebar/dashboard |
| Accessibility + ARIA | Labels, `aria-label`s, `aria-live` toast announcements |
| Secure storage | Theme in `localStorage`, draft form in `sessionStorage` |
| Chart.js | Pie/bar charts for task status analytics |
| React Hook Form + Zod | Task creation/edit form with schema validation |
| JWT + CSRF | Discussed `HttpOnly` cookie storage and `SameSite`/CSRF-token defenses |
| Deployment | Pushed to GitHub, deployed via Vercel with preview deploys per PR |
| Folder structure | Feature-based (`features/tasks`, `features/auth`) |
| Testing | Vitest + RTL for form validation and rendering behavior |

---

# SECTION 9: CONSOLIDATED INTERVIEW QUESTION BANK

**React & Hooks**
1. Why must hooks be called in the same order on every render?
2. `useMemo` vs `useCallback` — explain with an example.
3. When would you reach for `useReducer` instead of `useState`?
4. What does `React.memo` compare, and what breaks it?
5. What errors do Error Boundaries NOT catch?

**State Management**
6. Context API vs Redux Toolkit vs Zustand — when would you pick each?
7. How does Redux Toolkit use Immer, and why?
8. What is prop drilling, and what are two ways to solve it?

**Routing**
9. How does React Router avoid full-page reloads?
10. How would you implement a protected/private route?

**API & Data**
11. Why is TanStack Query described as managing "server state" specifically?
12. What does `queryKey` do, and why is it an array?
13. How does `await` work under the hood with the JS event loop?

**Accessibility**
14. What does WCAG's POUR stand for?
15. What's the "first rule of ARIA"?
16. Why is `<button>` better than `<div onClick>` for accessibility?

**Security**
17. Why is storing a JWT in `localStorage` risky compared to an `HttpOnly` cookie?
18. How does `SameSite=Strict` mitigate CSRF?
19. Why can't a JWT be easily "revoked" before its expiry?

**Forms**
20. Why does React Hook Form cause fewer re-renders than controlled `useState` inputs?
21. Why use Zod alongside TypeScript instead of TypeScript alone?

**Deployment & Testing**
22. What is an "Atomic Deploy" and what problem does it solve?
23. What's RTL's core testing philosophy?
24. Vitest vs Jest — why is Vitest often faster in a Vite app?

---

# FINAL SUMMARY

Week 3 covered the full lifecycle of building a **production-grade React frontend**: advanced component patterns (TypeScript + the full hooks family), scalable state management (Context API, Redux Toolkit, Zustand), client-side routing (including dynamic routes), efficient and cached data fetching (TanStack Query) with proper async/error handling, responsive and accessible UI (WCAG/ARIA), secure client-side storage practices, data visualization (Chart.js), robust form handling and validation (React Hook Form + Zod), authentication/security fundamentals (JWT storage strategies, CSRF defenses), real-world deployment workflows (Vercel/Netlify), and maintainable project structure with automated testing (Vitest + React Testing Library).

All of these were practiced together inside a single real project — the **Task Management Dashboard** — turning theoretical concepts into hands-on, interview-ready experience.

---
*End of Week 3 Study Material.*