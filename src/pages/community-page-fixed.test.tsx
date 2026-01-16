import { render, screen } from '@testing-library/react';
import CommunityPage from './community-page-fixed';

test('renders community page', () => {
  render(<CommunityPage />);
  const linkElement = screen.getByText(/Connect & Thrive/i);
  expect(linkElement).toBeInTheDocument();
});
