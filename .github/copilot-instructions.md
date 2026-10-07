# Copilot cloud agent — BreakingNewGround

## What this repository does
"Breaking new ground projects" is a **medicines/pharmacy inventory + photo library** application. It has an Angular web app and a .NET backend. The two main data domains are **Medicines** (stock, expiration dates, types) and a tagged **Image** library (with thumbnails and favorites). Weather is a small demo endpoint. There is **no CI/CD pipeline** in this repo (`.github/workflows` is empty), so nothing runs automatically on push — you are responsible for building and validating any change yourself.

## Stack & versions (validated)
- **.NET SDK 10.0.401**, .NET 10 (net10.0), ASP.NET Core 10, EF Core 10, Entity Framework Core DynamicLINQ.
- **Node v26.3.0, npm 12.1.0** for the client (Angular 22 + Angular Material).
- Databases: **Azure SQL Server** (production source of truth) and **SQLite** (local dev + image backup).
- **Aspire** (`BreakingNewGround.AppHost`, Aspire SDK 9.2.0) for local orchestration/debugging.
- Auth: **JWT Bearer** (HS512, `SecurityAlgorithms.HmacSha512`) + **Argon2id** password hashing (package `Konscious.Security.Cryptography.Argon2`).
- Images processed with **Six Labors ImageSharp 3.x**.
- Hybrid cache (`Microsoft.Extensions.Caching.Hybrid`) stores refresh tokens.

## Project layout
```
BreakingNewGround.slnx                    Solution (slnx format)
.github/copilot-instructions.md           These instructions
CLAUDE.md                                 Behavioral guidelines for LLM agents (read + follow)
README.md                                 Nearly empty (one line)
BreakingNewGround.AppHost/                 Aspire AppHost — starts/composes the services
BreakingNewGround.Server/                  Web API + SPA proxy (the main service)
  Controllers/         ImageController, Medicine*, MedicineBodyType*, MedicineType*, WeatherForecast, Account (auth)
  Services/            ImageService, GenericCrudService<T>, ImageProcessor, password hasher, weather
  Attributes/          ImmutableResponseCacheAttribute
  Models/              DTOs (JwtSettings, PagedResult, RequestFilter/Order, enums, auth, image)
  Properties/          launchSettings.json (http https container profiles), UserSecretsId
BreakingNewGround.ServiceDefaults/         OpenTelemetry (AIOps) shared config
breakingnewground.client/                   Angular v22 frontend
  src/app/            app.module, app-routing.module, tabs/{images,medicines,weatherforecast},
                      login, register, dialog, guards/auth.guard, interceptors/jwt.interceptor, services/auth.service
BreakingNewGround.Server.DAL.AzureSQL/      Production EF Core context (Images, ImageBytes, Tag, Medicine*, ApplicationUser) + migrations
BreakingNewGround.Server.DAL.SQLite/       Local EF Core context (Medicines only) + migrations; uses Medicines.sqlite
BreakingNewGround.Server.DAL.BackupApp/    Console app: copies Azure SQL Medicines + Images into SQLite DBs for backup
```

### Architecture & data flow (important)
- **Source of truth is Azure SQL.** `BreakingNewGround.Server` connects via `AppDbContext` to Azure SQL and runs the API.
- **Medicines live in Azure SQL** (`Medicine`, `MedicineBodyType`, `MedicineType`, `ExpirationDateIsClose` view).
- **Images are the exception**: because they store binary blobs (`ImageBytes.Original`/`Thumbnail`), a local SQLite copy (`BreakingNewGround.Server.DAL.SQLite` + `BackupApp`) mirrors them. `BackupApp` copies **Medicines** from Azure SQL into the SQLite medicines DB and **Images (with tags + bytes)** into the SQLite images DB.
- `GenericCrudService<T>` / `GenericCrudController<T>` provide a **generic CRUD** (`GET/POST/PUT/DELETE`) for medicines and other entities, using DynamicLINQ for filters/sorting. Routes use `long` IDs.
- `ImageService` deduplicates uploads by **SHA-256** of file bytes, generates a **thumbnail** via ImageSharp, stores bytes in `ImageBytes`, and exposes neighbours-by-timestamp, tag search/suggestions, favorite toggle, and original/thumbnail download.
- **Auth**: access token is stored in `localStorage['jwt']`; refresh token is stored in an **HttpOnly cookie**. `auth.guard.ts` redirects to `/login` if not authenticated; `jwt.interceptor.ts` skips `/api/account/login` and `/api/account/register`, attaches the token, and redirects to `/login` on 401.

## How to build & validate (validated commands)
Run from repo root `D:\Cloud Mail.Ru\Projects\BreakingNewGround`.

**Build the server (reference command, always run before validating a backend change):**
```
dotnet build BreakingNewGround.Server\BreakingNewGround.Server.csproj --nologo -v m
```
Expected: `Build succeeded. 0 Warning(s). 0 Error(s).` (~2–3 s after restore).
> NOTE: the shell may print a `dotnet :` welcome banner and return exit code 1 — that is only the first-run .NET welcome message, **not** a build failure. Confirm by the "Build succeeded" line.
> Alternative single-project build: `dotnet build BreakingNewGround.Server.csproj -p:BuildProjectReferences=false --nologo -v m`

**Type-check the Angular client (always run after touching client code):**
```
npx --prefix "D:/Cloud Mail.Ru/Projects/BreakingNewGround/breakingnewground.client" tsc --noEmit -p "D:/Cloud Mail.Ru/Projects/BreakingNewGround/breakingnewground.client/tsconfig.json"
```
Run `npm run build` (Angular) from `breakingnewground.client` to produce a production bundle for the SPA proxy to serve.

**Run the server (Development profile serves the API + SPA via proxy on `https://localhost:7141`, http on 5283):**
```
dotnet run --project BreakingNewGround.Server
```
The SPA proxy (`Microsoft.AspNetCore.SpaProxy`, configured in `.csproj` with `RequireHttpsMetadata=true`) requires **HTTPS**; run `dotnet dev-certs https --trust` once if the certificate is untrusted. `proxy.conf.js` forwards `/api`, `/openapi`, `/scalar` to the API.

**Add a database migration (server-side only; backend + DAL.AzureSQL):**
```
dotnet ef migrations add <Name> --project BreakingNewGround.Server.DAL.AzureSQL\BreakingNewGround.Server.DAL.AzureSQL.csproj --startup-project BreakingNewGround.Server\BreakingNewGround.Server.csproj
```
This requires `DefaultConnectionAzureSQL` connection string + `Jwt.Key/Issuer/Audience` to be set (via User Secrets or environment). The SQLite DAL uses `DefaultConnectionSQLite` (`Medicines.sqlite`) and needs no Azure connection.

## Configuration & environment
- Connection strings and JWT settings live in **User Secrets**, not in `appsettings.json` (the values there are empty placeholders). `UserSecretsId` is `0e7760b9-8545-44ae-a355-534433a495a4`.
- `appsettings.json` only has placeholder values; the real config is expected from environment/User Secrets. Set `ConnectionStrings:DefaultConnectionAzureSQL`, `Jwt.Key` (min 32 chars), `Jwt.Issuer`, `Jwt.Audience`, and optionally `ConnectionStrings:DefaultConnectionSQLite`.
- `.dockerignore` and `.gitignore` exclude `bin`, `obj`, `node_modules`, `.vs`, `.claude`, `ServiceDependencies`, and Azure publish secrets.
- `ServiceDependencies/*.json` (in `.gitignore`) describe the Azure deployment targets.

## Known limitations & gotchas (known before you start)
- **`POST /api/account/register` is NOT implemented** — the body throws `NotImplementedException` with the real logic commented out. Do not expect registration to work; the client sends the request but the server rejects it. Do not "fix" it unless asked.
- `AccountController.GetToken` uses `GetOrCreateAsync` with a **null default value** — this is pre-existing behavior, not something to repair.
- `ImmutableResponseCacheAttribute` only sets cache headers on 2xx responses; 404/401 are not cached.
- `appsettings` Weather cities contain Cyrillic names; the weather endpoint is a demo (OpenMeteo) with a 15-minute cache.
- The DAL `SQLite` project ships committed `Medicines.sqlite` and `Meme database.sqlite` files.
- `.claude/settings.local.json` whitelists the exact build/typecheck/migration commands used in this repo — the validated commands above match it.

## Guidance
Follow `CLAUDE.md` in the repo root (simplicity first, surgical changes, verify with goals). Keep changes minimal and compiling. Always run the build (and `tsc --noEmit` for frontend changes) to validate before finishing. Search the codebase only if the information here is incomplete or turns out to be wrong.
