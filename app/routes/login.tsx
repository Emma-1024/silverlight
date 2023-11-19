import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AuthorizationError } from "remix-auth";
import invariant from "tiny-invariant";

import { SESSION_MAXAGE, authenticator } from "~/auth.server";
import { globalConsts } from "~/constants/consts";
import { globalDefaults } from "~/constants/defaults";
import { sessionStorage, getCookieSession } from "~/cookieSession.server";
import { createSession } from "~/models/session.server";
import type { User } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await authenticator.isAuthenticated(request);
  if (!userId) {
    return json({});
  } else return json({ replace: true });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const action = async ({ context, request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const rememberMe = formData.get("rememberMe");
  const locale = formData.get("locale");
  const theme = formData.get("theme");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  let userId: User["id"] = "";
  try {
    userId = await authenticator.authenticate("form-auth", request, {
      context: { formData },
      throwOnError: true,
    });
  } catch (error) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    // Usually this won't work if you haven't defined `failureRedirect`
    if (error instanceof Response) return error;
    if (error instanceof AuthorizationError) {
      // here the error is related to the authentication process
      return json(
        { errors: { email: "Invalid email or password", password: null } },
        { status: 400 },
      );
    }
    // here the error is a generic error that another reason may throw
    console.error("Server errors when user logging:", email);
    console.error(error);
    return json(
      {
        errors: {
          email:
            "Sorry for the server errors, please try again later or contact us",
          password: null,
        },
      },
      { status: 500 },
    );
  }

  // Authentication will throw if failed. If code is running here, it must have passed authentication.
  invariant(typeof locale === "string", "locale must be a string");
  invariant(typeof theme === "string", "theme must be a string");
  const sessionUser = await createSession({
    rememberMe: rememberMe ? true : false,
    userId,
    locale,
    theme,
  });

  const cookieSession = await getCookieSession(request);
  // `sessionKey` is used for authentication, SESSION_ID is used for session.
  // Even a user doesn't login, the user still has a session.
  cookieSession.set(authenticator.sessionKey, userId);
  cookieSession.set(globalConsts.SESSION_ID, sessionUser.id);

  // commit the session
  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(cookieSession, {
      maxAge: rememberMe ? SESSION_MAXAGE : undefined,
    }),
  });

  return redirect(redirectTo, { headers });
};

export const meta: V2_MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const loaderData = useLoaderData<{ replace?: boolean }>();
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  let themeValue: string = globalDefaults.DEFAULT_THEME;
  let langValue: string = globalDefaults.DEFAULT_LANG;
  const { i18n } = useTranslation();
  if (typeof window !== "undefined") {
    themeValue = localStorage.getItem("theme") ?? globalDefaults.DEFAULT_LANG;
    langValue = i18n.language ?? globalDefaults.DEFAULT_LANG;
  }

  const navigate = useNavigate();

  useEffect(() => {
    if (loaderData.replace) {
      navigate("/", { replace: true });
    }
  }, [loaderData.replace, navigate]);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div
        className="hero min-h-screen bg-base-200"
        style={{
          backgroundImage:
            "url(https://daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.jpg)",
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content flex-col lg:flex-row-reverse w-full lg: justify-end">
          <div className="text-center lg:text-left lg:ml-28">
            <h1 className="text-5xl font-bold ">Login now!</h1>
            <p className="py-6">Login to experience more.</p>
          </div>
          <div className="card flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100">
            <div className="card-body">
              <Form replace method="post" className="space-y-6">
                <div className="form-control">
                  <label htmlFor="email" className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    ref={emailRef}
                    id="email"
                    required
                    placeholder="email"
                    autoFocus={true}
                    name="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={actionData?.errors?.email ? true : undefined}
                    aria-describedby="email-error"
                    className="input input-bordered"
                  />
                  {actionData?.errors?.email ? (
                    <div className="pt-1 text-red-700" id="email-error">
                      {actionData.errors.email}
                    </div>
                  ) : null}
                </div>

                <div className="form-control">
                  <label htmlFor="password" className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    id="password"
                    ref={passwordRef}
                    placeholder="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={
                      actionData?.errors?.password ? true : undefined
                    }
                    aria-describedby="password-error"
                    className="input input-bordered"
                  />
                  {actionData?.errors?.password ? (
                    <div className="pt-1 text-red-700" id="password-error">
                      {actionData.errors.password}
                    </div>
                  ) : null}
                </div>

                <input type="hidden" name="redirectTo" value={redirectTo} />

                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary">
                    Log in
                  </button>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 rounded"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm">
                      Remember me
                    </label>
                  </div>

                  <label className="ml-2 block text-sm">
                    <a href="/forgot-password" className="link link-hover">
                      Forgot password?
                    </a>
                  </label>
                </div>

                <div className="text-sm text-gray-500">
                  {`Don't have an account? `}
                  <Link
                    className="text-blue-500 underline font-semibold"
                    to={{
                      pathname: "/sign-up",
                      search: searchParams.toString(),
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
                <input type="hidden" name="locale" value={langValue}></input>
                <input type="hidden" name="theme" value={themeValue}></input>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
