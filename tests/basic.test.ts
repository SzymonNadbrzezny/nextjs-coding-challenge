import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  console.log("Navigating to homepage...");
  await page.goto("http://localhost:3000/");
  await page.evaluate(() => sessionStorage.removeItem("keyToRemove"));
  console.log("Checking initial main content snapshot...");
  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
    - main:
      - text: Enter Your Username
      - textbox "Username"
      - button "Submit"
      - table:
        - rowgroup:
          - row "User Name Accuracy (%) Words per minute Streak":
            - cell "User Name":
              - button "User Name"
            - cell "Accuracy (%)":
              - button "Accuracy (%)"
            - cell "Words per minute":
              - button "Words per minute"
            - cell "Streak"
        - rowgroup:
          - row "No results.":
            - cell "No results."
      - button "Previous" [disabled]
      - button "Next" [disabled]
    `);
  console.log("Clicking submit with empty username...");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Please provide username.")).toBeVisible();
  console.log("Filling username as 'Test'...");
  await page.getByRole("textbox", { name: "Username" }).fill("Test");
  await page.getByRole("button", { name: "Submit" }).click();

  console.log("Starting the typing test...");
  await page.getByRole("button", { name: "Start Test" }).click();
  const testSentence = await page.getByLabel("test-sentence").innerText();
  console.log("Test sentence to type:", testSentence);
  await page
    .getByRole("textbox", { name: "Start typing..." })
    .pressSequentially(testSentence, { delay: 100 })
    .then(async () => {
      console.log("Finished typing, checking results table snapshot...");
      await expect(page.getByRole("main")).toMatchAriaSnapshot(`
        - table:
          - rowgroup:
            - row "User Name Accuracy (%) Words per minute Streak":
              - cell "User Name":
                - button "User Name"
              - cell "Accuracy (%)":
                - button "Accuracy (%)"
              - cell "Words per minute":
                - button "Words per minute"
              - cell "Streak"
          - rowgroup:
            - row /Test \\d+\\.\\d+ \\d+\\.\\d+ \\d+/:
              - cell "Test"
              - cell /\\d+\\.\\d+/
              - cell /\\d+\\.\\d+/
              - cell /\\d+/
        - button "Previous" [disabled]
        - button "Next" [disabled]
        `);
    });
});
