# Quoridor 2D Test Suite

## How to Launch the Tests

1. **Install dependencies** (if not already done):

   ```bash
   npm install
   ```

2. **Run all tests:**

   ```bash
   npm test
   ```

   Or, to run tests in watch mode (reruns on file changes):

   ```bash
   npm run test:watch
   ```

3. **See coverage report:**

   ```bash
   npm test -- --coverage
   ```

Make sure you are in the project root (`C:\Users\bakal\IdeaProjects\KALM\Quoridor-2d`) when running these commands.

## Notes

- The test runner is [Jest](https://jestjs.io/).
- Tests are located in the `tests` directory.
- If you encounter issues, ensure your `package.json` contains the correct Jest configuration.
