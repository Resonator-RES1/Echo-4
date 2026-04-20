import { test, expect } from '@playwright/test';

test('Golden Path: Draft, Audit, Graft, Commit', async ({ page }) => {
  await page.goto('/');
  
  // 1. Enter Workspace
  await page.getByRole('button', { name: /Workspace/i }).click();
  await expect(page).toHaveURL(/.*\/workspace/);

  // 2. Draft content
  const editor = page.locator('.ProseMirror');
  await editor.fill('This is a test draft for the golden path.');
  
  // 3. Navigate to Refine/Audit (simulated)
  await page.getByRole('button', { name: 'Audit', exact: true }).click();
  
  // 4. Trigger refinement
  await page.getByRole('button', { name: 'Audit', exact: true }).click();
  
  // 5. Audit (wait for report)
  await page.getByRole('button', { name: 'Audit Log', exact: true }).click();
  await expect(page.locator('[data-testid="report-panel"]')).toBeVisible({ timeout: 10000 });
  
  // 6. Graft (Open for Surgery)
  await page.getByRole('button', { name: /Open for Surgery/i }).click();
  await expect(page.locator('[data-testid="workbench-view"]')).toBeVisible();
  
  // 7. Commit
  await page.getByRole('button', { name: 'Commit Polished', exact: true }).click();
  await expect(page.getByText(/committed/i)).toBeVisible();
});
