# TDD Cycle — NestJS + Prisma

You are guiding a strict TDD cycle for this NestJS + Prisma project. The user will give you a feature or requirement. Follow the steps below without skipping any phase.

## Input

The user provides: `$ARGUMENTS`

This can be:
- A feature description (e.g., "create user endpoint")
- A module name (e.g., "users")
- A specific behaviour to implement (e.g., "soft delete a product")

---

## Phase 1 — RED: Write the failing test first

Before writing any implementation code:

1. Identify the layer being tested (service, controller, or e2e).
2. Create or update the spec file (`<module>.service.spec.ts` or `<module>.controller.spec.ts`).
3. Write the test using the Prisma mock pattern:

```ts
const mockPrismaService = {
  <model>: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};
```

4. Confirm the test fails before proceeding. Do not write implementation code yet.

---

## Phase 2 — GREEN: Write the minimum implementation

Write only the code required to make the failing test pass. No extras, no future-proofing.

Rules:
- Services interact with Prisma — never controllers.
- All queries must include `where: { deletedAt: null }` to exclude soft-deleted records.
- Never use `prisma.<model>.delete` or `prisma.<model>.deleteMany` — use soft delete:
  ```ts
  await this.prisma.<model>.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  ```
- DTOs must use `class-validator` decorators.
- Throw NestJS built-in HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.).

Confirm all tests pass before moving to the next phase.

---

## Phase 3 — REFACTOR: Clean up without breaking tests

With green tests in place:
- Remove duplication
- Improve naming and readability
- Extract shared logic only if it is used in more than one place
- Do not add features, abstractions, or error handling beyond what the tests require

Run tests again after refactoring to confirm nothing regressed.

---

## Output format per phase

After each phase, report:

```
Phase: RED | GREEN | REFACTOR
File(s) changed: <list>
Test result: FAILING | PASSING
Next step: <what comes next>
```

---

## Constraints (always enforced)

- No hard deletes — always soft delete via `deletedAt`
- All active-record queries filter `deletedAt: null`
- No Prisma calls inside controllers
- No implementation before a failing test exists
- No features beyond what the current test requires
