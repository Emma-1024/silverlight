import { render, screen } from "@testing-library/react";
import * as React from "react";

import { Header } from ".";

import "@testing-library/jest-dom";
import { unstable_createRemixStub } from "@remix-run/testing";

test("renders Header", () => {
  const RemixStub = unstable_createRemixStub([
    {
      path: "/",
      element: <Header theme="" locale="en" />,
    },
  ]);

  render(<RemixStub />);

  expect(screen.getByText("Log In")).toBeInTheDocument();
});
