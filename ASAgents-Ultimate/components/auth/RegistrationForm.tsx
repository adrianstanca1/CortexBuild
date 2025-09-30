import React, { useState } from 'react';
import './RegistrationForm.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Shield, Building2, User, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { registrationService, RegistrationData } from '../../services/registrationService';

interface RegistrationFormProps {
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onSwitchToLogin?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  onError,
  onSwitchToLogin
}) => {
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    role: 'user',
    tenantName: '',
    planType: 'free',
    acceptTerms: false,
    acceptPrivacy: false,
    marketingConsent: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Check password strength
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthTextColor = (strength: number): string => {
    if (strength >= 75) return 'text-green-600';
    if (strength >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const validateStep1 = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Valid email address is required');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (passwordStrength < 50) {
      setError('Please choose a stronger password');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.acceptTerms) {
      setError('You must accept the terms of service');
      return false;
    }
    if (!formData.acceptPrivacy) {
      setError('You must accept the privacy policy');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const result = await registrationService.registerUser(formData);

      if (result.success) {
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        setError(result.error || 'Registration failed');
        if (onError) {
          onError(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="John"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="john@company.com"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create a strong password"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {formData.password && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Password strength:</span>
              <span className={getPasswordStrengthTextColor(passwordStrength)}>
                {getPasswordStrengthText(passwordStrength)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`password-strength-bar h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                data-progress={passwordStrength}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Your Company Ltd"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Team Member</SelectItem>
            <SelectItem value="manager">Project Manager</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenantName">Organization Name</Label>
        <Input
          id="tenantName"
          type="text"
          value={formData.tenantName}
          onChange={(e) => handleInputChange('tenantName', e.target.value)}
          placeholder="Your Organization"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="planType">Plan Type</Label>
        <Select value={formData.planType} onValueChange={(value) => handleInputChange('planType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free Plan</SelectItem>
            <SelectItem value="growth">Growth Plan</SelectItem>
            <SelectItem value="enterprise">Enterprise Plan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
          />
          <Label htmlFor="acceptTerms" className="text-sm">
            I accept the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> *
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptPrivacy"
            checked={formData.acceptPrivacy}
            onCheckedChange={(checked) => handleInputChange('acceptPrivacy', checked)}
          />
          <Label htmlFor="acceptPrivacy" className="text-sm">
            I accept the <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> *
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="marketingConsent"
            checked={formData.marketingConsent}
            onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
          />
          <Label htmlFor="marketingConsent" className="text-sm">
            I would like to receive marketing communications
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <Shield className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AS Agents</h1>
        </div>
        <h2 className="text-muted-foreground">
          Create your account
        </h2>
      </div>

      <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Registration - Step {step} of 2
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? 'Personal Information' : 'Organization & Preferences'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
            {error && (
              <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {step === 1 ? renderStep1() : renderStep2()}

            <div className="mt-6 space-y-3">
              {step === 1 ? (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                >
                  Continue
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Create Account
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="w-full"
                  >
                    Back
                  </Button>
                </div>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
