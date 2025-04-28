# 📋 Remaining Task List

These subtasks capture every remaining step before publishing **key-cycler** v0.1.0.

---

## 1. Documentation Updates

[x] **1.a** Add an “Integration Test” usage example to **README.md**, pointing at `tests/integration/keyCycler.test.ts`.  
[x] **1.b** Revise **NAMING.md** if any environment-variable or file-naming conventions have changed or need clarification.  

---

## 2. Package Publication (v0)

[x] **2.a.1** Bump `"version"` to `0.1.0`.  
[x] **2.a.2** Point `"main"` → `dist/index.js`, `"module"` → `dist/index.esm.js`, `"types"` → `dist/index.d.ts`.  
[x] **2.a.3** Add `"files": ["dist"]`.  
[x] **2.a.4** Populate a `"keywords"` array (e.g. `["api","key","rotation","rate-limit"]`).  
[x] **2.a.5** Ensure `"repository"` and `"licence"` fields are correct.  

### 2.b Update **tsconfig.json**  
[x] **2.b** Enable `"declaration": true` and set `"outDir": "dist"` so that `.js` and `.d.ts` files are emitted into `dist/`.  

### 2.c Add npm scripts to **package.json**  
[x] **2.c.1** Add `"build": "tsc"`.  
[x] **2.c.2** Add `"prepare": "npm run build"`.  
[x] **2.c.3** Verify `"test"` still runs Vitest.  

### 2.d Build and verify artifacts  
[x] **2.d** Run `npm run build` and confirm that `dist/` contains the compiled `.js` and `.d.ts` files.  

### 2.e Tag and publish  
[x] **2.e** Create Git tag `v0.1.0` and run `npm publish --access public` so the package is installable as `key-cycler@0.1.0`.  

---

## 3. Repository & Packaging Hygiene

[x] **3.a** Ensure a **LICENCE** file (MIT) exists in the repo root and that the `"licence"` field in `package.json` matches.  
[ ] **3.b** Remove any `"private": true` from `package.json`.  
[ ] **3.c** Add `/dist/` to **.gitignore** to prevent committing build artefacts.  

---

## 4. README & Documentation Polish

[ ] **4.a** Add an **Installation** section to **README.md**, for example:
```bash
npm install key-cycler@0.1.0
# or
yarn add key-cycler@0.1.0
```
[ ] **4.b** Insert badges at the top of **README.md** for:
- Licence  
- Build/Test status  
- npm version & download counts  

---

## 5. Code Quality

### 5.a Add ESLint configuration  
[ ] **5.a.1** Install ESLint (and TypeScript plugin) as dev-dependencies.  
[ ] **5.a.2** Create an ESLint config file (`.eslintrc.js` or `.eslintrc.json`).  
[ ] **5.a.3** Define or generate lint rules (e.g. via `npx eslint --init`).  
[ ] **5.a.4** Verify ESLint loads and flags style issues.  

### 5.b Create and verify `npm run lint`  
[ ] **5.b.1** Add `"lint": "eslint 'src/**/*.ts' 'lib/**/*.ts' --max-warnings=0'"` to `package.json`.  
[ ] **5.b.2** Run `npm run lint` and fix all violations.  
[ ] **5.b.3** Confirm lint still passes after a fresh `npm install`.  

### 5.c Integrate linting into workflow  
[ ] **5.c.1** Choose and install a pre-commit hook manager (e.g. Husky).  
[ ] **5.c.2** Configure a pre-commit hook to run `npm run lint`.  
[ ] **5.c.3** Test that the hook blocks commits when lint errors are present.  
[ ] **5.c.4** Document the hook setup/usage in your README or dev notes.  