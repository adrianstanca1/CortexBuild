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

    it('submits form with valid credentials', async () => {
        const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'company_admin',
            companyId: 'company-1',
        };

        (authService.login as any).mockResolvedValue(mockUser);

        const mockOnLoginSuccess = vi.fn();
        render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockUser);
        });
    });

    it('displays error message on failed login', async () => {
        (authService.login as any).mockRejectedValue(new Error('Invalid credentials'));

        const mockOnLoginSuccess = vi.fn();
        render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });

    it('shows loading state during login', async () => {
        (authService.login as any).mockImplementation(() =>
            new Promise(resolve => setTimeout(resolve, 1000))
        );

        const mockOnLoginSuccess = vi.fn();
        render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Button should be disabled during loading
        expect(submitButton).toBeDisabled();
    });
});
