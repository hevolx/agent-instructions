### Create Beads Issues

For each task, create a bd issue with:

```bash
bd create "Task title" \
  --type [feature|bug|task|chore] \
  --priority [1-3] \
  --description "Context and what needs to be built" \
  --design "Technical approach, architecture notes" \
  --acceptance "Given-When-Then acceptance criteria"
```

**Issue Structure Best Practices:**

**Title**: Action-oriented, specific
- ✅ "Add JWT token validation middleware"
- ❌ "Authentication stuff"

**Description**: Provide context
- Why this task exists
- How it fits into the larger feature
- Links to related issues/docs

**Design**: Technical approach
- Key interfaces/types needed
- Algorithm or approach
- Libraries or patterns to use
- Known gotchas or considerations

**Acceptance Criteria**: Test-ready scenarios
- Given-When-Then format
- Concrete, verifiable conditions
- Cover main case + edge cases
- Map 1:1 to future tests

**Dependencies**: Link related issues
```bash
bd dep add ISSUE-123 ISSUE-456 --type blocks
```

### Validation

After creating issues, verify:
- ✅ Each issue has clear acceptance criteria
- ✅ Dependencies are mapped (use `bd dep add`)
- ✅ Issues are ordered by implementation sequence
- ✅ First few issues are ready to start (`bd ready` shows them)
- ✅ Each issue is small enough for TDD (if too big, break down more)
