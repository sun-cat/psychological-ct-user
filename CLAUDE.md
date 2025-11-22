# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a psychological counseling testing (CT) user interface application based on **Art Design Pro v3.0.0**, a Vue 3 + TypeScript + Vite admin template. Built with Element Plus and Tailwind CSS, featuring modular architecture with dynamic routing, role-based access control, and questionnaire/assessment functionality.

**Art Design Pro** is a modern admin template with:

- Object-oriented route registration system
- Comprehensive component library (forms, tables, charts, cards, banners)
- Multi-theme support (light/dark/follow system)
- Internationalization (i18n)
- Advanced table hooks (`useTable`) with LRU caching
- Role-based permissions with custom directives (`v-auth`, `v-roles`)

**Official Documentation**: https://www.artd.pro/docs/zh/ (Chinese)

## Development Commands

**Start development server:**

```bash
pnpm dev
```

Opens browser automatically at configured port (default from .env.development).

**Build for production:**

```bash
pnpm build
```

Runs TypeScript type checking (`vue-tsc --noEmit`) before building. Production builds remove console logs and debuggers.

**Preview production build:**

```bash
pnpm serve
```

**Linting and formatting:**

```bash
pnpm lint              # Run ESLint
pnpm fix               # Auto-fix ESLint issues
pnpm lint:prettier     # Format with Prettier
pnpm lint:stylelint    # Lint and fix styles
```

**Git commits:**

```bash
pnpm commit            # Interactive commit with Commitizen
```

Uses `cz-git` for conventional commits. Husky runs lint-staged pre-commit hooks.

## Environment Configuration

Environment variables are in `.env.development` (dev) and should have corresponding `.env.production` (prod):

- `VITE_BASE_URL`: Application base path (e.g., `/` or `/admin/`)
- `VITE_API_URL`: API request prefix (e.g., `/dev-api`)
- `VITE_API_PROXY_URL`: Backend proxy target (dev only, configured in vite.config.ts)
- `VITE_APP_CLIENT_ID`: Client identification header

The dev proxy configuration in `vite.config.ts` forwards requests matching `VITE_API_URL` to `VITE_API_PROXY_URL`.

## Architecture

### Router System

The routing system uses a sophisticated dynamic registration pattern:

1. **Static Routes** (`src/router/routes/staticRoutes.ts`): Login, exception pages (404, 500), and other non-authenticated routes
2. **Dynamic Routes** (`src/router/modules/`): Modular route definitions exported from `src/router/modules/index.ts` as `routeModules`
3. **Route Registration Flow**:
   - Routes are NOT registered until user successfully logs in
   - `beforeEach` guard in `src/router/guards/beforeEach.ts` handles registration
   - `RouteRegistry` (src/router/core/RouteRegistry.ts) manages dynamic route addition/removal
   - Routes are transformed via `RouteTransformer` and validated by `RouteValidator`
   - `ComponentLoader` (src/router/core/ComponentLoader.ts) dynamically imports view components

**Component path resolution:**

- Route definitions use paths like `/questionnaire/console`
- `ComponentLoader` resolves to `src/views/questionnaire/console/index.vue` or `src/views/questionnaire/console.vue`
- Layout container is always `/index/index` which maps to `src/views/index/index.vue`

### HTTP Request Layer

Centralized HTTP client in `src/utils/http/index.ts`:

- Built on Axios with comprehensive interceptors
- Automatic token injection via `Authorization: Bearer {token}` header
- Automatic `clientid` header from env variable
- 401 handling with debounced logout (3s debounce to prevent multiple triggers)
- Request retry logic for 5xx errors (configurable, default: 0 retries)
- Unified response format: `{ code, msg, data }` or `{ code, msg, total, rows, ... }`
- API methods: `api.get()`, `api.post()`, `api.put()`, `api.del()`, `api.request()`
- Extended config options: `showErrorMessage`, `showSuccessMessage`

**API structure:**

- API functions in `src/api/` (e.g., `auth.ts`, `questionnaire.ts`, `system-manage.ts`)
- All use centralized `request` utility from `@/utils/http`

### State Management

Pinia stores in `src/store/modules/`:

- `user.ts`: Authentication state, user info, login/logout
- `menu.ts`: Menu data and dynamic route management
- `setting.ts`: Application settings (theme, language, layout, etc.)
- `worktab.ts`: Work tab management (browser-like tabs for navigation)
- `table.ts`: Table state management
- `audio.ts`: Global audio playback state (ensures single audio instance)

**Persistence:**

- Uses `pinia-plugin-persistedstate` with localStorage
- `StorageKeyManager` generates versioned keys: `sys-v{version}-{storeId}`
- Automatic data migration across versions

### View Structure

Views follow a modular pattern:

- `src/views/index/index.vue`: Main layout container (sidebar, header, content area, tabs)
- `src/views/questionnaire/`: Questionnaire/assessment related views
  - `console`: Main dashboard/listing
  - `answer/:id`: Individual questionnaire answering interface
- `src/views/system/`: System management (users, roles, menus)
- `src/views/auth/login/`: Authentication pages

### Component Organization

Auto-imported components via `unplugin-vue-components`:

- `src/components/core/`: Reusable core components (forms, layouts, charts, cards, banners)
- `src/components/business/`: Business-specific components
- Element Plus components are auto-imported on demand

Component types auto-generated in `src/types/import/components.d.ts`.

### Type System

- Auto-imported Vue APIs and composables (types in `src/types/import/auto-imports.d.ts`)
- Application types should be defined in `src/types/`
- TypeScript paths configured in `tsconfig.json`:
  - `@/*` → `src/*`
  - `@views/*` → `src/views/*`
  - `@imgs/*` → `src/assets/images/*`
  - `@icons/*` → `src/assets/icons/*`
  - `@utils/*` → `src/utils/*`
  - `@stores/*` → `src/store/*`
  - `@styles/*` → `src/assets/styles/*`

### Internationalization

- Vue I18n for multi-language support
- Language files in `src/locales/langs/` (e.g., `en.json`, `zh.json`)
- Access via `$t()` function (auto-imported)

## Key Patterns

### Adding a New Route Module

1. Create route definition in `src/router/modules/{module-name}.ts`:

```typescript
import { AppRouteRecord } from '@/types/router'

export const myRoutes: AppRouteRecord = {
  path: '/my-module',
  name: 'MyModule',
  component: '/index/index', // Layout container
  meta: { title: 'menus.myModule.title', icon: 'ri:icon-name', roles: ['R_SUPER'] },
  children: [
    {
      path: 'page',
      name: 'MyPage',
      component: '/my-module/page', // Maps to src/views/my-module/page/index.vue
      meta: { title: 'menus.myModule.page', keepAlive: true }
    }
  ]
}
```

2. Export from `src/router/modules/index.ts`:

```typescript
import { myRoutes } from './my-module'
export const routeModules: AppRouteRecord[] = [..., myRoutes]
```

3. Routes are automatically registered on login via the `beforeEach` guard

### Creating API Functions

```typescript
// src/api/my-api.ts
import request from '@/utils/http'

export interface MyParams {
  id: string
  data: string
}

export function getMyData(id: string) {
  return request.get<MyResponseType>({
    url: '/my-endpoint/' + id
  })
}

export function submitMyData(data: MyParams) {
  return request.post<any>({
    url: '/my-endpoint',
    data,
    showSuccessMessage: true // Show success toast
  })
}
```

### Working with Stores

```typescript
import { useMyStore } from '@/store/modules/my-store'

const myStore = useMyStore()
myStore.someAction()
```

Stores using the composition API pattern with `defineStore(() => { ... })`.

## Build Optimization

- Dynamic imports for views (route-level code splitting)
- Element Plus auto-import with tree-shaking
- Gzip compression enabled (threshold: 10KB)
- Terser for production minification
- Bundle analyzer available (uncomment `visualizer` plugin in vite.config.ts)
- Pre-optimization of common dependencies in `optimizeDeps` (echarts, xlsx, xgplayer, etc.)

## Important Notes

- **Version 3.0.0 Breaking Changes** (2025-11-09):
  - Style system migrated from Sass to Tailwind CSS
  - Icon library changed from Iconfont to Iconify (use `@iconify/vue`)
  - Route registration system completely refactored with OOP design
  - Package size reduced by 1.3 MB

- Production builds automatically remove `console` and `debugger` statements
- SCSS global variables and mixins auto-injected from `@styles/core/el-light.scss` and `@styles/core/mixin.scss`
- Node version: >=20.19.0, pnpm: >=8.8.0 (enforced in package.json)
- Route guards handle 401 errors automatically - HTTP layer triggers logout on unauthorized
- Menu data can be loaded from backend or frontend (configured in `MenuProcessor`)
- Work tabs persist across sessions via Pinia persistence

## Key v3.0 Features

**useTable Hook** (introduced v2.5.0):

- Powerful table data management with automatic pagination
- LRU-based intelligent caching
- Response body auto-recognition (configurable in `src/utils/table/tableConfig.ts`)
- Type inference without manual type passing
- Column configuration with dynamic updates
- Methods: `getData()`, `refreshCreate()`, `refreshUpdate()`, `refreshRemove()`, `clearCache()`, etc.
- Four cache invalidation strategies: `CLEAR_ALL`, `CLEAR_CURRENT`, `CLEAR_PAGINATION`, `KEEP_ALL`
- Debounced search support with `getDataDebounced()`
- Lifecycle hooks: `onSuccess`, `onError`, `onCacheHit`
- Data transformation support via `dataTransformer` and `responseAdapter`
- Dynamic column management: `addColumn()`, `removeColumn()`, `toggleColumn()`, `updateColumn()`

**Permission System**:

- `v-auth`: Button-level permission directive using `authMark`
- `v-roles`: Role-based visibility control (e.g., `['R_SUPER', 'R_ADMIN']`)
- Configure in route meta: `meta.roles` and `meta.authList`

**Configuration Files**:

- `src/config/setting.ts`: System default settings (theme, layout, etc.) - supports one-click reset
- `src/config/fastEnter.ts`: Quick entry configuration (if exists)
- `src/utils/table/tableConfig.ts`: Global table pagination field mapping

## Backend Integration Guide

### API Response Format

Default response structure (modify in `src/types/common/response.ts`):

```typescript
interface BaseResponse<T = unknown> {
  code: number // Status code
  msg: string // Message
  data: T // Data payload
}
```

HTTP requests return `data` field by default, not the entire response body.

### Menu Interface Integration

Configure permission mode in `.env`:

```env
VITE_ACCESS_MODE = backend  # frontend or backend
```

**Backend mode menu format:**

```typescript
{
  code: 200,
  msg: "success",
  data: [
    {
      name: 'Dashboard',
      path: '/dashboard',
      component: "/index/index",
      meta: {
        title: 'menus.dashboard.title',
        icon: 'ri:pie-chart-line'
      },
      children: [...]
    }
  ]
}
```

**Frontend mode** uses `asyncRoutes.ts` with `roles` field for filtering:

```typescript
{
  meta: {
    roles: ['R_SUPER', 'R_ADMIN'] // Access control
  }
}
```

### Table Pagination Interface

Configuration in `src/utils/table/tableConfig.ts`:

System auto-detects these field names (in order of priority):

- **Records**: `list`, `data`, `records`, `items`, `result`, `rows`
- **Total**: `total`, `count`
- **Current page**: `current`, `page`, `pageNum`
- **Page size**: `size`, `pageSize`, `limit`

Request parameters:

```typescript
paginationKey: {
  current: "current",  // Current page
  size: "size"         // Page size
}
```

Add custom field names to the arrays if backend uses different naming.

## Common Development Issues

### Page Blank on Route Switch

**Cause:** Vue `<Transition>` requires single root element in components.

**Solution:** Wrap all content in a single container element. Comments outside root element also cause this issue.

❌ Wrong:

```vue
<template>
  <!-- Comment causing issue -->
  <div>Content1</div>
  <span>Content2</span>
</template>
```

✅ Correct:

```vue
<template>
  <div>
    <!-- Comment inside root -->
    <div>Content1</div>
    <span>Content2</span>
  </div>
</template>
```

### Page Auto-Refresh on Menu Click (Dev Mode)

**Cause:** Vite dependency pre-optimization. When using new component library submodules, Vite re-optimizes causing refresh.

**Solution:** Add dependencies from console output to `vite.config.ts`:

```typescript
export default defineConfig({
  optimizeDeps: {
    include: [
      'element-plus/es/components/tooltip/style/index',
      'element-plus/es/components/message/style/index'
      // Add other dependencies as needed
    ]
  }
})
```

Restart dev server after adding. This only affects development mode.

### Router Configuration Errors

Check browser console (F12) for detailed error messages about missing fields, incorrect formats, or non-existent component paths.

## Build Information

- **Complete version**: ~8.4MB
- **Lite version**: ~4.7MB
- **Without gzip**: ~3.7MB (gzip enabled by default, browsers load .gz files)

Configure compression in `vite.config.ts` via `viteCompression` plugin.
