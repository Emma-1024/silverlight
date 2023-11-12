# Silverlight Project

Based on Remix Blues Stack

## Feature

- Email/Password Authentication with [cookie-based sessions](https://remix.run/utils/sessions#createcookiesessionstorage)
- Database ORM with [Prisma](https://prisma.io)
- Local third party request mocking with [MSW](https://mswjs.io)
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)
- Consistent file format with [EditorConfig](https://editorconfig.org/)
- Auto-formating with Git hook by using [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged)
- Styling with [Tailwind](https://tailwindcss.com/)
- Using component library [daisyUI](https://daisyui.com/) for Tailwind CSS
- Changing theme with [theme-change](https://github.com/saadeghi/theme-change)
- Generating svg-sprites by [rmx-cli](https://github.com/kiliman/rmx-cli)
- Internationalization with [i18next](https://github.com/sergiodxa/remix-i18next)
- Session stores in DB and will automatically extend expire time when used
- Strategy-based authentication with [remix-auth](https://github.com/sergiodxa/remix-auth)
- Role-based User Permissions
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
- End-to-end testing with [Playwright](https://playwright.dev/)

## Development

- Setup the git pre-commit hooks

  ```sh
  npm run prepare
  ```

  > You only need to run this once you setup a new dev environment.

- Start the Postgres Database in [Docker](https://www.docker.com/get-started):

  ```sh
  npm run docker-db-up
  ```

  > **Note:** The npm script will complete while Docker sets up the container in the background. Ensure that Docker has finished and your container is running before proceeding.

  > You only need to run this once you setup a new dev environment.

- Initial setup:

  ```sh
  npm run setup
  ```

- Run the first build:

  ```sh
  npm run build
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `rachel@remix.run`
- Password: `racheliscool`

### Relevant code:

This is a pretty simple note-taking app, but it's a good example of how you can build a full stack app with Prisma and Remix. The main functionality is creating users, logging in and out, and creating and deleting notes. Meantime you can change multiple language and theme.

- models for creating and deleting users, role, permission, session, and note [./app/models](./app/models)
- using `remix-auth` to implement authentication, containing session extending expiration, login verifying and logout [./app/auth.server.ts](./app/auth.server.ts)
- creating cookie session [./app/cookieSession.server.ts](./app/cookieSession.server.ts)
- using `remix-i18next` to implement i18n [./app/i18next.server.ts](./app/i18next.server.ts)
- using `theme-change` to changing theme [./app/root.ts](./app/root.ts)

### Debug

#### VS Code

Press `F1` and input `Debug: Debug npm Script`, then choose `dev`

> Breakpoint can work smoothly

### Upgrade npm package

- Install npm-check-updates

```sh
npm install -g npm-check-updates
```

- Check all dependencies (excluding peerDependencies) for the project in the current directory:

```sh
ncu
```

- Upgrade `package.json` and install updates interactively

```sh
ncu --interactive --format group
```

## Testing

### Playwright

We use Playwright for our End-to-End tests in this project. As you make changes, add to an existing file or create a new file in the tests/e2e directory to test your changes.

To run these tests in development, run `npm run test:e2e:dev` which will start the dev server for the app as well as the Playwright client. And also can run `npx playwright test` which will just run tests in without interactive UI mode. Make sure the database is running in docker as described above.

We have a playwright.config.ts file with project dependencies and define a `setup` project that runs before all other projects. When we run `npm run test:e2e:dev` it will be automatically generate `loginAuth.json` in directory `"playwright/.auth"` that contains authenticated information for login.

We add a teardown property to our setup project. This will run after all dependent projects have run and will be auto-delete the user at the end of your test without need to add this in each test file.

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.js`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.
