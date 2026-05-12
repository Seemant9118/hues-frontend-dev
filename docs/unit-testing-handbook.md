# HUES Unit Testing Handbook (AI & Human Edition)

This guide defines the standards for unit testing in the HUES project. Follow these patterns to ensure consistency and speed.

## 1. Core Tools
- **Runner**: Vitest
- **DOM**: React Testing Library (RTL)
- **Mocks**: MSW (Network), Vitest Mocks (Hooks/Modules)

## 2. Test File Location
- **Mirrored structure**: Place all unit tests in the `__tests__/unit_tests/` directory, mirroring the `src` folder structure.
- **Example**: `src/components/ui/Button.jsx` -> `__tests__/unit_tests/components/ui/Button.test.jsx`.

## 3. Writing Component Tests
Always use the custom `render` from `@/tests/test-utils` instead of `@testing-library/react`.

```javascript
import { render, screen, fireEvent } from '@/tests/test-utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

## 4. Testing Custom Hooks
Use `renderHook` from `@/tests/test-utils`.

```javascript
import { renderHook } from '@/tests/test-utils';
import { useMyHook } from './useMyHook';

it('should increment count', () => {
  const { result } = renderHook(() => useMyHook());
  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1);
});
```

## 5. API Mocking (MSW)
Avoid manual `vi.mock` for API services. Use MSW handlers in `src/tests/mocks/handlers.js`.

- Use `http.post()`, `http.get()`, etc.
- If you need a specialized response for ONE test, use `server.use()` to override the global handler.

## 6. Stable Selectors
Prioritize finding elements in this order:
1. `getByRole` (ARIA standards)
2. `getByLabelText` (Form accessibility)
3. `getByText` (Static content)
4. `getByTestId` (Only as a last resort)

## 7. AI Refactoring Flow
If you update a component:
1. Ask the AI: *"I updated X component, sync the tests."*
2. The AI will read the source and the `.test.jsx` file to align them.
3. The AI will look at this handbook to ensure it uses the right wrappers and factories.
