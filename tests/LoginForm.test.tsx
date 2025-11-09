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

describe('LoginForm Component', () => {
    it('renders login form with email and password fields', () => {
        const mockOnLoginSuccess = vi.fn();
        render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('displays default credentials hint', () => {
        const mockOnLoginSuccess = vi.fn();
        render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

        expect(screen.getByText(/adrian.stanca1@gmail.com/i)).toBeInTheDocument();
        expect(screen.getByText(/parola123/i)).toBeInTheDocument();
    });

    test('submits form with credentials', async () => {
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
            expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    test('displays error message on failed login', async () => {
        mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

        render(<LoginForm onLoginSuccess={vi.fn()} />);

        // Use type="submit" to find the main submit button  
        const submitButton = screen.getByRole('button', { name: /^sign in$/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    }); it('shows loading state during login', async () => {
        (authService.login as any).mockImplementation(() =>
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
