# TDD — Phase 3: REFACTOR

Clean up the implementation for: `$ARGUMENTS`

All tests must already be passing before this phase.

## Rules

- Remove duplication.
- Improve naming and readability.
- Extract shared logic only if it is used in more than one place.
- Do not add features, abstractions, or error handling beyond what the tests require.

Run tests after every change to confirm nothing regressed.

## Output

```
Phase: REFACTOR
File(s) changed: <list>
Test result: PASSING
Next step: feature complete
```

## Constraints

- No new features
- No Prisma calls inside controllers
- No hard deletes — always soft delete via `deletedAt`
- All active-record queries filter `deletedAt: null`
