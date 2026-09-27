# Validation

- 12 automated core tests passed using Node's built-in test runner.
- The browser scenario passed 17 checks, including direct `file://` opening, fixture scoring, JSON export, provenance, input changes, HTML-as-text handling, keyboard tabs, clipboard fallback, human-review validation, and mobile overflow.
- No JavaScript exceptions or HTTP requests were observed during the direct-file browser scenario.
- The GitHub Pages workflow parsed as YAML. It has not been executed in a connected GitHub repository, and this delivery is not an already-published website.
- Desktop and mobile screenshots are in `docs/`.

The example responses are handwritten fixtures. The included example export reports 3/5 checks for A and 5/5 for B. These are measured check outcomes on constructed text, not model quality measurements. No actual model responses were collected during this build.

Read `tests.txt`, `browser.txt`, and `handwritten-example.json` for the underlying evidence. The optional Playwright browser script requires Playwright and Chromium; the application itself has no installed dependencies.
