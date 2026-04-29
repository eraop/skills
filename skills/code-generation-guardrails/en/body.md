# Code Generation Guardrails

Generate simple, maintainable code that fits the project style.

## When to Use

- Writing new code
- Modifying existing code
- Implementing features
- Fixing bugs
- Refactoring code

## Core Principles

- Follow the existing project style before abstract best practices.
- Prefer clear expression over compact cleverness.
- Choose the smallest correct implementation.
- Do not change behavior unless the task requires it.
- Do not expand the task scope.

## Before Coding

Clarify:

- Goal: what to do and what not to do.
- Constraints: project conventions, APIs, and boundaries.
- Scope: the smallest change that solves the task.

If details are unclear, choose the simplest reasonable approach.

## Generation Rules

### Consistency
- Follow existing naming, structure, and patterns.
- Do not introduce a new paradigm casually.

### Simplicity
- Avoid deep nesting.
- Avoid showy or overly clever code.
- Keep control flow direct.
- Use intermediate variables when they improve readability.

### Abstraction Control
- Do not abstract prematurely.
- Avoid one-off helpers.
- Do not generalize for imagined future needs.

### Change Scope
- Touch as few files and lines as practical.
- Do not modify unrelated code.
- Do not mix unrelated refactoring into feature work.

### Types and Interfaces
- Keep interfaces clear and stable.
- Use explicit types where they clarify intent.
- Avoid vague types.

### Testability
- Keep logic verifiable.
- Isolate side effects where practical.

### Safety and Quality
Check for:
- Runtime issues such as null values and out-of-bounds access.
- Security risks such as injection and XSS.
- Performance issues such as repeated work and N+1 queries.
- Interface compatibility.

## Decision Rules

When several options are viable:

1. Prefer the option that best matches the existing code style.
2. Choose the simpler option.
3. Choose the clearer structure.
4. Choose the easier-to-test approach.

## Pre-Generation Check

- Is this the smallest implementation?
- Does it introduce unnecessary abstraction?
- Does it match the project style?
- Is it easy to understand?

## Post-Generation Check

- The behavior is correct and has no unintended changes.
- Complexity is reasonable.
- Names are clear.
- No obvious risks remain.

## Anti-Patterns

- Overengineering
- Designing for speculative future expansion
- One-off abstractions
- Hidden side effects
- Complex one-liners
- Nested ternaries
- Unrelated refactoring
