# Plan: save chat history

## TODO
- [ ] 1. Persist `messages` in `localStorage` using the existing JSON state flow.
- [ ] 2. Add a safe hydrate guard so invalid saved history does not break startup.
- [ ] 3. Build and verify the add-in still compiles.

## Acceptance Criteria
- Chat messages survive reload and crash when storage is available.
- Invalid or old stored history does not crash the task pane.
- Production build completes successfully.
