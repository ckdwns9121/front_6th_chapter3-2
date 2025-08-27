# TDD Cycle – Operational Checklist

- Maintain **Test List** at the top of the file.
- RED: write a failing test for the next smallest behavior.
- GREEN: make it pass with the **simplest** code.
- REFACTOR: remove duplication, improve names; keep tests green.
- Commit: one micro-behavior per commit:
  - test: add failing test for X
  - feat: make X pass (minimum)
  - refactor: inline/extract/rename w/ green tests
- Target cycle time: 2–3 minutes.
