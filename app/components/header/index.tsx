import { Form, Link, useFetcher } from "@remix-run/react";
import { type ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { default as SolidIcon } from "~/components/icons/solid";
import { globalDefaults } from "~/constants/defaults";
import { useOptionalUser } from "~/utils";

import avatar from "../../../public/images/doctor-strange.png";

interface Props {
  theme: string;
  locale: string;
}

export const Header = (props: Props) => {
  const [searchText, setSearchText] = useState("");

  const user = useOptionalUser();
  const { t, i18n } = useTranslation();
  const sessionDataFetcher = useFetcher();

  const handleClick = (event: MouseEvent) => {
    if (document.activeElement instanceof HTMLElement) {
      // Close the popup dropdown menu when menuItem is clicked
      document.activeElement.blur();
    }
    const target = event.currentTarget as HTMLButtonElement;
    const themeValue = target.getAttribute("data-set-theme") ?? "";
    sessionDataFetcher.submit(
      { theme: themeValue, locale: props.locale },
      { method: "post", action: "/session-data" },
    );
  };

  const handleChangeLanguage = (locale: string) => {
    if (document.activeElement instanceof HTMLElement) {
      // Close the popup dropdown menu when menuItem is clicked
      document.activeElement.blur();
    }
    switch (locale) {
      case globalDefaults.DEFAULT_LANG:
        void i18n.changeLanguage(globalDefaults.DEFAULT_LANG);
        sessionDataFetcher.submit(
          { theme: props.theme, locale: globalDefaults.DEFAULT_LANG },
          { method: "post", action: "/session-data" },
        );
        break;
      case globalDefaults.LANG_ZH:
        void i18n.changeLanguage(globalDefaults.LANG_ZH);
        sessionDataFetcher.submit(
          { theme: props.theme, locale: globalDefaults.LANG_ZH },
          { method: "post", action: "/session-data" },
        );
        break;
      default:
        break;
    }
  };

  const searchInputHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
  };

  const deleteSearchInputHandler = () => {
    setSearchText("");
  };

  return (
    <header className="flex justify-between navbar bg-base-100 shadow-2xl top-0 left-0 right-0">
      <div className="w-2/6">
        <Link to="/">
          <SolidIcon className="w-6 h-6 fill-primary" icon="meteor" />
        </Link>
      </div>
      <div data-testid="search" className="w-4/6 relative">
        <SolidIcon
          className="w-6 h-6 fill-primary absolute left-2"
          icon="search"
        />
        <input
          type="text"
          value={searchText}
          onChange={searchInputHandler}
          placeholder={t("search")}
          className="input w-full input-primary border-none pl-10"
        />
        {searchText !== "" ? (
          <SolidIcon
            className="cursor-default w-6 h-6 fill-primary absolute right-2"
            icon="close"
            onClick={deleteSearchInputHandler}
          />
        ) : null}
      </div>
      <div className="flex justify-end  gap-2 w-2/6">
        <div data-testid="change-language" className="dropdown dropdown-end">
          <label tabIndex={1} className="btn btn-ghost btn-circle">
            <SolidIcon className="w-6 h-6 fill-primary" icon="global" />
          </label>
          <ul
            tabIndex={1}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <button
                onClick={() => {
                  handleChangeLanguage(globalDefaults.DEFAULT_LANG);
                }}
              >
                {i18n.language === globalDefaults.DEFAULT_LANG ? (
                  <SolidIcon className="w-4 h-4 fill-primary" icon="check" />
                ) : (
                  <div className="w-4 h-4"></div>
                )}
                en
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  handleChangeLanguage(globalDefaults.LANG_ZH);
                }}
              >
                {i18n.language === globalDefaults.LANG_ZH ? (
                  <SolidIcon className="w-4 h-4 fill-primary" icon="check" />
                ) : (
                  <div className="w-4 h-4"></div>
                )}
                zh
              </button>
            </li>
          </ul>
        </div>

        <div data-testid="change-theme" className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <SolidIcon className="w-6 h-6 fill-primary" icon="theme" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <button
                data-set-theme=""
                data-act-class="ACTIVECLASS"
                className={props.theme === "" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                System
              </button>
            </li>
            <li>
              <button
                data-set-theme="light"
                data-act-class="ACTIVECLASS"
                className={props.theme === "light" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                Light
              </button>
            </li>
            <li>
              <button
                data-set-theme="dark"
                data-act-class="ACTIVECLASS"
                className={props.theme === "dark" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                Dark
              </button>
            </li>
            <li>
              <button
                data-set-theme="acid"
                data-act-class="ACTIVECLASS"
                className={props.theme === "acid" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                Acid
              </button>
            </li>
            <li>
              <button
                data-set-theme="halloween"
                data-act-class="ACTIVECLASS"
                className={props.theme === "halloween" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                Halloween
              </button>
            </li>
            <li>
              <button
                data-set-theme="forest"
                data-act-class="ACTIVECLASS"
                className={props.theme === "forest" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                Forest
              </button>
            </li>
            <li>
              <button
                data-set-theme="pastel"
                data-act-class="ACTIVECLASS"
                className={props.theme === "pastel" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                Pastel
              </button>
            </li>
            <li>
              <button
                data-set-theme="dracula"
                data-act-class="ACTIVECLASS"
                className={props.theme === "dracula" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                Dracula
              </button>
            </li>
            <li>
              <button
                data-set-theme="valentine"
                data-act-class="ACTIVECLASS"
                className={props.theme === "valentine" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                Valentine
              </button>
            </li>
            <li>
              <button
                data-set-theme="aqua"
                data-act-class="ACTIVECLASS"
                className={props.theme === "aqua" ? "btn-primary" : ""}
                onClick={handleClick}
              >
                Aqua
              </button>
            </li>
          </ul>
        </div>
        {user ? (
          <div data-testid="user-actions" className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <img alt="avatar" src={avatar} className="mask mask-circle" />
            </label>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <div>
                  <SolidIcon
                    className="w-4 h-4 fill-primary inline-block"
                    icon="user"
                  />
                  <a href="/profile" className="justify-between">
                    Profile
                  </a>
                </div>
              </li>
              <li>
                <div>
                  <SolidIcon
                    className="w-4 h-4 fill-primary inline-block"
                    icon="setting"
                  />
                  <a href="/setting">Settings</a>
                </div>
              </li>
              <Form action="/logout" method="post">
                <li>
                  <button type="submit" className="flex items-center gap-2">
                    <SolidIcon className="w-4 h-4 fill-primary" icon="logout" />
                    <span>Logout</span>
                  </button>
                </li>
              </Form>
            </ul>
          </div>
        ) : (
          <div>
            <Link to="/login">
              <SolidIcon
                className="w-6 h-6 fill-primary inline-block mr-2"
                icon="login"
              />
              <span className="hidden sm:inline-block">Log In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
