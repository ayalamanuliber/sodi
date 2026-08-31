# SODI cases, templates, and tools policy

The JSON Schema in this directory is the publication contract. It creates no public case, result, or client claim by itself.

- A case may become `public` only with at least one named evidence record, a visible methodology, a claim boundary, an owner, a real review date, and a stable `citeAs` string.
- Outcome claims require their own evidence source and verification date. No inferred lift, revenue, conversion, testimonial, client permission, or before/after result is allowed.
- A template may describe its inputs, formulas, limitations, version, and safe reuse. It must not imply results or endorsement.
- A tool must disclose inputs, transformations, freshness, limitations, and whether output is deterministic, estimated, or illustrative.
- Download/embed fields remain optional and must point only to reviewed, non-sensitive material. Draft and reviewed records do not enter navigation, sitemap, RSS, or structured data.
- Public structured data must mirror visible text. `CreativeWork` or `SoftwareApplication` is considered only after a matching public route exists; there is no authority-specific magic schema.

Release gate: validate the record, confirm evidence and client/data permissions, render desktop/mobile, check canonical/sitemap/noindex boundaries, then run production-domain QA. A passing schema is necessary but not sufficient.
