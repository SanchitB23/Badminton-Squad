import { test, expect } from '@playwright/test'

/**
 * T074: Write E2E test for full user journey: signup → create session → respond → comment
 * 
 * This test covers the complete user flow from registration to participating in sessions.
 * Prerequisites: Clean database state, admin user available for approval
 */

test.describe('User Journey E2E', () => {
  const testUser = {
    email: 'testuser@example.com',
    password: 'testpassword123',
    name: 'Test User'
  }

  const adminUser = {
    email: 'admin@example.com',
    password: 'adminpassword123'
  }

  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('complete user journey: signup → approval → create session → respond → comment', async ({ page, context }) => {
    // Step 1: User Signup
    await test.step('User signs up', async () => {
      await page.click('a[href="/signup"]')
      await expect(page).toHaveURL('/signup')

      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.fill('input[name="name"]', testUser.name)
      
      await page.click('button[type="submit"]')
      
      // Should redirect to pending approval page
      await expect(page).toHaveURL('/pending-approval')
      await expect(page.locator('text=pending approval')).toBeVisible()
    })

    // Step 2: Admin approves user (simulate admin action)
    await test.step('Admin approves user', async () => {
      // Open new tab for admin actions
      const adminPage = await context.newPage()
      await adminPage.goto('/login')
      
      await adminPage.fill('input[name="email"]', adminUser.email)
      await adminPage.fill('input[name="password"]', adminUser.password)
      await adminPage.click('button[type="submit"]')
      
      // Navigate to admin panel
      await adminPage.goto('/admin/users')
      
      // Find and approve the test user
      const userRow = adminPage.locator(`tr:has-text("${testUser.email}")`)
      await expect(userRow).toBeVisible()
      
      const approveButton = userRow.locator('button:has-text("Approve")')
      await approveButton.click()
      
      await expect(userRow.locator('text=Approved')).toBeVisible()
      
      await adminPage.close()
    })

    // Step 3: User logs in after approval
    await test.step('User logs in after approval', async () => {
      await page.reload()
      
      // If still on pending approval, navigate to login
      if (await page.locator('text=pending approval').isVisible()) {
        await page.goto('/login')
      }
      
      if (page.url().includes('/login')) {
        await page.fill('input[name="email"]', testUser.email)
        await page.fill('input[name="password"]', testUser.password)
        await page.click('button[type="submit"]')
      }
      
      // Should now access the dashboard
      await expect(page).toHaveURL('/dashboard')
      await expect(page.locator('text=Dashboard')).toBeVisible()
    })

    // Step 4: Create a new session
    const sessionTitle = 'Test Badminton Session'
    const sessionLocation = 'Test Court'
    
    await test.step('User creates a new session', async () => {
      await page.click('a[href="/dashboard/create-session"]')
      await expect(page).toHaveURL('/dashboard/create-session')

      await page.fill('input[name="title"]', sessionTitle)
      await page.fill('input[name="location"]', sessionLocation)
      
      // Set future date (day after tomorrow)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 2)
      const dateString = futureDate.toISOString().split('T')[0]
      
      await page.fill('input[name="date"]', dateString)
      await page.fill('input[name="start_time"]', '18:00')
      await page.fill('input[name="end_time"]', '20:00')
      
      await page.click('button[type="submit"]')
      
      // Should redirect to sessions list
      await expect(page).toHaveURL('/dashboard/sessions')
      await expect(page.locator(`text=${sessionTitle}`)).toBeVisible()
    })

    // Step 5: Navigate to session details and respond
    await test.step('User responds to the session', async () => {
      const sessionCard = page.locator(`div:has-text("${sessionTitle}")`)
      await sessionCard.locator('a:has-text("View details")').click()
      
      await expect(page).toHaveURL(/\/dashboard\/session\/[^/]+/)
      await expect(page.locator(`text=${sessionTitle}`)).toBeVisible()
      
      // Set response to COMING
      await page.click('button:has-text("Coming")')
      
      // Verify response is updated
      await expect(page.locator('button:has-text("Coming")').first()).toHaveClass(/selected|active/)
    })

    // Step 6: Add a comment to the session
    const commentText = 'Looking forward to this session!'
    
    await test.step('User adds a comment', async () => {
      const commentInput = page.locator('textarea[placeholder*="comment" i]')
      await commentInput.fill(commentText)
      
      await page.click('button:has-text("Post Comment")')
      
      // Verify comment appears
      await expect(page.locator(`text=${commentText}`)).toBeVisible()
      await expect(page.locator(`text=${testUser.name}`)).toBeVisible()
    })

    // Step 7: Reply to the comment (optional enhancement)
    await test.step('User replies to comment', async () => {
      const replyText = 'Me too! Should be fun.'
      
      const commentDiv = page.locator(`div:has-text("${commentText}")`)
      await commentDiv.locator('button:has-text("Reply")').click()
      
      const replyInput = commentDiv.locator('textarea').last()
      await replyInput.fill(replyText)
      
      await commentDiv.locator('button:has-text("Post Reply")').click()
      
      // Verify reply appears
      await expect(page.locator(`text=${replyText}`)).toBeVisible()
    })

    // Step 8: Navigate back to sessions list and verify updates
    await test.step('Verify session appears in sessions list with updates', async () => {
      await page.goto('/dashboard/sessions')
      
      const sessionCard = page.locator(`div:has-text("${sessionTitle}")`)
      await expect(sessionCard).toBeVisible()
      
      // Verify response count shows 1 coming
      await expect(sessionCard.locator('text=1')).toBeVisible()
      
      // Verify courts calculation (ceil(1/4) = 1)
      await expect(sessionCard.locator('text=1 court')).toBeVisible()
    })
  })

  test('handles session response cutoff correctly', async ({ page }) => {
    // This test verifies that users cannot respond after the cutoff time
    await test.step('Cannot respond to session after cutoff', async () => {
      // Login as existing user
      await page.goto('/login')
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')

      await page.goto('/dashboard/sessions')
      
      // Look for a session that should be past cutoff (created for today)
      const todaySession = page.locator('div:has-text("today")')
      
      if (await todaySession.count() > 0) {
        await todaySession.locator('a:has-text("View details")').first().click()
        
        // Response buttons should be disabled
        const comingButton = page.locator('button:has-text("Coming")')
        await expect(comingButton).toBeDisabled()
        
        // Should show cutoff message
        await expect(page.locator('text=cutoff')).toBeVisible()
      }
    })
  })
})