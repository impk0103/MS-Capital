const puppeteer = require('puppeteer');
const readline = require('readline');
const { phoneNumber, password } = require('../Task/credentials');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

// Handle time increment
const incrementTime = (time, minutesToAdd) => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const pages = await browser.pages();
  let firstPage = pages[0];

  const { width, height } = await firstPage.evaluate(() => ({
    width: window.screen.availWidth,
    height: window.screen.availHeight
  }));
  await firstPage.setViewport({ width, height });

  // Function to login
  const login = async (page) => {
    // Go to AlgoTest homepage
    await page.goto('https://algotest.in/');

    // Wait for the login button and click it
    await page.waitForSelector('#__next > div > div > div.sticky.top-0.z-30.flex.h-16.items-center.justify-between.bg-white.px-4.py-5.\\!font-Inter.text-primaryBlack-750.md\\:px-5 > div.flex.items-center.justify-end.gap-2.md\\:gap-4 > button.border.border-secondaryBlue-900.text-secondaryBlue-900.hover\\:bg-secondaryBlue-900.hover\\:text-white.font-semibold.leading-2.relative.flex.items-center.justify-center.gap-2.rounded.px-3.py-3.text-center.text-xs.duration-75.md\\:px-4.md\\:py-3.md\\:leading-4.\\!border-branding-900.\\!py-1\\.5.\\!text-branding-900.hover\\:\\!text-white');
    await page.click('#__next > div > div > div.sticky.top-0.z-30.flex.h-16.items-center.justify-between.bg-white.px-4.py-5.\\!font-Inter.text-primaryBlack-750.md\\:px-5 > div.flex.items-center.justify-end.gap-2.md\\:gap-4 > button.border.border-secondaryBlue-900.text-secondaryBlue-900.hover\\:bg-secondaryBlue-900.hover\\:text-white.font-semibold.leading-2.relative.flex.items-center.justify-center.gap-2.rounded.px-3.py-3.text-center.text-xs.duration-75.md\\:px-4.md\\:py-3.md\\:leading-4.\\!border-branding-900.\\!py-1\\.5.\\!text-branding-900.hover\\:\\!text-white');

    // Enter phone number
    await page.waitForSelector('#loginFormID > div.flex.w-full.flex-col.gap-2 > input[type="tel"]');
    await page.type('#loginFormID > div.flex.w-full.flex-col.gap-2 > input[type="tel"]', phoneNumber);

    // Enter password
    await page.waitForSelector('#loginFormID > div:nth-child(2) > div > input[type="password"]');
    await page.type('#loginFormID > div:nth-child(2) > div > input[type="password"]', password);

    // Press Enter to login
    await page.keyboard.press('Enter');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
  };

  // Run backtest with given entry time
  const runBacktest = async (strategyName, entryTime, exitTime, startDate, endDate, page) => {
    // Enter strategy name
    await page.waitForSelector('#__next > div > div > div.fixed.z-30.flex.flex-col.justify-between.bg-primaryBlack-750.shadow-xl.print\\:hidden.top-12.h-verticalBarHeight.w-48.overflow-auto > div:nth-child(1) > div.p-2 > div > div.flex.w-full.flex-col.gap-2 > input');
    await page.type('#__next > div > div > div.fixed.z-30.flex.flex-col.justify-between.bg-primaryBlack-750.shadow-xl.print\\:hidden.top-12.h-verticalBarHeight.w-48.overflow-auto > div:nth-child(1) > div.p-2 > div > div.flex.w-full.flex-col.gap-2 > input', strategyName);

    await page.keyboard.press('Enter');

    
    
    await page.waitForSelector('#__next > div > div > div.fixed.z-30.flex.flex-col.justify-between.bg-primaryBlack-750.shadow-xl.print\\:hidden.top-12.h-verticalBarHeight.w-48.overflow-auto > div:nth-child(1) > div:nth-child(3) > ul > li');
    await page.click('#__next > div > div > div.fixed.z-30.flex.flex-col.justify-between.bg-primaryBlack-750.shadow-xl.print\\:hidden.top-12.h-verticalBarHeight.w-48.overflow-auto > div:nth-child(1) > div:nth-child(3) > ul > li');

    

    // Enter entry time
    await page.waitForSelector('#indicator-settings > div:nth-child(1) input');
    await page.type('#indicator-settings > div:nth-child(1) input', entryTime);

    // Enter exit time 
    await page.waitForSelector('#indicator-settings > div.flex.flex-col.items-start.justify-center.gap-3 > div.flex.w-full.items-center.justify-center.gap-2.flex-row > div > div > input');
    await page.type('#indicator-settings > div.flex.flex-col.items-start.justify-center.gap-3 > div.flex.w-full.items-center.justify-center.gap-2.flex-row > div > div > input', exitTime);

    // Enter start date
    await page.waitForSelector('#strategy-date-input > div:nth-child(1) > input');
    await page.type('#strategy-date-input > div:nth-child(1) > input', startDate);

    // Enter end date
    await page.waitForSelector('#strategy-date-input > div:nth-child(2) > input');
    await page.type('#strategy-date-input > div:nth-child(2) > input', endDate);

    // Run backtest
    await page.click('.border-green-600.bg-green-600');
    
    
  };

  // Prompt user for inputs
  const strategyName = await askQuestion("Enter the strategy name: ");
  const baseEntryTime = await askQuestion("Enter the base entry time (HH:MM format): ");
  const exitTime = await askQuestion("Enter the exit time (HH:MM format): ");
  const loopCount = parseInt(await askQuestion("Enter the number of iterations: "), 10);
  const startDate = await askQuestion("Enter the start date (DD-MM-YYYY format): ");
  const endDate = await askQuestion("Enter the end date (DD-MM-YYYY format): ");
  rl.close();

  // Initial login
  await login(firstPage);

  // Get dashboard URL
  const url = firstPage.url();

  for (let i = 0; i < loopCount; i++) {
    const entryTime = incrementTime(baseEntryTime, i);

    // Run backtest with entry time
    await runBacktest(strategyName, entryTime, exitTime, startDate, endDate, firstPage);

    // Delay
    await new Promise(resolve => setTimeout(resolve, 60000));

    // Open a new tab
    if (i < loopCount - 1) {
      const newPage = await browser.newPage();
      await newPage.setViewport({ width, height });
      await newPage.goto(url);

      // // Click on the go dashboard button
      // await newPage.waitForSelector('#__next > div > div > div.flex.w-full.flex-col.items-center.justify-center.md\\:bg-hero.md\\:bg-right.md\\:bg-no-repeat > div > div > div > button');
      // await newPage.click('#__next > div > div > div.flex.w-full.flex-col.items-center.justify-center.md\\:bg-hero.md\\:bg-right.md\\:bg-no-repeat > div > div > div > button');

      firstPage = newPage;
    }
  }

  await browser.close();
})();
