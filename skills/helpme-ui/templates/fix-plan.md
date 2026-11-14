<!-- Use when a read-only review hands fixes to another agent: one plan per finding cluster, runnable without this conversation. -->
# Fix plan: <title>

- from: review <date>, ids <ID, ID>
- source of truth: <host DS | DESIGN.md | tokens path>
- screens: <url or file> @ phone, desktop (+ dark)

## Evidence
<finding lines as written> · <PNG paths>

## Change
| file:line | now | to | rule id |
|---|---|---|---|

## Keep
- no wiring loss; ledger locks: <lines>
- out of scope: <files>

## Done when
```
node $S/scripts/capture.mjs <url> --name <name> --fail-on should
node $S/scripts/wiring.mjs diff .helpme/shots/rA/wiring.json .helpme/shots/rB/wiring.json
```
- listed ids gone at every viewport, no new must
- a `seen:` line per viewport; unrun checks reported "not verified"
