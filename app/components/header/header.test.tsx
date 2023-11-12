import * as React from "react";
import { Header } from ".";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { unstable_createRemixStub } from "@remix-run/testing";

test("renders Header", () => {
  let RemixStub = unstable_createRemixStub([
    {
      path: "/",
      element: <Header theme="" locale="en" />,
    },
  ]);

  render(<RemixStub />);

  expect(screen.getByText("Log In")).toBeInTheDocument();
});
