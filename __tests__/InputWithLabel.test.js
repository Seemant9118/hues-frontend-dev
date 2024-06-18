import { render, screen } from "@testing-library/react";
import InputWithLabel from "@/components/ui/InputWithLabel";
import userEvent from "@testing-library/user-event";

describe("Input Component", () => {
  test("renders without crashing", () => {
    render(<InputWithLabel name="Test Label" id="test-id" />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  test("appends a required asterisk if the required prop is true", () => {
    render(<InputWithLabel name="Test Label" id="test-id" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  test("does not append a required asterisk if the required prop is false", () => {
    render(<InputWithLabel name="Test Label" id="test-id" />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  test("forwards props correctly to the Input component", () => {
    const props = {
      name: "Test Label",
      id: "test-id",
      value: "test value",
      type: "text",
      required: true,
      disabled: false,
      onChange: jest.fn(),
    };

    render(<InputWithLabel {...props} />);
    const input = screen.getByLabelText(/Test Label/i);

    expect(input).toHaveAttribute("id", props.id);
    expect(input).toHaveAttribute("value", props.value);
    expect(input).toHaveAttribute("type", props.type);
    expect(input).toBeRequired();
    expect(input).not.toBeDisabled();
  });

  test("calls onChange handler when input value changes", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <InputWithLabel name="Test Label" id="test-id" onChange={handleChange} />
    );
    const input = screen.getByLabelText("Test Label");

    await user.type(input, "new value");
    expect(handleChange).toHaveBeenCalledTimes(9);
  });
});

