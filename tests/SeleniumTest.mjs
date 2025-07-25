import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';

// Get the argument (default to 'local' if not provided)
const environment = process.argv[2] || 'local';

// URLs based on environment
// Obtain dev selenium server IP using: docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' selenium-server
const seleniumUrl = environment === 'github' 
  ? 'http://selenium:4444/wd/hub' 
  : 'http://localhost:4444/wd/hub';

// Note: Start the nodejs server before running the test locally
const serverUrl = environment === 'github' 
  ? 'http://testserver' 
  : 'http://host.docker.internal';

console.log(`Running tests in '${environment}' environment`);
console.log(`Selenium URL: ${seleniumUrl}`);
console.log(`Server URL: ${serverUrl}`);

(async function testPasswordValidation() {

    console.log("before driver init")

    // Initialize the WebDriver with Chrome
    const driver = environment === 'github' 
        ? await new Builder()
        .forBrowser('chrome')
        .usingServer(seleniumUrl) // Specify the Selenium server
        .build()
        : await new Builder()
        .forBrowser('chrome')
        .usingServer(seleniumUrl) // Specify the Selenium server
        .build();

    try {
        console.log("after driver init")
        
        await driver.get(serverUrl);
        console.log("after driver.get serverUrl")

        // Test 1: Valid Password (8+ characters, not common)
        console.log("Testing valid password...");
        await testPassword(driver, "ValidPass123!", true);

        // Test 2: Invalid Password - Too short (less than 8 characters)
        console.log("Testing invalid password (too short)...");
        await testPassword(driver, "Short1!", false);

        // Test 3: Invalid Password - Common password from the list
        console.log("Testing invalid password (common password)...");
        await testPassword(driver, "password", false);

        // Test 4: Another valid password (8+ characters, not common)
        console.log("Testing another valid password...");
        await testPassword(driver, "MySecure2024Pass", true);

        // Test 5: Invalid - Another common password
        console.log("Testing invalid password (another common password)...");
        await testPassword(driver, "123456", false);

        // Test 6: Valid - Long unique password
        console.log("Testing valid long password...");
        await testPassword(driver, "ThisIsAVeryLongAndUniquePassword2024", true);

        console.log('All password validation tests passed!');

    } catch (err) {
        console.error('Test failed:', err);
        throw err;
    } finally {
        // Quit the browser session
        await driver.quit();
    }
})();

async function testPassword(driver, password, shouldBeValid) {
    try {
        // Navigate back to home page for each test
        await driver.get(serverUrl);

        // Find the password input field
        const passwordInput = await driver.wait(
            until.elementLocated(By.id('password')),
            5000
        );

        // Clear the input field and enter the password
        await passwordInput.clear();
        await passwordInput.sendKeys(password);

        // Find and click the validate button
        const validateButton = await driver.findElement(By.css('button[type="submit"]'));
        await validateButton.click();

        // Wait for the response
        await driver.sleep(2000);

        if (shouldBeValid) {
            // For valid passwords, expect redirect to /valid page
            const currentUrl = await driver.getCurrentUrl();
            assert.ok(
                currentUrl.includes('/valid'),
                `Expected valid password "${password}" to redirect to /valid page, but current URL is: ${currentUrl}`
            );

            // Check that the password is displayed on the valid page
            const pageText = await driver.findElement(By.tagName('body')).getText();
            assert.ok(
                pageText.includes('Your password was accepted'),
                `Expected valid page to show acceptance message, but got: ${pageText}`
            );

            console.log(`✓ Valid password "${password}" test passed - redirected to success page`);

        } else {
            // For invalid passwords, expect to stay on same page with error message
            const currentUrl = await driver.getCurrentUrl();
            assert.ok(
                !currentUrl.includes('/valid'),
                `Expected invalid password "${password}" to stay on main page, but redirected to: ${currentUrl}`
            );

            // Check the error message
            const messageElement = await driver.wait(
                until.elementLocated(By.id('message')),
                5000
            );

            const messageText = await messageElement.getText();
            console.log(`Password: "${password}" - Message: ${messageText}`);

            assert.ok(
                messageText.includes('must be at least') || 
                messageText.includes('too common') ||
                messageText.length > 0,
                `Expected invalid password "${password}" to show error message, but got: ${messageText}`
            );

            console.log(`✓ Invalid password "${password}" test passed - showed error message`);
        }

    } catch (err) {
        console.error(`✗ Password "${password}" test failed:`, err.message);
        throw err;
    }
}
