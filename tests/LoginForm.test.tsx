/**
 * Authentication Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../components/auth/LoginForm';
import * as authService from '../auth/authService';

// Mock authService
vi.mock('../auth/authService', () => ({
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
}));

// Mock supabaseClient
vi.mock('../supabaseClient', () => ({
    supabase: null,
}));

const mockNavigate = vi.fn();

describe('LoginForm Component', () => {
    it('renders login form with email and password fields', () => {
        render(<LoginForm onNavigate={mockNavigate} />);

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        // Use type="submit" to get only the main sign in button, not Google/GitHub SSO buttons
        const submitButton = screen.getByRole('button', { name: /^sign in$/i });
        expect(submitButton).toBeInTheDocument();
    });

    it('displays default credentials hint', () => {
        render(<LoginForm onNavigate={mockNavigate} />);

        expect(screen.getByText(/adrian.stanca1@gmail.com/i)).toBeInTheDocument();
        // Use getAllByText since password appears in multiple places
        const passwordTexts = screen.getAllByText(/parola123/i);
        expect(passwordTexts.length).toBeGreaterThan(0);
    });

    it('submits form with credentials', async () => {
        const mockOnLoginSuccess = vi.fn();

        render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        // Use type="submit" to find the main submit button
        const submitButton = screen.getByRole('button', { name: /^sign in$/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('displays error message on failed login', async () => {
        (authService.login as vi.Mock).mockRejectedValue(new Error('Invalid credentials'));

        render(<LoginForm onLoginSuccess={vi.fn()} />);

        // Use type="submit" to find the main submit button  
        const submitButton = screen.getByRole('button', { name: /^sign in$/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // The actual error message displayed is "Invalid email or password. Please try again."
            expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
        });
    });

    it('shows loading state during login', async () => {
        (authService.login as vi.Mock).mockImplementation(() =>
            new Promise(resolve => setTimeout(resolve, 1000))
        );

        const mockOnLoginSuccess = vi.fn();
        render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

        // Use type="submit" to find the main submit button
        const submitButton = screen.getByRole('button', { name: /^sign in$/i });
        fireEvent.click(submitButton);

        // Button should be disabled during loading
        expect(submitButton).toBeDisabled();
    });
});
