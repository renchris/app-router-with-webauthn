<p align="center">
  <a href="https://github.com/renchris/app-router-with-webauthn">
    <span style="display: inline-block; vertical-align: middle;">
      <img alt="NextJS App Router and Passkeys Logo" src="public/app-router-and-webauthn-icon.png" width="120" />
    </span>
  </a>
</p>

<h1 align="center">
  App Router With WebAuthN
</h1>

A web application that demonstrates a NextJS App Router project implementing user authentication with Passkeys using [SimpleWebAuthn](https://simplewebauthn.dev/docs/).

## 📚 Important Libraries


- [SimpleWebAuthn](https://simplewebauthn.dev/docs/) allows for TypeScript WebAuthN integration.

- [Prisma](https://www.prisma.io/) allows for TypeScript type-safe data modelling and database querying connection.

- [renchris' fork of the Iron Session V8 branch](https://github.com/renchris/iron-session/tree/v8-as-dependency)  allows Iron Session to be used with React Server Components and NextJS Server Actions.

## 🤝 WebAuthN to Production

This project follows closely to [Ian Mitchell](https://github.com/IanMitchell)'s NextJS WebAuthN demo with the implementation being with NextJS App Router and Server Action Iron Session.

To take this this demo to a secure production application, you will additionally need to create a multi-step registration flow.

Per his note from his [demo and blog]((https://ianmitchell.dev/blog/nextjs-and-webauthn)):

*If you're following this guide to add WebAuthn to an application you intend to ship, it's important to create a multi-step registration flow instead of asking for a username and email upfront. When you call create, the browser will create the login - your application can't remove it later. If your server validation fails (let's say because the username was registered by someone else) the browser will still have created an account.*

*Instead of having a registration all on one page, create a new model called Account, move username and email to that, and create a one-to-one relationship with the User model. Then, after a user clicks register and creates a User, prompt them for an email and username on a second page to create a new Account model. Any validation failures on this step won't impact the newly created User model and its Credential!*

## 🚀 Usage

1. **Install project dependencies.**

    Run

    ```bash
    pnpm install
    ```

1. **Set up the Prisma database :**

    Create an `.env` file that contains the values to your database URL and secret cookie password.

    For an external database, you may set up your Prisma database with [PostgreSQL on RDS](https://www.prisma.io/dataguide/postgresql/setting-up-postgresql-on-rds).

    ```
    DATABASE_URL=postgresql://rds-instance-username:rds-instance-password@database-name.instance-id.aws-region.rds.amazonaws.com:5432/postgres
    SECRET_COOKIE_PASSWORD=passwordpasswordpasswordpassword
    ```

    For a local file database, you may set up your Prisma databse with [SQLite](https://www.prisma.io/docs/getting-started/quickstart)

    ```
    DATABASE_URL="file:./dev.db"
    SECRET_COOKIE_PASSWORD=passwordpasswordpasswordpassword
    ```

    If you choose to run a local database file instead, in the `schema.prisma` file, replace the provider from `"postgresql"` to `"sqlite"`

    ```diff
    datasource db {
    -   provider = "postgresql"
    +   provider = "sqlite"
        url      = env("DATABASE_URL")
    }
    ```


1. **Create the Prisma database file.**

    Remove the current migration directory and start a new migration history with prisma migrate dev
    
    Run
    ```bash
    rm -rf prisma/migrations 
    pnpm prisma migrate dev
    ```
    

1. **Run the web application.**

    Run
    ```bash
    pnpm dev
    ```

1. **Register a User.**

    Click `Register` to go to the Register page. Enter in a username and email for your passkey credential. Click Register.

    A prompt from the browser  will come up that says `Create a passkey for localhost` with your email as the passkey identifier. Click Continue.

    A prompt from the device system will come up that says `"Your Browser" is trying to verify your identity on localhost. Touch ID or enter your password to allow this.` Enter in your Touch ID.

    Your passkey will now have been registered into the database.

1. **Login the User.**

    Click `Login` to go to the Login page. Enter the email you used during the Register step. Click Login.

    A prompt from the device system will come up that says `"Your Browser" is trying to verify your identity on localhost. Touch ID or enter your password to allow this.` Enter in your Touch ID.

    You will now be re-directed to the Admin Page. The authenticated content will show your User ID number.

1. **Logout the User.**

    From the Admin Page, click the `Logout` button. The cookies of your user session will be cleared and you will be re-directed to the Home Page.

## 🧐 What's inside?

A quick look at the top-level files and directories where we made our feature changes in the project.

    lib
    ├── auth.ts
    ├── cookieActions.ts
    ├── database.ts
    ├── login.ts
    ├── prisma.ts
    ├── register.ts
    └── session.ts
    prisma
    └── schema.prisma
    src
    └── app
         └── components
            ├── LoginPage.tsx
            ├── LogoutButton.tsx
            └── RegisterPage.tsx

1. **`/lib`**: This directory will contain all of the `use server` internal functions that our components and functions will use.

1. **`lib/auth.ts`**: This file contains the functions that create or modify the data or datatype of our variables so that they can be correctly passed into our function parameters and Prisma database.

1. **`lib/cookieActions.ts`**: This file contains the functions that read and write encrypted cookies to and from cookie storage.

1. **`lib/database.ts`**: This file contains the functions that read and write data to and from our Prisma database.

1. **`lib/login.ts`**: This file contains the functions that are involved with the user log in process.

1. **`lib/prisma.ts`**: This file sets up the Prisma Client that is used by Prisma functions in the `/lib/database.ts` file.

1. **`lib/register.ts`**: This file contains the functions that are involved with the user registration process.

1. **`lib/session.ts`**: This file sets up the Iron Session object used by the session functions in the `lib/cookieAction.ts` file.

1. **`prisma.schema.ts`**: This is the configuration file that sets up Prisma with the database source type and data model definition.

1. **`/src/app`**: This directory will contain all of the code related to what you will see on the front-end of the site. `src` is a convention for “source code” and `app` is the convention for “app router”.

1. **`src/app/components/LoginPage.tsx`**: This `use client` file contains the  page component and client-side functions for the Login Page.

1. **`src/app/components/LogoutButton.tsx`**: This `use client` file contains the logout button component that clears the cookies and redirects the user to the Home Page when clicked.

1. **`src/app/components/RegisterPage.tsx`**: This `use client` file contains the  page component and client-side functions for the Register Page.

## 📣 Recognition

Thank you to [Matthew Miller](https://github.com/MasterKale) for the creation and maintenance of the SimpleWebAuthn library and [Ian Mitchell](https://github.com/IanMitchell) for his  [NextJS and WebAuthN blog](https://ianmitchell.dev/blog/nextjs-and-webauthn) that made creating this project possible.
