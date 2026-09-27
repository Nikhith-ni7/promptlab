# PromptLab — Notes to Project Brief

PromptLab is a minimal prompt engineering application that helps users turn rough notes into structured project briefs. It generates two prompt variants: a basic zero-shot instruction and a structured one-shot instruction containing explicit constraints, a typed output schema, and a worked example.

Users test both prompts with the same AI model, paste the original responses into the app, and compare JSON validity, schema compliance, word count, and optional required terms. A separate human-review field captures whether the answers preserved the original facts and handled missing information correctly.

Built with HTML, CSS, and JavaScript, the project runs entirely in a browser and can be hosted on GitHub Pages. It includes five synthetic practice cases, a handwritten demonstration, automated tests, and JSON experiment exports. It has no backend, API integration, or model-generated performance evidence by default.

This project demonstrates prompt design, structured extraction, clear evaluation criteria, basic frontend engineering, and honest documentation of evaluation limitations. Real model comparisons must be collected using the copy-and-paste workflow before making claims about prompt performance.
