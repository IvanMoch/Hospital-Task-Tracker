# TDD — Phase 2: GREEN

Write the minimum implementation to pass the failing test for: `$ARGUMENTS`

## Rules

- Write only what is needed to make the test pass. No extras, no future-proofing.
- Services interact with Prisma — never controllers.
- All queries must include `where: { deletedAt: null }`.
- Never use `prisma.<model>.delete` or `prisma.<model>.deleteMany` — soft delete only:
  ```ts
  await this.prisma.<model>.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  ```
- DTOs must use `class-validator` decorators.
- Throw NestJS built-in HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.).

Confirm all tests pass before finishing.

## Output

```
Phase: GREEN
File(s) changed: <list>
Test result: PASSING
Next step: run /tdd-refactor <feature>
```

## Constraints

- No features beyond what the current test requires
- No Prisma calls inside controllers
- No hard deletes — always soft delete via `deletedAt`
- All active-record queries filter `deletedAt: null`
