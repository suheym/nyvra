import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('@clerk/react', () => ({
  Show: ({ when, children }) => (
    when === 'signed-out' ? <>{children}</> : null
  ),
  SignInButton: ({ children }) => <>{children}</>,
  SignUpButton: ({ children }) => <>{children}</>,
  UserButton: () => null,
  useUser: () => ({
    user: null,
    isLoaded: true,
  }),
}));

test('renders Nyvra authentication entry screen', () => {
  render(<App />);

  expect(
    screen.getByText(/A calmer space for your wellbeing/i)
  ).toBeInTheDocument();

  expect(
    screen.getByRole('button', { name: /Create account/i })
  ).toBeInTheDocument();

  expect(
    screen.getByRole('button', { name: /Sign in/i })
  ).toBeInTheDocument();
});