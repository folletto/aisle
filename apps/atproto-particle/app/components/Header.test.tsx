import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Header from "./Header";

describe("Header", () => {
  it("renders the app title", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText("Particle")).toBeInTheDocument();
  });

  it("renders the time window when provided", () => {
    const window = {
      start: new Date("2025-03-15T09:00:00"),
      end: new Date("2025-03-15T12:00:00"),
    };
    render(
      <MemoryRouter>
        <Header window={window} />
      </MemoryRouter>
    );
    // Should display formatted time range
    expect(screen.getByText(/9:00am/)).toBeInTheDocument();
    expect(screen.getByText(/12:00pm/)).toBeInTheDocument();
  });

  it("renders settings link", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
  });

  it("renders next interval when intervals provided", () => {
    const intervals = [
      { hour: 9, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 20, minute: 0 },
    ];
    // Mock time to 10am so next is 12:00 PM
    render(
      <MemoryRouter>
        <Header intervals={intervals} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Next:/)).toBeInTheDocument();
  });
});
