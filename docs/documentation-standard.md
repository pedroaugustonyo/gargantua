# Documentation standard

`README.md` introduces the experiment and provides setup instructions. `AGENTS.md` contains short contributor notes. Both link to the canonical [project guide](index.md). The project guide owns requirements, behavior, architecture, source conventions, local commands, coverage, integrations, security, and contributor workflow for this small application.

Update those existing sections when behavior or setup changes. Split a topic into a dedicated guide only when its size warrants it, and link to it from the index instead of maintaining duplicate guidance. Keep verified behavior separate from proposed work and scientific limitations explicit.

Dated specifications, plans, reviews, and execution records belong under `docs/superpowers/{specs,plans,reviews,evidence}` when needed. Validation evidence must identify the configuration, commands, results, and untested limits; it describes its original source state rather than future revisions. Do not document unexecuted commands as passing. Temporary test screenshots, build output, and dependencies remain ignored, and are not authoritative documentation. Owner-selected screenshots used in the README are kept in `docs/images/` with descriptive filenames and alt text.
