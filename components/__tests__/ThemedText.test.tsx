import { render, screen } from "@testing-library/react-native";
import { ThemedText } from "../ThemedText";

describe("ThemedText", () => {
  it("renders correctly with default props", () => {
    render(<ThemedText>Hello World</ThemedText>);
    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  it("applies custom styles", () => {
    const { getByText } = render(
      <ThemedText style={{ fontSize: 20 }}>Styled Text</ThemedText>
    );
    const element = getByText("Styled Text");
    expect(element.props.style).toMatchObject(
      expect.arrayContaining([expect.objectContaining({ fontSize: 20 })])
    );
  });
});
