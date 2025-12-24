import { test, expect } from '@playwright/test'

/**
 * T075: Write E2E test for admin approval workflow
 * 
 * This test covers the complete admin approval flow from user registration
 * to admin review and approval/rejection actions.
 */

test.describe('Admin Approval Workflow E2E', () => {
  const pendingUser = {
    email: 'pending@example.com',
    password: 'pendingpassword123',
    name: 'Pending User'
  }

  const adminUser = {
    email: 'admin@example.com',
    password: 'adminpassword123'
  }

  const rejectedUser = {
    email: 'rejected@example.com', 
    password: 'rejectedpassword123',
    name: 'Rejected User'
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('complete admin approval workflow: signup → pending → admin approval → access', async ({ page, context }) => {
    // Step 1: User registers and gets pending status
    await test.step('User registers and gets pending approval status', async () => {
      await page.click('a[href="/signup"]')
      
      await page.fill('input[name="email"]', pendingUser.email)
      await page.fill('input[name="password"]', pendingUser.password)
      await page.fill('input[name="name"]', pendingUser.name)
      
      await page.click('button[type="submit"]')
      
      // Should be redirected to pending approval page
      await expect(page).toHaveURL('/pending-approval')
      await expect(page.locator('h1:has-text("Pending Approval")')).toBeVisible()
      await expect(page.locator('text=administrator')).toBeVisible()
    })

    // Step 2: User tries to access protected routes while pending
    await test.step('Pending user cannot access protected routes', async () => {
      // Try to access dashboard directly
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/pending-approval')
      
      // Try to access sessions
      await page.goto('/dashboard/sessions')
      await expect(page).toHaveURL('/pending-approval')
      
      // Try to access create session
      await page.goto('/dashboard/create-session')
      await expect(page).toHaveURL('/pending-approval')
    })

    // Step 3: Admin logs in and views pending users
    await test.step('Admin reviews pending users', async () => {
      // Open admin tab
      const adminPage = await context.newPage()
      await adminPage.goto('/login')
      
      await adminPage.fill('input[name="email"]', adminUser.email)
      await adminPage.fill('input[name="password"]', adminUser.password)
      await adminPage.click('button[type="submit"]')
      
      // Navigate to admin users page
      await adminPage.goto('/admin/users')
      await expect(adminPage).toHaveURL('/admin/users')
      
      // Should see the pending user in the list
      const pendingUserRow = adminPage.locator(`tr:has-text("${pendingUser.email}")`)
      await expect(pendingUserRow).toBeVisible()
      await expect(pendingUserRow.locator('text=Pending')).toBeVisible()
      
      // Should see approve and reject buttons
      await expect(pendingUserRow.locator('button:has-text("Approve")')).toBeVisible()
      await expect(pendingUserRow.locator('button:has-text("Reject")')).toBeVisible()
    })

    // Step 4: Admin approves the user
    await test.step('Admin approves pending user', async () => {
      const adminPage = context.pages().find(p => p.url().includes('/admin/users'))!
      
      const pendingUserRow = adminPage.locator(`tr:has-text("${pendingUser.email}")`)
      const approveButton = pendingUserRow.locator('button:has-text("Approve")')
      
      await approveButton.click()
      
      // Should show success message
      await expect(adminPage.locator('text=approved')).toBeVisible()
      
      // User status should change to Approved
      await expect(pendingUserRow.locator('text=Approved')).toBeVisible()
      
      // Approve button should be disabled/hidden
      await expect(pendingUserRow.locator('button:has-text("Approve")')).not.toBeVisible()
      
      await adminPage.close()
    })

    // Step 5: User can now access protected routes
    await test.step('Approved user can access protected routes', async () => {
      // Refresh the pending page
      await page.reload()
      
      // User should now be redirected to dashboard
      await expect(page).toHaveURL('/dashboard')
      await expect(page.locator('text=Dashboard')).toBeVisible()
      
      // Can access sessions
      await page.goto('/dashboard/sessions')
      await expect(page).toHaveURL('/dashboard/sessions')
      
      // Can access create session
      await page.goto('/dashboard/create-session')
      await expect(page).toHaveURL('/dashboard/create-session')
    })
  })

  test('admin rejection workflow prevents user access', async ({ page, context }) => {
    // Step 1: Another user registers
    await test.step('User registers for rejection test', async () => {
      await page.click('a[href="/signup"]')
      
      await page.fill('input[name="email"]', rejectedUser.email)
      await page.fill('input[name="password"]', rejectedUser.password)
      await page.fill('input[name="name"]', rejectedUser.name)
      
      await page.click('button[type="submit"]')
      
      await expect(page).toHaveURL('/pending-approval')
    })

    // Step 2: Admin rejects the user
    await test.step('Admin rejects user', async () => {
      const adminPage = await context.newPage()
      await adminPage.goto('/login')
      
      await adminPage.fill('input[name="email"]', adminUser.email)
      await adminPage.fill('input[name="password"]', adminUser.password)
      await adminPage.click('button[type="submit"]')
      
      await adminPage.goto('/admin/users')
      
      const rejectedUserRow = adminPage.locator(`tr:has-text("${rejectedUser.email}")`)
      const rejectButton = rejectedUserRow.locator('button:has-text("Reject")')
      
      await rejectButton.click()
      
      // Should show rejection confirmation
      await expect(adminPage.locator('text=rejected')).toBeVisible()
      
      // User status should change to Rejected
      await expect(rejectedUserRow.locator('text=Rejected')).toBeVisible()
      
      await adminPage.close()
    })

    // Step 3: Rejected user still cannot access protected routes
    await test.step('Rejected user cannot access protected routes', async () => {
      await page.reload()
      
      // Should still be on pending approval or redirected to a rejection page
      if (await page.locator('text=rejected').isVisible()) {
        // Custom rejection page
        await expect(page.locator('text=rejected')).toBeVisible()
      } else {
        // Still on pending page
        await expect(page).toHaveURL('/pending-approval')
      }
      
      // Try accessing dashboard
      await page.goto('/dashboard')
      await expect(page).not.toHaveURL('/dashboard')
    })
  })

  test('admin can manage multiple users efficiently', async ({ page }) => {
    // This test verifies bulk operations and filtering in admin panel
    await test.step('Admin can filter and manage multiple users', async () => {
      await page.goto('/login')
      await page.fill('input[name="email"]', adminUser.email)
      await page.fill('input[name="password"]', adminUser.password)
      await page.click('button[type="submit"]')
      
      await page.goto('/admin/users')
      
      // Should see user list with different statuses
      await expect(page.locator('tr:has-text("Pending")')).toBeVisible()
      await expect(page.locator('tr:has-text("Approved")')).toBeVisible()
      
      // Test filtering by status (if implemented)
      const statusFilter = page.locator('select[name="status"]')
      if (await statusFilter.count() > 0) {
        await statusFilter.selectOption('pending')
        await expect(page.locator('tr:has-text("Approved")')).not.toBeVisible()
        await expect(page.locator('tr:has-text("Pending")')).toBeVisible()
      }
      
      // Test search functionality (if implemented) 
      const searchInput = page.locator('input[placeholder*="search" i]')
      if (await searchInput.count() > 0) {
        await searchInput.fill(pendingUser.email)
        await expect(page.locator(`tr:has-text("${pendingUser.email}")`)).toBeVisible()
      }
    })
  })

  test('non-admin users cannot access admin routes', async ({ page }) => {
    await test.step('Regular users redirected from admin routes', async () => {
      // Login as regular user
      await page.goto('/login')
      await page.fill('input[name="email"]', pendingUser.email)
      await page.fill('input[name="password"]', pendingUser.password)
      await page.click('button[type="submit"]')
      
      // Try to access admin routes
      await page.goto('/admin/users')
      
      // Should be redirected away from admin routes
      await expect(page).not.toHaveURL('/admin/users')
      // Likely redirected to dashboard or get 403 error
      if (!page.url().includes('/dashboard')) {
        await expect(page.locator('text=403')).toBeVisible()
      }
    })
  })
})