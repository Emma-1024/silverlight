import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";
import { useTranslation } from "react-i18next";
import { globalProject } from "~/constants/project";

export const meta: V2_MetaFunction = () => [{ title: globalProject.PROJECT_NAME}];

export default function Index() {
  const user = useOptionalUser();
  let { t } = useTranslation();
  return (
    <main className="h-full">
      <div className="mx-auto sm:flex sm:justify-center text-center">
        {user ? (
          <span>
            <p
              data-testid="greeting1"
              className="font-mono text-2xl font-bold mt-52 mx-10"
            >
              Hello again {user.email}!{" "}
            </p>
            <p
              data-testid="greeting2"
              className="font-mono text-2xl font-bold mx-10"
            >
              We hope you're having a great day and are ready to explore
              {globalProject.PROJECT_NAME} some more.
            </p>
            <Link
              data-testid="notes"
              to="/notes"
              className="btn btn-primary mt-10"
            >
              {t("view-notes")}
            </Link>
          </span>
        ) : (
          <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-5xl font-bold">Hello there</h1>
                <p className="py-6">
                  Welcome to {globalProject.PROJECT_NAME}! We're glad you're here.
                </p>
                <Link
                  data-testid="start"
                  to="/login"
                  className="btn btn-primary"
                >
                  {t("get-started")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
