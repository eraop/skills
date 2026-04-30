---
name: code-generation-guardrails
description: Keep generated code simple, consistent, narrowly scoped, and aligned with the existing project before writing or changing code.
triggers:
  - write code
  - generate code
  - fix bug
  - patch code
  - update function
  - modify existing code
  - small change
  - minimal implementation
  - avoid refactor
---

# Code Generation Constraints (Optimized)

Generate code that is **simple, maintainable, and consistent with the existing project style**.

Applicable to:

- Writing new code
- Modifying existing code
- Implementing features
- Fixing bugs
- Refactoring tasks

---

## 1. Core Objective

Complete the task with the **minimal correct implementation**, without expanding scope or introducing unnecessary complexity.

Priority order:

1. Correctness
2. Consistency with existing code
3. Readability
4. Minimal changes

---

## 2. Global Principles

### 1. Consistency First

- Follow existing naming, structure, coding style, and patterns
- Prefer existing implementation approaches over introducing new paradigms
- Do not proactively “clean up” or standardize unrelated legacy code

> If existing code has clear issues (readability/correctness/security), allow **minimal fixes directly related to the task**

---

### 2. Minimal Correct Implementation

- Implement only what is required
- Do not extend beyond current requirements
- Do not design for hypothetical future use

---

### 3. Control Scope of Changes

- Modify only necessary code
- Do not change unrelated files or logic
- Do not mix refactoring into feature work

> If not adjusting would significantly increase complexity or duplication, allow **small, localized cleanup**

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

### 8. Testability

- Keep logic verifiable
- Minimize side effects where possible
- Do not break existing test structure

> If the task involves bug fixes or critical logic:

- Add or update minimal necessary tests (if a testing pattern exists)

---

### 9. Safety and Quality Checks

Always check for:

- Null / undefined access
- Boundary conditions / edge cases
- Proper error handling paths
- Injection / XSS / unsafe string handling
- Performance issues (redundant computation, obvious N+1)
- API compatibility

---

## 3. Task-Specific Strategy (Critical)

Adjust approach based on task type:

### 1. Bug Fix

- Prioritize minimal changes
- Fix the issue precisely
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
- Focus on reducing duplication
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

## 4. Decision Rules

When multiple approaches exist, choose in order:

1. Best matches existing code style
2. Simplest
3. Clearest
4. Easiest to test
5. Smallest change

---

## 5. Pre-Implementation Checks

Clarify:

- What to do (goal)
- What not to do (boundaries)
- Scope of change (minimal solution)
- Whether behavior must remain unchanged

If unclear:
→ Choose the **simplest and lowest-risk approach**

---

## 6. Pre-Generation Checklist

- Is this the minimal solution?
- Is unnecessary abstraction introduced?
- Does it match project style?
- Is there a simpler way?
- Is the scope unnecessarily expanded?

---

## 7. Post-Generation Checklist

- Is the functionality correct?
- Any unintended behavior changes?
- Is it easy to understand?
- Any obvious risks?
- Are names clear?
- Is complexity reasonable?

---

## 8. Output Requirements (Mandatory)

When generating code, also include:

1. **Change Summary**
   - What was changed
   - Scope of changes

2. **Key Decisions**
   - Why this is the minimal correct implementation
   - Why alternatives were not chosen

3. **Risks & Impact**
   - Whether existing behavior is affected
   - Any edge-case risks

4. **Deliberately Deferred Improvements (if any)**
   - What could be improved but was intentionally not done
   - Reason (scope control / consistency)

---

## 9. Anti-Patterns (Must Avoid)

- Over-engineering
- Designing for hypothetical future needs
- One-off abstractions
- Implicit side effects
- Unrelated refactoring
- Changing code “for elegance”
- Complex one-liners
- Nested ternary expressions
- Introducing unnecessary new concepts

---
