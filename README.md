# LoanPro API Test Automation

API test automation suite for the LoanPro SDET interview challenge. Built with **TypeScript**, **Playwright**, and **Allure** reporting.

The suite validates the LoanPro Users API (`GET`, `POST`, `PUT`, `DELETE`) against a local Docker instance of the application.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (to run the LoanPro API locally)

## Clone and Install

1. Clone the repository:

```bash
git clone https://github.com/iberecamara/loanpro.git
cd loanpro
```

2. Install dependencies:

```bash
npm install
```

No browser installation is required — these are API tests that use Playwright's `APIRequestContext`.

## Environment Variables and `.env` Files

Configuration is loaded by `src/configs/environment.config.ts` using [dotenv](https://github.com/motdotla/dotenv) and validated with [Joi](https://joi.dev/).

Two files are merged at startup, in order:

1. `.env` — shared settings for all environments
2. `.env.<environment>` — environment-specific overrides (`.env.dev` or `.env.prod`)

Values from the environment-specific file override shared values. All variables must use `KEY=value` format.

If `APPLICATION_ENVIRONMENT` is not set before tests run, it defaults to `dev`.

### `.env` (shared settings)

Create this file in the project root:

```env
WORKERS=4
BASE_URL=http://localhost:3000
APPLICATION=LoanPro
LOG_CONSOLE=true
LOG_TYPE=text
LOG_LEVEL=debug
LOG_TIMESTAMP_FORMAT=YYYY-MM-DD HH:mm:ss
LOG_LINE_LENGTH=100
```

### `.env.dev`

```env
AUTH_TOKEN=<your-dev-token>
```

### `.env.prod`

```env
AUTH_TOKEN=<your-prod-token>
```

> **Note:** The `AUTH_TOKEN` value is provided by LoanPro. See the [challenge gist](https://gist.github.com/danielsilva-loanpro/db5fa96d70551c64f649e0faa79bf587) for details.

### Variable reference

| Variable | Required | Description |
| --- | --- | --- |
| `APPLICATION` | Yes | Application name used in reports |
| `APPLICATION_ENVIRONMENT` | Yes | Target environment: `dev` or `prod` |
| `BASE_URL` | Yes | Base URL of the running API (e.g. `http://localhost:3000`) |
| `AUTH_TOKEN` | Yes | Bearer token for authenticated delete requests. See the [challenge gist](https://gist.github.com/danielsilva-loanpro/db5fa96d70551c64f649e0faa79bf587). |
| `WORKERS` | No | Number of parallel Playwright workers |
| `LOG_CONSOLE` | No | Enable console logging (`true` / `false`) |
| `LOG_TYPE` | No | Log format: `text` or `json` |
| `LOG_LEVEL` | No | Log level: `info`, `debug`, `warn`, `error`, `trace` |
| `LOG_TIMESTAMP_FORMAT` | No | Timestamp format for log entries |
| `LOG_LINE_LENGTH` | No | Length of log section dividers |

Derived URLs are built automatically from `BASE_URL` and `APPLICATION_ENVIRONMENT`:

- API base: `{BASE_URL}/{APPLICATION_ENVIRONMENT}`
- Users endpoint: `{BASE_URL}/{APPLICATION_ENVIRONMENT}/users`

## Start the LoanPro API

The tests expect the LoanPro API to be running on port **3000**. Start it with Docker:

```bash
npm run launch
```

Or manually:

```bash
docker run -p 3000:3000 ghcr.io/danielsilva-loanpro/sdet-interview-challenge:latest
```

Verify the API is ready:

```bash
curl http://localhost:3000/dev/users
```

## Running Tests

The `test:*` npm scripts set `APPLICATION_ENVIRONMENT` and run the full suite in one command.

| Script | Platform | Description |
| --- | --- | --- |
| `test:dev:linuxmac` | Linux / macOS | Sets `APPLICATION_ENVIRONMENT=dev` and runs all tests |
| `test:prod:linuxmac` | Linux / macOS | Sets `APPLICATION_ENVIRONMENT=prod` and runs all tests |
| `test:dev:windows` | Windows | Sets `APPLICATION_ENVIRONMENT=dev` and runs all tests |
| `test:prod:windows` | Windows | Sets `APPLICATION_ENVIRONMENT=prod` and runs all tests |

### Linux / macOS

```bash
# Run against dev environment (default)
npm run test:dev:linuxmac

# Run against prod environment
npm run test:prod:linuxmac
```

### Windows

```cmd
# Run against dev environment (default)
npm run test:dev:windows

# Run against prod environment
npm run test:prod:windows
```

### Run all tests (uses current `APPLICATION_ENVIRONMENT`)

```bash
npm test
```

If `APPLICATION_ENVIRONMENT` is not set, it defaults to `dev`.

### Run a specific test file

```bash
npm test -- src/tests/users/create-user.spec.ts
```

### Run tests by tag

```bash
npm test -- --grep @LOANPRO-0001
```

## Reports and Artifacts

After a test run, reports and logs are written to the `artifacts/` directory.

| Command | Description |
| --- | --- |
| `npm run report:generate` | Generate the Allure HTML report |
| `npm run report:open` | Open the Allure report in the browser |
| `npm run report` | Generate and open the Allure report |
| `npm run report:export` | Generate a single-file Allure report |
| `npm run clean` | Remove the `artifacts/` directory |

Report locations:

- **Allure results:** `artifacts/reports/allure/allure-results`
- **Allure report:** `artifacts/reports/allure/allure-report`
- **Playwright HTML report:** `artifacts/reports/html`
- **JSON report:** `artifacts/reports/json/report.json`
- **Execution logs:** `artifacts/logs/`

## Project Structure

```
src/
├── api/              # API client classes (HTTP interactions)
├── configs/          # Playwright and environment configuration
├── data/
│   ├── constants/    # Shared constants
│   └── types/        # TypeScript interfaces and types
├── exceptions/       # Custom exceptions
├── fixtures/         # Playwright fixtures (API, logging, steps, matchers)
├── global/           # Global teardown hooks
├── steps/            # Reusable test step helpers
├── tests/            # Test specifications
└── utils/            # Shared utilities (logging, strings, numbers, etc.)
```

### Architecture overview

The suite follows a layered design:

| Layer | Location | Responsibility |
| --- | --- | --- |
| Tests | `src/tests/` | Test scenarios, assertions, and data-driven cases |
| Steps | `src/steps/` | Reusable workflows (seed data, cleanup, multi-step flows) |
| API | `src/api/` | HTTP calls and response mapping |
| Fixtures | `src/fixtures/` | Dependency injection for tests (`userApi`, `userSteps`, `logger`) |
| Data | `src/data/` | Types, constants, and test data builders |
| Utils | `src/utils/` | Cross-cutting helpers (logging, strings, numbers, dates) |

All test specs import `test` and `expect` from `@fixtures/fixtures`, which merges API, logging, step, and custom matcher fixtures into a single entry point.

Path aliases are defined in `tsconfig.json`:

| Alias | Maps to |
| --- | --- |
| `@api/*` | `src/api/*` |
| `@configs/*` | `src/configs/*` |
| `@data/*` | `src/data/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@steps/*` | `src/steps/*` |
| `@utils/*` | `src/utils/*` |

## Expanding the Test Automation Suite

Follow the existing patterns when adding new coverage.

### 1. Add types and test data

Define interfaces and builders under `src/data/`:

- **Types** go in `src/data/types/` (see `user.type.ts` for examples like `UserType` and `CreateRandomUser()`).
- **Constants** go in `src/data/constants/`.

### 2. Add an endpoint constant to `Environment`

When adding coverage for a new API resource, define its URL in `src/configs/environment.config.ts` following the same pattern as `USERS_API_URL`:

```typescript
export class Environment {

    static readonly BASE_URL: string = parsed.value.BASE_URL;
    static readonly BASE_API_URL: string = `${Environment.BASE_URL}/${Environment.APPLICATION_ENVIRONMENT}`;
    static readonly USERS_API_URL: string = `${Environment.BASE_URL}/${Environment.APPLICATION_ENVIRONMENT}/users`;
    static readonly MY_RESOURCE_API_URL: string = `${Environment.BASE_URL}/${Environment.APPLICATION_ENVIRONMENT}/my-resource`;

}
```

Derived URL constants are built from `BASE_URL` and `APPLICATION_ENVIRONMENT`, so they automatically target the correct environment (`dev` or `prod`) without duplicating values in `.env` files.

Reference the constant from API clients and tests — never hardcode URLs inline.

### 3. Add an API client

Create a class in `src/api/` that wraps Playwright's `APIRequestContext`:

```typescript
import { Environment } from '@configs/environment.config';
import { APIRequestContext } from '@playwright/test';

export class MyResourceApi {
    constructor(readonly request: APIRequestContext) {}

    async getAll(): Promise<MyType[]> {
        const response = await this.request.get(Environment.MY_RESOURCE_API_URL);
        // map response...
    }
}
```

Use `Environment` for URLs and shared config rather than hardcoding values.

### 4. Register the API fixture

Add the new client to `src/fixtures/api.fixtures.ts` using the existing `createApiFixture` helper:

```typescript
import { MyResourceApi } from "@api/my-resource.api";

type ApiFixtures = {
    userApi: UserApi,
    myResourceApi: MyResourceApi,
};

export const test = base.extend<ApiFixtures>({
    userApi: createApiFixture(UserApi),
    myResourceApi: createApiFixture(MyResourceApi),
});
```

Fixtures registered here are automatically available in all tests through `@fixtures/fixtures`.

### 5. Add reusable steps (optional)

For workflows reused across multiple tests, create a class in `src/steps/` and register it in `src/fixtures/steps.fixtures.ts` using `createStepFixture`:

```typescript
export class MyResourceSteps {
    async setup(logger: LoanProTestAutomationLogger, api: MyResourceApi): Promise<void> {
        await test.step('Setup my resource', async () => {
            // ...
        });
    }
}
```

See `UserSteps.seed()` and `UserSteps.deleteSeeded()` in `src/steps/user.steps.ts` for the established pattern.

### 6. Add custom matchers (optional)

Extend Playwright assertions in `src/fixtures/matchers.fixtures.ts` and export through `src/fixtures/fixtures.ts`. The existing `toBeAnEmail` matcher is the reference implementation.

### 7. Write test specifications

Create a new file under `src/tests/`, grouped by feature area (e.g. `src/tests/users/`):

```typescript
import { expect, test } from '@fixtures/fixtures';

test.describe('Validations for My Feature', {
    tag: ['@my-feature'],
}, () => {

    test('My scenario',
        { tag: ['@LOANPRO-0000', '@happy-path'] },
        async ({ userApi, logger, userSteps }) => {

            await test.step('Do something', async () => {
                logger.info('Step details...');
                // assertions with expect
            });
        });
});
```

**Conventions to follow:**

- Every test must include a `@LOANPRO-XXXX` tag linking to a test case ID (enforced by the logging fixture).
- Use `test.step()` for readable reports and logs.
- Use `logger` for execution tracing — logs are split per test in `artifacts/logs/`.
- Use `test.describe` tags to group related scenarios (e.g. `@users`, `@create`).
- Clean up created data in `test.afterEach` or `test.afterAll` hooks (see `create-user.spec.ts`).

### 8. Add environment variables (if needed)

There are two ways to add configuration, depending on what you need:

**Derived endpoint URLs** — add a static constant to the `Environment` class (see step 2). No `.env` changes required.

**Values loaded from `.env`** — for settings that vary per deployment (tokens, feature flags, timeouts):

1. Add the variable to the Joi schema in `src/configs/environment.config.ts`.
2. Expose it as a static property on the `Environment` class:

```typescript
static readonly MY_SETTING: string = parsed.value.MY_SETTING;
```

3. Document it in the `.env` example above.

### 9. Run and verify

```bash
# Run only your new spec
npm test -- src/tests/my-feature/my-feature.spec.ts

# Run by tag
npm test -- --grep @my-feature
```

## Troubleshooting

**Environment validation error on startup**

Ensure all required variables are set in `.env` and the matching `.env.<environment>` file. Variable names and values must use `KEY=value` format.

**Connection refused / tests fail immediately**

Confirm the Docker container is running and reachable at the URL defined in `BASE_URL`.

**Missing `@LOANPRO` tag error**

Every test must declare a `@LOANPRO-XXXX` tag in its options. This is required by the logging fixture to correlate logs with test cases.

## License

See [LICENSE](LICENSE).
