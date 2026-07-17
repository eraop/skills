# Code Generation Constraints

Generate code that is simple, maintainable, and consistent with the existing project style.

Applicable to:

- Writing new code
- Modifying existing code
- Implementing features
- Fixing bugs
- Refactoring tasks
- Reviewing code or addressing review feedback

**Tradeoff:** These constraints bias toward caution and verification. For very small low-risk tasks, keep the explanation short, but still control scope and verify the result.

---

## 1. Core Objective

Complete the task with the **minimal correct implementation**, without expanding scope or introducing unnecessary complexity.

Priority order:

1. Correctness
2. Consistency with existing code
3. Readability
4. Minimal changes

---

## 2. Before Coding

Before writing or changing code, clarify:

- What to do: the user goal and success criteria
- What not to do: the boundaries for this change
- What assumptions matter: inputs, callers, compatibility, environment, or data shape
- How to verify: tests, type checks, lint, manual checks, or review evidence

Stop and surface the issue instead of choosing silently when:

- The request has multiple reasonable interpretations and the choice affects behavior, APIs, data, or security
- Key context is missing and correctness cannot be judged
- The task requires expanding scope to finish
- A simpler approach exists but may conflict with what the user asked for
- The change involves values such as URLs, path prefixes, timeouts, or feature flags that may vary by deployment environment or runtime scenario: first confirm the project's established configuration source, precedence, and scope (for example, fixed constants, config files, environment variables, or startup parameters); do not default to one based only on where the change is easiest or smallest

For small low-risk tasks, use the simplest reasonable assumption, but mention it in the output.

---

## 3. Global Principles

### 1. Consistency First

- Follow existing naming, structure, coding style, and patterns
- Prefer existing implementation approaches over introducing new paradigms
- Do not proactively clean up or standardize unrelated legacy code

> If existing code has clear issues (readability/correctness/security), allow **minimal fixes directly related to the task**.

---

### 2. Minimal Correct Implementation

- Implement only what is required
- Do not extend beyond current requirements
- Do not design for hypothetical future use
- Do not add unrequested configuration, flexibility, or extension points
- Do not add defensive code for impossible paths

If the implementation is obviously longer or more indirect than needed, simplify it before delivering.

---

### 3. Surgical Changes

- Modify only necessary code
- Do not change unrelated files or logic
- Do not mix refactoring into feature work
- Do not clean up adjacent code, comments, or formatting unless directly affected by this change

Every changed line should trace to the user's request or to cleanup made necessary by this change.

When this change creates unused code:

- Remove imports, variables, functions, or branches made unused by this change
- Do not remove pre-existing dead code; mention it instead

> If not adjusting would significantly increase complexity or duplication, allow **small, localized cleanup**, and explain why.

---

### 4. Readability Over Cleverness

- Keep control flow straightforward
- Avoid deep nesting
- Avoid overly compact one-liners
- Avoid nested ternary expressions
- Use intermediate variables when it improves clarity

---

### 5. Abstraction Control (Strict)

Only introduce abstractions when **all conditions are met**:

- Clear duplication exists in the current change
- Similar abstraction patterns already exist in the project
- The abstraction does not expand interfaces or cognitive load
- The abstraction directly simplifies the current change

Otherwise:

- Do not add helpers
- Do not split functions unnecessarily
- Do not generalize prematurely

---

### 6. Behavioral Stability

- Do not change behavior unless required
- Maintain backward compatibility
- Do not alter existing calling patterns
- Avoid implicit side effects

---

### 7. Types and Interfaces

- Keep interfaces clear and stable
- Prefer explicit types over ambiguous ones
- Do not change function signatures or return structures unnecessarily

---

### 8. Goal-Driven Verification

- First transform the task into verifiable goals
- For bug fixes, prefer a minimal test that reproduces the failure before fixing it
- For refactors, ensure behavior is covered before and after the change
- For small changes without a test pattern, run type checks, lint, build, or a clear manual review
- Do not break the existing test structure

Examples:

- "Add validation" -> "Cover invalid inputs with tests, then make them pass"
- "Fix the bug" -> "Reproduce the failure first, then make the test pass"
- "Refactor X" -> "Existing tests pass before and after"

---

### 9. Safety and Quality Checks

Always check for:

- Null / undefined access
- Boundary conditions / edge cases
- Proper error handling paths
- Injection / XSS / unsafe string handling
- Performance issues (redundant computation, obvious N+1)
- API compatibility

Only handle error paths that are reachable, required by the interface contract, or covered by existing project patterns. Do not add complex defenses for impossible states.

---

## 4. Task-Specific Strategy (Critical)

Adjust approach based on task type:

### 1. Bug Fix

- Prioritize minimal changes
- Fix the issue precisely
- Prefer adding or updating a minimal reproducing test when a test pattern exists
- Do not refactor opportunistically
- Avoid introducing new behavior

---

### 2. Feature Implementation

- Align with existing structure and patterns
- Reuse existing approaches where possible
- Limit scope of new code
- Do not optimize surrounding code unnecessarily

---

### 3. Refactoring

- Do not change behavior
- Focus on directly related duplication
- Improve readability and structure
- Keep impact localized

---

### 4. Performance Optimization

- Target clearly identified hot paths
- Improve based on existing logic
- Do not rewrite for theoretical optimality

---

### 5. Security Fix

- Prioritize eliminating risk
- Then minimize changes
- Clearly define impact scope

---

### 6. Code Review or Review Feedback

- First decide whether the feedback is real, reproducible, and relevant to the request
- Verify questionable feedback instead of accepting it blindly
- Address only actionable items; style preferences must follow existing project conventions
- Explain how the fix was verified

---

## 5. Decision Rules

When multiple approaches exist, choose in order:

1. Best matches existing code style
2. Simplest
3. Clearest
4. Easiest to test
5. Smallest change

If the tradeoff is meaningful, briefly explain why the chosen approach won.

---

## 6. Pre-Generation Checklist

- Are the goal, boundary, assumptions, and verification method clear?
- Is this the minimal solution?
- Is unnecessary abstraction introduced?
- Does it match project style?
- Is there a simpler way?
- Is the scope unnecessarily expanded?
- Does every planned change trace to the user's request?

---

## 7. Post-Generation Checklist

- Is the functionality correct?
- Has verification been completed?
- Any unintended behavior changes?
- Is it easy to understand?
- Any obvious risks?
- Are names clear?
- Is complexity reasonable?
- Did cleanup only remove unused code created by this change?

---

## 8. Output Requirements

Scale the output to the risk and size of the change. Do not create long explanations for small changes.

For low-risk small changes:

- Briefly state what changed
- State what verification ran or why it could not run

For medium/high-risk, cross-module, behavioral, or interface changes:

1. **Change Summary**
   - What was changed
   - Scope of changes

2. **Key Decisions**
   - What assumptions were used
   - Why this is the minimal correct implementation
   - Why alternatives were not chosen

3. **Risks & Impact**
   - Whether existing behavior is affected
   - Any edge-case risks

4. **Verification Results**
   - Tests/checks that ran
   - Anything not verified and why

5. **Deliberately Deferred Improvements (if any)**
   - What could be improved but was intentionally not done
   - Reason (scope control / consistency)

---

## 9. Anti-Patterns (Must Avoid)

- Over-engineering
- Silent assumptions about requirements
- Designing for hypothetical future needs
- One-off abstractions
- Implicit side effects
- Unrelated refactoring
- Changing code for elegance
- Complex one-liners
- Nested ternary expressions
- Introducing unnecessary new concepts
- Deleting pre-existing dead code without being asked
- Finishing without verification

---
