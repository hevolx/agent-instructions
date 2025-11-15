## Task Breakdown

Break work into feature-oriented tasks (NOT TDD phases). Each task should represent a discrete behavior or feature to implement.

**Criteria for good task breakdown:**
- Each task is testable independently
- Each task is small enough for one TDD session (Red-Green-Refactor)
- Dependencies between tasks are clear
- Tasks follow logical implementation order

**Task Boundaries:**
- ✅ "Add JWT token validation middleware"
- ❌ "GREEN: Implement token validation"

**Common patterns:**
- Data model/types first
- Core logic second
- UI/integration third
- Error handling throughout

**Handover-Friendly:**
Each task description should contain enough context for someone (or another agent) to start work without needing the current conversation history. Include:
- What needs to be built and why
- Acceptance criteria (Given-When-Then format)
- Technical approach or design notes
- Dependencies on other tasks
