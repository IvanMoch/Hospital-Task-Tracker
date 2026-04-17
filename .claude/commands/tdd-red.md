# TDD — Phase 1: RED

Write the failing test for: `$ARGUMENTS`

## Steps

1. Identify the layer (service, controller, or e2e).
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

4. Confirm the test fails. Do not write any implementation code.

## Output

```
Phase: RED
File(s) changed: <list>
Test result: FAILING
Next step: run /tdd-green <feature>
```

## Constraints

- No implementation before a failing test exists
- No Prisma calls inside controllers
- No hard deletes — always soft delete via `deletedAt`
