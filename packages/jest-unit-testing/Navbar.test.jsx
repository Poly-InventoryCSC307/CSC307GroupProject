/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./Navbar";
import { BrowserRouter } from "react-router-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("./SignInModal", () => ({
  __esModule: true,
  default: ({ onClose }) => (
    <div data-testid="signin-modal" onClick={onClose}>
      Mock SignIn Modal
    </div>
  ),
}));

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe("Navbar Component", () => {
  test("renders logo and menu items", () => {
    renderNavbar();

    expect(
      screen.getByAltText(/Poly\+ Inventory Logo/i)
    ).toBeInTheDocument();

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  test("navigates when clicking menu items", () => {
    renderNavbar();

    fireEvent.click(screen.getByText("Home"));
    expect(mockNavigate).toHaveBeenCalledWith("/");

    fireEvent.click(screen.getByText("Features"));
    expect(mockNavigate).toHaveBeenCalledWith("/features");

    fireEvent.click(screen.getByText("About"));
    expect(mockNavigate).toHaveBeenCalledWith("/about");
  });

  test("opens modal when clicking sign-in icon", () => {
    renderNavbar();

    const signInIcon = screen.getByAltText("Sign In");
    fireEvent.click(signInIcon);

    expect(screen.getByTestId("signin-modal")).toBeInTheDocument();
  });

  test("closes modal when clicking inside mocked modal", () => {
    renderNavbar();

    // Open modal
    fireEvent.click(screen.getByAltText("Sign In"));
    expect(screen.getByTestId("signin-modal")).toBeInTheDocument();

    // Trigger onClose via click
    fireEvent.click(screen.getByTestId("signin-modal"));
    expect(screen.queryByTestId("signin-modal")).not.toBeInTheDocument();
  });
});
