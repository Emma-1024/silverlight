import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
  useFetcher,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";
import { useTranslation } from "react-i18next";
import { extendExpiration, authenticator, logout } from "./auth.server";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { useEffect } from "react";
import { themeChange } from "theme-change";
import { default as SolidIcon } from "~/components/icons/solid";
import {
  sessionStorage,
  getCookieSession,
  getSessionId,
} from "./cookieSession.server";
import { globalConsts } from "./constants/consts";
import i18next from "./i18next.server";
import { globalDefaults } from "./constants/defaults";
import { createSession, getSessionById } from "./models/session.server";
import invariant from "tiny-invariant";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderArgs) => {
  invariant(
    typeof process.env.DATABASE_URL === "string",
    "DATABASE_URL env var not set",
  );
  const sessionId = await getSessionId(request);
  //When guest has session, check session with user or userless
  if (sessionId) {
    const userId = await authenticator.isAuthenticated(request);

    if (userId) {
      const sessionUser = await getSessionById(sessionId, {
        user: true,
        sessionData: true,
      });
      if (
        sessionUser &&
        sessionUser.expirationDate !== null &&
        sessionUser.expirationDate > new Date()
      ) {
        return json(
          {
            session: { ...sessionUser, user: undefined },
            user: { ...sessionUser.user },
          },
          {
            headers: await extendExpiration(request),
          },
        );
      }
      // If session expired or session deleted from DB but still stored in browser
      await logout(request);
      // Will never run to this line due to logout redirect
      return json({ session: null });
    } else {
      const sessionUserless = await getSessionById(sessionId, {
        user: true,
        sessionData: true,
      });
      // If session deleted from DB but still stored in browser
      if (!sessionUserless) {
        await logout(request);
        return json({ session: null });
      }

      return json({
        session: { ...sessionUserless },
        user: sessionUserless?.user,
      });
    }
  } else {
    let locale = await i18next.getLocale(request);
    const sessionUserless = await createSession({
      rememberMe: null,
      userId: null,
      theme: globalDefaults.DEFAULT_THEME,
      locale,
    });

    const cookieSession = await getCookieSession(request);
    cookieSession.set(globalConsts.SESSION_ID, sessionUserless.id);
    return json(
      { session: sessionUserless },
      {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(cookieSession),
        },
      },
    );
  }
};

export const handle = {
  i18n: "common",
};

// "Warning In latest versions you may find an error with useChangeLanguage hook, (see #107),
// to solve it, copy the code of useChangeLanguage to your own app and use it instead of the one provided by remix-i18next."
export function useChangeLanguage(locale: string) {
  let { i18n } = useTranslation();
  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale, i18n]);
}

export default function App() {
  const { session } = useLoaderData<typeof loader>();
  const locale = session
    ? (session?.sessionData?.locale as string)
    : globalDefaults.DEFAULT_LANG;
  const theme = session
    ? (session.sessionData?.theme as string)
    : globalDefaults.DEFAULT_THEME;
  useChangeLanguage(locale);

  const fetcher = useFetcher();

  const { i18n } = useTranslation();

  const props = { locale, theme };

  useEffect(() => {
    themeChange(false);
    // False parameter is required for react project
  }, []);

  useEffect(() => {
    // For maintain persistence of theme and locale
    const themeStorage = localStorage.getItem("theme");
    const localeI18n = i18n.language;
    if (fetcher.state === "idle") {
      if (
        (themeStorage !== null && themeStorage !== theme) ||
        (localeI18n && localeI18n !== locale)
      ) {
        fetcher.submit(
          {
            theme: themeStorage,
            locale: localeI18n,
          },
          { method: "post", action: "/session-data" },
        );
      }
    }
  }, [fetcher, i18n.language, locale, theme]);

  return (
    <html lang={locale} dir={i18n.dir()} data-theme={theme} className="h-full">
      <div className="flex flex-col min-h-screen">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body className="flex-grow">
          <Header {...props} />
          <div className="min-h-screen">
            <Outlet />
          </div>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
        <Footer />
      </div>
    </html>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <html className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body className="h-full flex justify-center items-center flex-col gap-3 px-10">
          <p className="text-7xl font-bold">Oops!</p>
          <div className="flex text-center gap-3">
            <SolidIcon className="w-6 h-6 fill-gray-700" icon="face" />
            <p>We can't seem to find the page you're looking for.</p>
          </div>
          <p>
            {error.status} {error.statusText}
          </p>
          <p>{error.data}</p>
        </body>
      </html>
    );
  } else if (error instanceof Error) {
    return (
      <html className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          <div className="h-full flex justify-center items-center flex-col gap-3 px-10">
            <p className="text-7xl font-bold">Oops!</p>
            <h1>Error</h1>
            <p className="flex-wrap">{error.message}</p>
            <p>The stack trace is:</p>
            <p>{error.stack}</p>
          </div>
        </body>
      </html>
    );
  } else {
    return (
      <html className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body className="h-full flex justify-center items-center flex-col gap-3 px-10">
          <p className="text-7xl font-bold">Oops!</p>
          <h1>Unknown Error</h1>;
        </body>
      </html>
    );
  }
};
