import { render, screen } from "@testing-library/react";
import SubHeader from "@/components/ui/Sub-header";

describe("SubHeader component", () => {
  test("displays the correct name", () => {
    const headerText = "Test Header";
    render(<SubHeader name={headerText} />);
    const headerElement = screen.getByText(headerText);
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveClass("font-bold text-2xl");
  });

  test("applies the className prop correctly", () => {
    render(<SubHeader name="Test Header" className="custom-class" />);
    const subHeader = screen.getByText("Test Header").closest("div");
    expect(subHeader).toHaveClass("custom-class");
  });

  test("renders children correctly", () => {
    render(
      <SubHeader name="Test Header">
        <button>Click Me</button>
      </SubHeader>
    );
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });
});

