# Sovereign Safeguard Protocol

To prevent build errors and configuration drift, all agents must adhere to the following rules:

1. **Deterministic Dependency Management**:
   - Never import a package that is not explicitly listed in `package.json`.
   - Always use `install_applet_package` to add new dependencies.
   - Verify `package.json` before adding any new import statements.

2. **Pre-Flight Build Verification**:
   - Before finalizing any turn involving new dependencies, CSS changes, or refactoring, run `lint_applet` and `compile_applet`.
   - If build errors occur, they must be resolved before the turn is considered complete.

3. **CSS Hygiene**:
   - Regularly audit `src/index.css` for stale or non-existent imports.
   - Ensure all `@import` statements map to verified, installed dependencies.

4. **Source of Truth**:
   - `package.json` is the absolute source of truth for dependencies.
   - `index.css` is the absolute source of truth for styling imports.

5. **Refactoring Protocol**:
   - All refactoring must be performed in atomic, verified steps.
   - No component prop may be removed without first verifying all parent usages.
   - Run `lint_applet` between atomic refactoring steps to catch drift early.

6. **Sovereign Arch Efficiency**:
   - Prefer consolidated engine nodes (e.g., AlignmentNexus) over waterfall sequential nodes.
   - Always honor user-defined model overrides (`refinementModelOverride`, `reportModelOverride`) in `ConfigStore`.
   - Minimize API context by using `ContextEngine` triaging before any node execution.
