/* UI wiring. No network requests, API keys, or external dependencies. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id),
    P = window.PromptLab;
  let active = "a",
    experiment = null,
    dirty = false,
    source = "manual-paste";
  function message(text, error = false) {
    $("status").textContent = text;
    $("status").hidden = false;
    $("status").classList.toggle("error", error);
  }
  function readSettings() {
    return {
      notes: $("notes").value,
      maxWords: Number($("limit").value),
      terms: $("terms").value,
    };
  }
  function clearChecks() {
    for (const side of ["a", "b"]) {
      $("checks-" + side).replaceChildren();
      $("result-" + side).textContent = "Not checked";
      $("result-" + side).classList.remove("checked");
    }
    $("comparison-summary").textContent =
      "Both answers will be checked against the same rules.";
  }
  function selectTab(side) {
    active = side;
    for (const s of ["a", "b"]) {
      const chosen = s === side;
      $("tab-" + s).classList.toggle("active", chosen);
      $("tab-" + s).setAttribute("aria-selected", String(chosen));
      $("tab-" + s).tabIndex = chosen ? 0 : -1;
      $("prompt-" + s).hidden = !chosen;
    }
    $("copy").textContent = "Copy prompt " + side.toUpperCase();
    $("technique").textContent =
      side === "a"
        ? "Direct task + format request. A useful starting point."
        : "Explicit constraints + typed schema + one worked example.";
    $("prompt-length").textContent = experiment
      ? experiment.prompts[side].length.toLocaleString() + " characters"
      : "";
  }
  function updateProvenance() {
    const box = $("provenance");
    box.hidden = !["handwritten-example", "edited-example"].includes(source);
    box.textContent =
      source === "handwritten-example"
        ? "Worked example · Both answers were handwritten to demonstrate the checks. No AI model was called."
        : source === "edited-example"
          ? "Edited example · These answers started as handwritten fixtures. Editing them does not turn them into model-generated evidence."
          : "";
  }
  function build(skipConfirmation = false) {
    try {
      const settings = readSettings(),
        prompts = P.buildPrompts(settings);
      if (
        !skipConfirmation &&
        ($("answer-a").value || $("answer-b").value) &&
        !confirm(
          "Build new prompts and clear the current answers? Download your experiment first if you want to keep it.",
        )
      )
        return false;
      experiment = { settings, prompts };
      dirty = false;
      source = "manual-paste";
      for (const side of ["a", "b"]) {
        $("text-" + side).textContent = prompts[side];
        $("answer-" + side).value = "";
      }
      $("winner").value = "not-reviewed";
      $("review").value = "";
      $("model").value = "";
      $("prompt-status").textContent = "Ready to copy";
      $("evaluate").disabled = false;
      $("copy").disabled = false;
      $("export").disabled = false;
      clearChecks();
      updateProvenance();
      selectTab(active);
      return true;
    } catch (e) {
      message(e.message, true);
      return false;
    }
  }
  function markDirty() {
    dirty = true;
    $("char-count").textContent =
      $("notes").value.length.toLocaleString() + " characters";
    $("prompt-status").textContent = "Rebuild to apply edits";
    $("evaluate").disabled = true;
    $("copy").disabled = true;
    $("export").disabled = true;
    clearChecks();
  }
  function populateCase(id) {
    const c = P.cases.find((x) => x.id === id) || P.cases[0];
    $("notes").value = c.notes;
    $("terms").value = c.terms;
    $("char-count").textContent = c.notes.length + " characters";
  }
  for (const c of P.cases) {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.title;
    $("sample").append(option);
  }
  $("sample").addEventListener("change", () => {
    populateCase($("sample").value);
    markDirty();
  });
  for (const id of ["notes", "limit", "terms"])
    $(id).addEventListener("input", markDirty);
  $("build").addEventListener("click", () => {
    if (build())
      message(
        "Two prompts are ready. Try each in a fresh chat with the same model.",
      );
  });
  for (const s of ["a", "b"]) {
    $("tab-" + s).addEventListener("click", () => selectTab(s));
    $("tab-" + s).addEventListener("keydown", (e) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        const next =
          e.key === "Home"
            ? "a"
            : e.key === "End"
              ? "b"
              : active === "a"
                ? "b"
                : "a";
        selectTab(next);
        $("tab-" + next).focus();
      }
    });
  }
  $("copy").addEventListener("click", async () => {
    if (dirty || !experiment) return;
    const text = experiment.prompts[active];
    try {
      if (location.protocol === "file:" || !navigator.clipboard) throw Error("Use local selection fallback");
      await navigator.clipboard.writeText(text);
      message(
        "Prompt " +
          active.toUpperCase() +
          " copied. Use a fresh chat for each version.",
      );
    } catch {
      const range = document.createRange();
      range.selectNodeContents($("text-" + active));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      message(
        "Prompt selected. Press Command+C on Mac or Control+C on Windows to copy it.",
      );
    }
  });
  function evaluate() {
    if (dirty || !experiment) {
      message("Rebuild the prompts after changing your notes or rules.", true);
      return;
    }
    if (!$("answer-a").value.trim() || !$("answer-b").value.trim()) {
      message("Paste both answers first, or load the worked example.", true);
      return;
    }
    const scores = {};
    for (const side of ["a", "b"]) {
      const score = P.scoreResponse(
        $("answer-" + side).value,
        experiment.settings,
      );
      scores[side] = score;
      $("result-" + side).textContent = `${score.passed}/${score.total} checks`;
      $("result-" + side).classList.add("checked");
      $("checks-" + side).replaceChildren();
      for (const check of score.checks) {
        const item = document.createElement("li");
        item.className = check.pass ? "pass" : "fail";
        item.textContent = (check.pass ? "✓ " : "× ") + check.label;
        if (check.detail) item.title = check.detail;
        $("checks-" + side).append(item);
      }
    }
    const delta = scores.b.passed - scores.a.passed;
    $("comparison-summary").textContent =
      (delta === 0
        ? "Both answers pass the same number of checks."
        : `${delta > 0 ? "B" : "A"} passes ${Math.abs(delta)} more check${Math.abs(delta) > 1 ? "s" : ""}.`) +
      ` A: ${scores.a.words} words · B: ${scores.b.words} words. Review the facts below.`;
    return scores;
  }
  $("evaluate").addEventListener("click", evaluate);
  for (const side of ["a", "b"])
    $("answer-" + side).addEventListener("input", () => {
      clearChecks();
      $("winner").value = "not-reviewed";
      $("review").value = "";
      if (source === "handwritten-example") source = "edited-example";
      updateProvenance();
    });
  $("example").addEventListener("click", () => {
    if (
      ($("answer-a").value || $("answer-b").value) &&
      !confirm(
        "Replace the current experiment with the handwritten worked example?",
      )
    )
      return;
    $("sample").value = P.cases[0].id;
    populateCase(P.cases[0].id);
    $("limit").value = 120;
    build(true);
    source = "handwritten-example";
    $("answer-a").value = P.demo.a;
    $("answer-b").value = P.demo.b;
    $("model").value = "None — handwritten example";
    selectTab("b");
    updateProvenance();
    evaluate();
    message(
      "Example loaded. Explore the checks, then build your own prompts to collect real responses.",
    );
  });
  $("export").addEventListener("click", () => {
    if (dirty || !experiment) {
      message("Rebuild the prompts before exporting.", true);
      return;
    }
    if (!$("answer-a").value.trim() || !$("answer-b").value.trim()) {
      message("Add both answers before downloading an experiment.", true);
      return;
    }
    const verdict = $("winner").value,
      notes = $("review").value.trim();
    if (verdict !== "not-reviewed" && !notes) {
      message("Add evidence for your verdict before downloading.", true);
      $("review").focus();
      return;
    }
    const result = P.report({
      ...experiment,
      source,
      model: $("model").value.trim(),
      responses: { a: $("answer-a").value, b: $("answer-b").value },
      review: { verdict, notes },
    });
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "promptlab-experiment.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message(
      "Experiment downloaded. It includes prompts, responses, checks, and your review.",
    );
  });
  populateCase(P.cases[0].id);
  build(true);
})();
