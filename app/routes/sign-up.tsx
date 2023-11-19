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

import { authenticator } from "~/auth.server";
import { globalDefaults } from "~/constants/defaults";
import { getCookieSession, sessionStorage } from "~/cookieSession.server";
import { createSession } from "~/models/session.server";
import type { User } from "~/models/user.server";
import { createUser, getUserByEmail } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await authenticator.isAuthenticated(request);
  if (!userId) {
    return json({});
  } else return json({ replace: true });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirm-pwd");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const locale = formData.get("locale");
  const theme = formData.get("theme");

  if (!validateEmail(email)) {
    return json(
      {
        errors: {
          email: "Email is invalid",
          password: null,
          confirmPassword: null,
        },
      },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      {
        errors: {
          email: null,
          password: "Password is required",
          confirmPassword: null,
        },
      },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      {
        errors: {
          email: null,
          password: "Password must be at least 8 characters long",
          confirmPassword: null,
        },
      },
      { status: 400 },
    );
  }

  if (confirmPassword !== password) {
    return json(
      {
        errors: {
          email: null,
          password: null,
          confirmPassword: "The passwords entered twice are inconsistent",
        },
      },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
          confirmPassword: null,
        },
      },
      { status: 400 },
    );
  }

  await createUser(email, password);

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
      console.error("Failed to log in after sign-up:", email, error);
      return json(
        { errors: { email: "Failed to log in after sign-up", password: null } },
        { status: 400 },
      );
    }
    // here the error is a generic error that another reason may throw
    console.error(
      "Server errors when user logging after sign-up:",
      email,
      error,
    );
    return json(
      {
        errors: {
          email:
            "Sorry for the server errors, please log in again later or contact us",
          password: null,
        },
      },
      { status: 500 },
    );
  }

  invariant(typeof locale === "string", "locale must be a string");
  invariant(typeof theme === "string", "theme must be a string");
  const sessionUser = await createSession({
    rememberMe: null,
    userId,
    locale,
    theme,
  });

  const cookieSession = await getCookieSession(request);
  cookieSession.set(authenticator.sessionKey, userId);
  cookieSession.set("sessionId", sessionUser.id);

  // commit the session
  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(cookieSession),
  });

  return redirect(redirectTo, { headers });
};

export const meta: V2_MetaFunction = () => [{ title: "Sign Up" }];

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<{ replace?: boolean }>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  let themeValue: string = globalDefaults.DEFAULT_THEME;
  let langValue: string = globalDefaults.DEFAULT_LANG;
  const { i18n } = useTranslation();

  if (typeof window !== "undefined") {
    themeValue = localStorage.getItem("theme") ?? globalDefaults.DEFAULT_THEME;
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
    } else if (actionData?.errors?.confirmPassword) {
      confirmPasswordRef.current?.focus();
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
        <div className="hero-content text-center flex-col w-full">
          <h1 className="text-5xl font-bold">Sign Up</h1>
          <p className="py-2">Register to experience more.</p>
          <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div className="card-body">
              <Form replace method="post" className="space-y-6">
                <div className="form-control">
                  <label htmlFor="email" className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    ref={emailRef}
                    id="email"
                    placeholder="email"
                    required
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
                    autoComplete="new-password"
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

                <div className="form-control">
                  <label htmlFor="confirm-pwd" className="label">
                    <span className="label-text">Confirm password</span>
                  </label>
                  <input
                    id="confirm-pwd"
                    ref={confirmPasswordRef}
                    placeholder="confirm password"
                    name="confirm-pwd"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={
                      actionData?.errors?.confirmPassword ? true : undefined
                    }
                    aria-describedby="confirm-pwd-error"
                    className="input input-bordered"
                  />
                  {actionData?.errors?.confirmPassword ? (
                    <div className="pt-1 text-red-700" id="confirm-pwd-error">
                      {actionData.errors.confirmPassword}
                    </div>
                  ) : null}
                </div>

                <input type="hidden" name="redirectTo" value={redirectTo} />

                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary">
                    Create Account
                  </button>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                      className="text-blue-500 underline"
                      to={{
                        pathname: "/login",
                        search: searchParams.toString(),
                      }}
                    >
                      Log in
                    </Link>
                  </div>
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
