import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { unstable_createRemixStub } from "@remix-run/testing";

test("renders a route", () => {
  const RemixStub = unstable_createRemixStub([
    {
      path: "/",
      element: <div>HOME</div>,
    },
  ]);

  render(<RemixStub />);

  expect(screen.getByText("HOME")).toBeInTheDocument();
});

test("renders a nested route", () => {
  const RemixStub = unstable_createRemixStub([
    {
      element: (
        <div>
          <h1>ROOT</h1>
          <Outlet />
        </div>
      ),
      children: [
        {
          path: "/",
          element: <div>INDEX</div>,
        },
      ],
    },
  ]);

  render(<RemixStub />);

  expect(screen.getByText("ROOT")).toBeInTheDocument();
  expect(screen.getByText("INDEX")).toBeInTheDocument();
});

test("loaders work", async () => {
  function App() {
    const data = useLoaderData();
    return <pre data-testid="data">Message: {data.message}</pre>;
  }

  const RemixStub = unstable_createRemixStub([
    {
      path: "/",
      index: true,
      element: <App />,
      loader() {
        return json({ message: "hello" });
      },
    },
  ]);

  render(<RemixStub />);

  expect(await screen.findByTestId("data")).toHaveTextContent(
    /message: hello/i,
  );
});

test("can pass a predefined loader", () => {
  async function loader(_args: DataFunctionArgs) {
    return json({ hi: "there" });
  }

  unstable_createRemixStub([
    {
      path: "/example",
      loader,
    },
  ]);
});

test("can pass context values", async () => {
  function App() {
    const data = useLoaderData();
    return (
      <div>
        <pre data-testid="root">Context: {data.context}</pre>;
        <Outlet />
      </div>
    );
  }

  function Hello() {
    const data = useLoaderData();
    return <pre data-testid="hello">Context: {data.context}</pre>;
  }

  const RemixStub = unstable_createRemixStub(
    [
      {
        path: "/",
        element: <App />,
        loader({ context }) {
          return json(context);
        },
        children: [
          {
            path: "hello",
            element: <Hello />,
            loader({ context }) {
              return json(context);
            },
          },
        ],
      },
    ],
    { context: "hello" },
  );

  render(<RemixStub initialEntries={["/hello"]} />);

  expect(await screen.findByTestId("root")).toHaveTextContent(
    /context: hello/i,
  );
  expect(await screen.findByTestId("hello")).toHaveTextContent(
    /context: hello/i,
  );
});

test("all routes have ids", () => {
  function Home() {
    const matches = useMatches();

    return (
      <div>
        <h1>HOME</h1>
        <pre data-testid="matches">{JSON.stringify(matches, null, 2)}</pre>
      </div>
    );
  }

  const RemixStub = unstable_createRemixStub([
    {
      element: (
        <div>
          <h1>ROOT</h1>
          <Outlet />
        </div>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
      ],
    },
  ]);

  render(<RemixStub />);

  const matchesTextContent = screen.getByTestId("matches").textContent;
  // eslint-disable-next-line jest-dom/prefer-in-document
  expect(matchesTextContent).toBeDefined();
  const matches = JSON.parse(matchesTextContent!);
  const matchesWithoutIds = matches.filter((match: any) => match.id == null);

  expect(matchesWithoutIds).toHaveLength(0);
});
