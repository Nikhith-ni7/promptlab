/* Optional UI checks. Requires Playwright and a Chromium installation. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1150 },
  });
  const errors = [],
    network = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (/^https?:/.test(r.url())) network.push(r.url());
  });
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(pathToFileURL(path.resolve(__dirname, "../index.html")).href);
  assert.ok((await page.locator("#text-a").innerText()).includes("React"));
  await page.getByRole("button", { name: "Load worked example" }).click();
  assert.equal(await page.locator("#result-a").innerText(), "3/5 checks");
  assert.equal(await page.locator("#result-b").innerText(), "5/5 checks");
  assert.ok(
    (await page.locator("#provenance").innerText()).includes("handwritten"),
  );
  await page.screenshot({
    path: path.resolve(__dirname, "../docs/desktop.png"),
    fullPage: true,
  });
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download experiment JSON" }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
  assert.equal(exported.source, "handwritten-example");
  await page.locator("#answer-b").fill('{"bad":true}');
  assert.ok(
    (await page.locator("#provenance").innerText()).includes("Edited example"),
  );
  await page.getByRole("button", { name: "Check both answers" }).click();
  assert.ok(
    (await page.locator("#checks-b .fail").allTextContents()).some((s) =>
      s.includes("All 6 fields"),
    ),
  );
  await page
    .getByLabel("Rough notes", { exact: true })
    .fill("Make a read-only dashboard. <img src=x onerror=alert(1)>");
  assert.equal(
    await page.getByRole("button", { name: "Check both answers" }).isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "Build the two prompts" }).click();
  assert.equal(await page.locator("#answer-b").inputValue(), "");
  assert.ok((await page.locator("#text-b").innerText()).includes("&lt;img"));
  assert.equal(await page.locator(".prompt-body img").count(), 0);
  await page.getByLabel("Practice case").selectOption("ambiguous");
  await page.getByRole("button", { name: "Build the two prompts" }).click();
  assert.ok((await page.locator("#text-b").innerText()).includes("onboarding"));
  await page.getByRole("button", { name: "Check both answers" }).click();
  assert.ok(
    (await page.locator("#status").innerText()).includes("Paste both answers"),
  );
  await page.getByRole("button", { name: "Load worked example" }).click();
  await page.getByRole("tab", { name: "A Basic prompt" }).click();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page.locator("#tab-b").getAttribute("aria-selected"),
    "true",
  );
  await page.getByRole("button", { name: "Copy prompt B" }).click();
  await page.waitForFunction(() => /copied|selected/.test(document.querySelector("#status").textContent));
  assert.match(await page.locator("#status").innerText(), /copied|selected/);
  await page.getByLabel("Your verdict").selectOption("b");
  await page.getByRole("button", { name: "Download experiment JSON" }).click();
  assert.ok(
    (await page.locator("#status").innerText()).includes("Add evidence"),
  );
  await page.locator("#answer-b").fill("Changed answer");
  assert.equal(
    await page.getByLabel("Your verdict").inputValue(),
    "not-reviewed",
  );
  await page.getByRole("button", { name: "Load worked example" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: path.resolve(__dirname, "../docs/mobile.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  assert.deepEqual(network, []);
  await browser.close();
  console.log(
    JSON.stringify(
      {
        status: "passed",
        checks: [
          "Direct file opening",
          "Fixture scoring",
          "Synthetic provenance",
          "JSON download",
          "Edited-fixture provenance",
          "Malformed response checks",
          "Stale experiment guard",
          "HTML rendered as text",
          "Practice cases",
          "Empty-answer guidance",
          "Keyboard tab navigation",
          "Copy or selection fallback",
          "Human-review validation",
          "Review invalidation after answer edits",
          "Mobile overflow",
          "No browser exceptions",
          "No HTTP requests",
        ],
      },
      null,
      2,
    ),
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
