# PromptLab — Notes to Project Brief

A small prompt engineering project that turns rough project notes into two reusable prompts, compares their responses, and records evidence about which instructions worked better.

**Open `index.html` in your browser. No Python, npm installation, backend, account, or API key is required.** You can also publish it directly on GitHub Pages.

## The project in one sentence

Compare a basic zero-shot prompt with a structured one-shot prompt for extracting a consistent project brief from messy notes.

The output has six fields: `goal`, `owner`, `deadline`, `tasks`, `out_of_scope`, and `open_questions`.

## Use it in five minutes

1. Double-click `index.html`.
2. Click **Load worked example** to understand the interface. The displayed responses are handwritten fixtures, not model outputs.
3. Choose a practice case or enter your own notes. Set the word limit and optional required terms, then click **Build the two prompts**.
4. Copy prompt A into a fresh chat with an AI assistant. Paste its exact answer into Answer A. Repeat prompt B in a separate fresh chat with the same model. Enter the model/version in the provided field.
5. Click **Check both answers**, make your own factual judgment, and download the experiment JSON.

Changing source notes or rules disables evaluation/export until you rebuild prompts. Rebuilding clears the old responses so they do not get compared against a different experiment. Editing a handwritten example keeps its synthetic provenance. The app does not save data automatically; export before closing or refreshing.

If your browser blocks clipboard access for a local file, the app selects the prompt text so you can press Command+C (Mac) or Control+C (Windows). No terminal setup is needed.

## What you learn

- **Zero-shot prompting:** a direct task and output-format request.
- **One-shot prompting:** a separate worked input/output example. This app uses one example, so “one-shot” is the precise term.
- **Explicit constraints:** missing values, field types, scope, exclusions, and word limits.
- **Structured output instructions:** request JSON with a specific schema. This is prompt-based formatting, not an API-level schema guarantee.
- **Input separation:** instructions, examples, and source notes use distinct XML-style sections in prompt B. Input delimiters are escaped. This improves separation but is not a security guarantee against prompt injection.
- **Evaluation:** inspect actual responses using deterministic checks and a separate human verdict.

## What the app does automatically

| Check | Meaning |
|---|---|
| Nonempty | There is a response to inspect |
| Raw JSON | The entire response parses as JSON without markdown wrappers |
| Schema | Exactly six required fields, with the documented types |
| Length | Total words in JSON text values fit the configured limit |
| Required terms, when supplied | Literal case-insensitive substrings appear in the response's text values |

A score is the number of checks passed, **not an accuracy percentage**. A false claim can repeat the required words and pass every check. The test suite includes an example of that limitation. Review factual fidelity, missing exclusions, unsupported assumptions, and open questions yourself.

The handwritten worked example passes 3/5 checks for A and 5/5 for B. These are deliberately constructed examples of format failure and success. They do not prove prompt B is better across models or real tasks.

## Five practice cases

1. Login-page requirements.
2. Search bug with no assigned owner.
3. A security lab with scope constraints.
4. Ambiguous onboarding notes with missing details.
5. Notes containing an unrelated instruction to test whether the model follows the outer task.

These are synthetic practice inputs, not a representative benchmark. Their definitions are in `core.js` and `practice-cases.json`.

## Collect real portfolio evidence

For each of the five cases, run A and B with the same model in fresh chats. Preserve the raw answers, model version, and your verdict. Avoid fixing the answers before scoring. Repeat comparisons when practical; a single response pair is sensitive to generation variability.

The two bundled strategies differ in several ways at once (constraints, schema explanation, delimiters, and an example). A difference cannot be attributed to any single technique. If investigating which technique helps, change one component at a time in `core.js` and rerun the same cases. The interface intentionally keeps the experiment small.

Publish selected real exports with a short discussion of what improved, what failed, and what you changed. Do not describe handwritten examples as live AI performance or claim that JSON validation proves factual accuracy.

## Publish directly on GitHub Pages

1. Create a repository named `promptlab` in your preferred GitHub account.
2. Upload the contents of this folder, including the hidden `.github` folder. `index.html` must be at the repository root.
3. Go to **Settings → Pages → Build and deployment → Source**, then choose **GitHub Actions**.
4. Open the **Actions** tab. The included **Publish PromptLab** workflow runs tests and publishes the static app. If necessary, select the workflow and choose **Run workflow** after enabling Pages.
5. Once the workflow succeeds, use the Pages URL GitHub provides. Its shape is `https://YOUR_USERNAME.github.io/promptlab/`; that is an example, not an already-published link.

All assets use relative paths, so the app works under a repository subpath. Unlike Devara Eval, this project has no server-side Python process or database to deploy. GitHub Pages can serve the entire application.

## Files and optional tests

| File | Purpose |
|---|---|
| `index.html` | The interface |
| `style.css` | Responsive navy/blue styling |
| `core.js` | Prompt templates, five practice cases, checks, export structure |
| `app.js` | Browser interactions and downloads |
| `practice-cases.json` | Portable practice inputs |
| `tests/core.test.cjs` | Dependency-free Node tests |
| `.github/workflows/pages.yml` | Test and deploy to GitHub Pages |
| `docs/PROJECT_OVERVIEW.md` | Short explanation for your portfolio |
| `evidence/` | Test results and a clearly labeled fixture export |

If Node.js 20+ is installed, run tests with:

```bash
node --test tests/core.test.cjs
```

The tests exercise input limits, delimiter escaping, schema failures, empty answers, code fences, word counting, literal term matching, provenance, and the semantic limitations of the checks.

## Privacy and scope

The app itself makes no network requests and includes no API-key fields, analytics, or external assets. Text remains in the current page until you copy it elsewhere or download an export. If you paste prompts into an external AI service, that service handles the submitted notes under its own terms. Do not use confidential data without the appropriate permission.

The project is a lightweight prompt authoring and comparison workspace, not an integrated model client. It does not automatically generate responses, fine-tune a model, or guarantee factual correctness. A GitHub Pages deployment has no per-user login because it contains only static application code; unsaved form entries are not sent to GitHub by this app.

## References

The structured prompt applies documented techniques for clear instructions, examples, and separation of context. No claim of a new or universally optimal prompting method is made.

- [Anthropic: prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Anthropic: prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [GitHub Pages documentation](https://docs.github.com/en/pages)
