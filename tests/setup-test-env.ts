import { installGlobals } from "@remix-run/node";
import "@testing-library/jest-dom/extend-expect";

// This installs globals such as "fetch", "Response", "Request" and "Headers".
installGlobals();
