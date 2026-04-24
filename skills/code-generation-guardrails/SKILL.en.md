# Code Generation Guardrails

Generate code that is simple, maintainable, and consistent with the project style.

## Core Principles

- Prefer the project's existing style over abstract best practices
- Prefer clear expression over compact syntax
- Choose the smallest correct implementation
- Do not change behavior that is not part of the task
- Do not expand the task scope

## Before Coding

Clarify:

- Goal: what to do and what not to do
- Constraints: project conventions, APIs, and boundaries
- Scope: the smallest viable change

If something is unclear, choose the simplest reasonable approach.

## Generation Rules

### Consistency
- Follow existing names, structures, and patterns
- Do not introduce new paradigms casually

### Simplicity
- Avoid deep nesting
- Avoid clever code
- Keep the flow straightforward
- Use intermediate variables when they improve readability

### Abstraction Control
- Do not abstract too early
- Avoid one-off helpers
- Do not generalize for hypothetical future needs

### Change Scope
- Prefer fewer files and smaller diffs
- Do not modify unrelated code
- Do not mix unrelated refactors into feature work

### Types And Interfaces
- Keep interfaces clear and stable
- Use explicit types where they help
- Avoid vague types

### Testability
- Keep logic verifiable
- Isolate side effects where practical

### Safety And Quality
Check for:
- Runtime issues such as null values or out-of-bounds access
- Security risks such as injection or XSS
- Performance issues such as repeated work or N+1 queries
- Interface compatibility

## Decision Rules

When there are multiple options:

1. Prefer the one that matches the existing code style
2. Choose the simpler solution
3. Choose the clearer structure
4. Choose the easier-to-test approach

## Pre-Generation Checklist

- Is this the smallest implementation?
- Does it introduce unnecessary abstraction?
- Does it match the project style?
- Is it easy to understand?

## Post-Generation Checklist

- Behavior is correct and no unrelated behavior changed
- Complexity is reasonable
- Names are clear
- No obvious risks remain

## Anti-Patterns

- Overengineering
- Designing for hypothetical future expansion
- One-off abstraction
- Implicit side effects
- Complex one-liners
- Nested ternary expressions
- Unrelated refactors
