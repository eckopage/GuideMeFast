// src/@types/jest-dom.d.ts
import '@testing-library/jest-dom/extend-expect';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toBeVisible(): R;
            toHaveAttribute(attr: string, value?: string): R;
            toHaveTextContent(text: string | RegExp): R;
            toHaveClass(className: string): R;
            toBeDisabled(): R;
            toBeEnabled(): R;
            toHaveFocus(): R;
            toHaveValue(value: string | number): R;
            toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
            toBeChecked(): R;
            toBePartiallyChecked(): R;
            toHaveDescription(text?: string | RegExp): R;
        }
    }
}

export {};