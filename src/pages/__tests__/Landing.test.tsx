import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock('../../assets/app-store-badge-white.svg', () => ({ default: 'app-store-badge-white.svg' }));
vi.mock('../../assets/susilogo.png', () => ({ default: 'susilogo.png' }));

import { Landing } from '../Landing';
import { useAuth } from '../../contexts/AuthContext';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ currentUser: null, userProfile: null });
});

describe('Landing', () => {
  it('renders the App Store badge with correct link and target', () => {
    render(<Landing />);
    const badge = screen.getByAltText('Download on the App Store');
    expect(badge).toBeInTheDocument();
    const link = badge.closest('a');
    expect(link).toHaveAttribute('href', 'https://apps.apple.com/us/app/signupsignin/id6762022121');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the Apple trademark notice', () => {
    render(<Landing />);
    expect(
      screen.getByText(/App Store® is a registered trademark of Apple Inc\./)
    ).toBeInTheDocument();
  });
});
