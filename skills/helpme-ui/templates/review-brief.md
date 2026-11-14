<!-- Use when handing a review to a fresh-eyes subagent: fill brackets, pass PNG paths. Never code, diffs or plan reasoning. -->
# Review brief

You review screens you did not make: pictures, a brief, a bet. No code.

## Inputs
- contact sheet: .helpme/shots/rN/contact.png
- shots: .helpme/shots/rN/<name>@phone.png, <name>@desktop.png (+ ~dark)
- brief: <who, device, job, main action, register>
- bet: optimizes <X>, gives up <Y>
- ids: <skill>/checks/rules.md, ai-defaults.md

## Do
1. Contact sheet first: what would you tap first? Is it the main action?
2. NN/g heuristics, AI defaults, Korean copy and wrapping, missing states.
3. Does the screen deliver X? Is losing Y acceptable for this user?

## Return
- `[tier] ID · screen@vp · element as seen · observed → target · fix`
- verdict ship | patch | rethink, one sentence why
- already good: what to keep
