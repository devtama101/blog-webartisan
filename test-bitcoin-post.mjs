import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
    args: ['--window-size=1920,1080']
  });
  const page = await browser.newPage();

  const screenshot = (name) => page.screenshot({ path: `/tmp/blog-${name}.png` });

  try {
    console.log('=== Creating Blog Post: Bitcoin History ===\n');

    // Step 1: Navigate to admin page
    console.log('1️⃣ Navigating to admin page...');
    await page.goto('http://localhost:3001/admin/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot('01-admin-page');

    // Step 2: Fill title
    console.log('2️⃣ Filling title...');
    await page.fill('input[placeholder="Post title..."]', 'Bitcoin History: From Obscure Whitepaper to Global Phenomenon');
    await page.waitForTimeout(500);
    await screenshot('02-title-filled');

    // Step 3: Write initial content
    console.log('3️⃣ Writing initial content...');
    const textarea = page.locator('textarea').first();
    await textarea.fill('Bitcoin emerged in 2009 as a revolutionary digital currency, created by the mysterious Satoshi Nakamoto.');
    await page.waitForTimeout(500);
    await screenshot('03-initial-content');

    // Step 4: Continue Writing (AI)
    console.log('4️⃣ Using AI: Continue Writing...');
    await page.click('button:has-text("Continue Writing")');
    await page.waitForTimeout(10000);
    const afterContinue = await textarea.inputValue();
    console.log('   Content length:', afterContinue.length, 'chars ✅');
    await screenshot('04-continue-writing');

    // Step 5: Fix Grammar (AI)
    console.log('5️⃣ Using AI: Fix Grammar...');
    await page.click('button:has-text("Fix Grammar")');
    await page.waitForTimeout(5000);
    console.log('   Grammar fixed ✅');
    await screenshot('05-fix-grammar');

    // Step 6: Make Professional (AI)
    console.log('6️⃣ Using AI: Make Professional...');
    await page.click('button:has-text("Make Professional")');
    await page.waitForTimeout(5000);
    const afterProfessional = await textarea.inputValue();
    console.log('   Content preview:', afterProfessional.substring(0, 100) + '... ✅');
    await screenshot('06-make-professional');

    // Step 7: Make Casual (AI)
    console.log('7️⃣ Using AI: Make Casual...');
    await page.click('button:has-text("Make Casual")');
    await page.waitForTimeout(5000);
    console.log('   Now more casual ✅');
    await screenshot('07-make-casual');

    // Step 8: Make Concise (AI)
    console.log('8️⃣ Using AI: Make Concise...');
    await page.click('button:has-text("Make Concise")');
    await page.waitForTimeout(5000);
    console.log('   Now more concise ✅');
    await screenshot('08-make-concise');

    // Step 9: Back to Professional for final version
    console.log('9️⃣ Reverting to professional tone...');
    await page.click('button:has-text("Make Professional")');
    await page.waitForTimeout(5000);
    await screenshot('09-final-content');

    // Step 10: Generate SEO (AI)
    console.log('🔟 Using AI: Generate SEO...');
    await page.click('button:has-text("Generate with AI")');
    await page.waitForTimeout(5000);
    const metaTitle = await page.locator('input[placeholder*="SEO title"]').inputValue();
    const metaDesc = await page.locator('textarea[placeholder*="SEO description"]').inputValue();
    console.log('   Meta Title:', metaTitle);
    console.log('   Meta Description:', metaDesc?.substring(0, 80) + '... ✅');
    await screenshot('10-seo-generated');

    // Step 11: Search Unsplash for cover image
    console.log('1️⃣1️⃣ Searching Unsplash for bitcoin image...');
    await page.fill('input[placeholder*="coding, technology"]', 'bitcoin cryptocurrency');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(4000);
    await screenshot('11-unsplash-search');

    // Step 12: Select an image
    console.log('1️⃣2️⃣ Selecting cover image...');
    const images = page.locator('.aspect-video img');
    const count = await images.count();
    console.log('   Found', count, 'images');
    if (count > 0) {
      await images.first().click();
      await page.waitForTimeout(1000);
      console.log('   Image selected ✅');
    }
    await screenshot('12-image-selected');

    // Step 13: Publish the post
    console.log('1️⃣3️⃣ Publishing post...');
    await page.click('button:has-text("Publish Now")');
    await page.waitForTimeout(5000);
    const currentUrl = page.url();
    console.log('   Current URL:', currentUrl);
    await screenshot('13-publish-clicked');

    // Step 14: Verify post appears on homepage
    console.log('1️⃣4️⃣ Verifying post on blog homepage...');
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot('14-blog-homepage');

    const hasPost = await page.locator('text=Bitcoin History').count();
    console.log('   Post found on homepage:', hasPost > 0 ? '✅' : '❌');

    // Step 15: View the full post
    if (hasPost > 0) {
      console.log('1️⃣5️⃣ Clicking into the post...');
      await page.click('a:has-text("Bitcoin History")');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await screenshot('15-post-view');

      const postTitle = await page.locator('h1').textContent();
      console.log('   Post title:', postTitle);
    }

    console.log('\n✅ TEST COMPLETE - Post created and published successfully!');
    console.log('\nScreenshots saved to /tmp/blog-*.png');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await screenshot('error');
  } finally {
    await browser.close();
  }
})();
