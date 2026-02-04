import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { userService } from '../services/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 24,
  padding: 40,
  width: '100%',
  maxWidth: 500,
  margin: '0 auto',
}));

const steps = ['Account Details', 'User Role', 'Personal Information', 'Complete Registration'];

// Add user role options
const userRoles = [
  { value: 'owner', label: 'Vehicle Owner', description: 'Track and manage your personal vehicles' },
  { value: 'mechanic', label: 'Mechanic', description: 'Manage appointments and service vehicles' },
  { value: 'admin', label: 'Admin', description: 'Full system access and management' },
];

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState({
    // Step 0
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 1
    role: 'vehicle_owner', // Set default value
    adminKey: '',
    
    // Step 2
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    
    // Preferences
    notifications: true,
    newsletter: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      // Validate email
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      // Validate password
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      // Validate confirm password
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 1) {
      // Validate role
      if (!formData.role) {
        newErrors.role = 'Please select a user role';
      }
      
      // Validate admin key if admin is selected
      if (formData.role === 'admin') {
        if (!formData.adminKey) {
          newErrors.adminKey = 'Admin key is required';
        } else if (!/^\d{12}$/.test(formData.adminKey)) {
          newErrors.adminKey = 'Admin key must be 12 digits';
        } else if (formData.adminKey !== '123456789012') { // Demo admin key
          newErrors.adminKey = 'Invalid admin key';
        }
      }
    }

    if (step === 2) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      
      // Phone is required for backend
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
    }

    if (step === 3 && !agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    setErrors({}); 

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        address: formData.address || '',
        user_type: formData.role === 'vehicle_owner' ? 'owner' : formData.role,
        adminKey: formData.adminKey // Pass this for the backend check
      };

      const response = await userService.register(userData);
      
      if (response.success) {
        // 🔥 THE CRITICAL FIX: Save the user session locally
        // We use the ID from the response and the data we just sent
        const loggedInUser = {
          user_id: response.userId,
          full_name: userData.full_name,
          email: userData.email,
          user_type: userData.user_type
        };

        localStorage.setItem('user', JSON.stringify(loggedInUser));
        localStorage.setItem('token', `token-${response.userId}`); // Create a temp token

        setSuccess(true);
        
        // Short delay so they see the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }

    } catch (error) {
      console.error('❌ Registration failed:', error);
      // ... (rest of your error handling)
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                }
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || 'At least 8 characters'}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                }
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                }
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Select your user type to customize your experience:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {userRoles.map((role) => (
                <Paper
                  key={role.value}
                  onClick={() => {
                    if (loading) return;
                    setFormData({ ...formData, role: role.value });
                  }}
                  sx={{
                    p: 2,
                    cursor: loading ? 'default' : 'pointer',
                    border: formData.role === role.value 
                      ? '2px solid #ff2d55' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: formData.role === role.value 
                      ? 'rgba(255, 45, 85, 0.1)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.7 : 1,
                    '&:hover': !loading && {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: formData.role === role.value 
                        ? '#ff2d55' 
                        : 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {role.value === 'admin' && <SecurityIcon />}
                      {role.value === 'mechanic' && <BuildIcon />}
                      {role.value === 'vehicle_owner' && <DirectionsCarIcon />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {role.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {role.description}
                      </Typography>
                    </Box>
                    {formData.role === role.value && (
                      <CheckCircleIcon sx={{ color: '#34c759' }} />
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Admin Key Input (only shown when Admin is selected) */}
            {formData.role === 'admin' && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Admin Key (12-digit)"
                  name="adminKey"
                  value={formData.adminKey || ''}
                  onChange={handleChange}
                  error={!!errors.adminKey}
                  helperText={errors.adminKey || 'Enter the 12-digit admin key provided by system administrator'}
                  required
                  disabled={loading}
                  inputProps={{ 
                    maxLength: 12,
                    pattern: '[0-9]*',
                    inputMode: 'numeric'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 12,
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Example admin key for demo: 123456789012
                </Typography>
              </Box>
            )}

            {errors.role && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {errors.role}
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 12,
                  }
                }}
              />

              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 12,
                  }
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Phone Number (10 digits)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone || '10-digit phone number is required'}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              inputProps={{
                maxLength: 10,
                pattern: '[0-9]*',
                inputMode: 'numeric'
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                }
              }}
            />

            <TextField
              fullWidth
              label="Address (Optional)"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                }
              }}
            />

            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.notifications}
                    onChange={handleChange}
                    name="notifications"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Receive maintenance reminders and notifications"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.newsletter}
                    onChange={handleChange}
                    name="newsletter"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Subscribe to newsletter and updates"
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            {success ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: '#34c759', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Account Created Successfully!
                </Typography>
                <Typography color="text.secondary">
                  Redirecting to your dashboard...
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Please review and agree to our terms to complete your registration:
                </Typography>
                
                <Paper sx={{ 
                  p: 3, 
                  mt: 2, 
                  mb: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  <Typography variant="body2">
                    <strong>Terms and Conditions</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    By creating an account, you agree to our terms of service and privacy policy. 
                    You acknowledge that you are responsible for maintaining the confidentiality 
                    of your account and password. You agree to accept responsibility for all 
                    activities that occur under your account or password.
                  </Typography>
                </Paper>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      color="primary"
                      disabled={loading}
                    />
                  }
                  label="I agree to the terms and conditions"
                />
                {errors.terms && (
                  <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {errors.terms}
                  </Typography>
                )}

                {errors.submit && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.submit}
                  </Alert>
                )}
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <StyledPaper elevation={0}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ff2d55 0%, #ff5c7f 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <DirectionsCarIcon sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join thousands managing their vehicles with CarSync
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label} expanded>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {renderStepContent(index)}
                
                {index !== steps.length - 1 && !success && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                    {index > 0 && (
                      <Button 
                        onClick={handleBack} 
                        disabled={loading}
                        variant="outlined"
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      disabled={loading}
                      sx={{
                        ml: 'auto',
                        background: 'linear-gradient(135deg, #007aff 0%, #5ac8fa 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0056cc 0%, #2a9df4 100%)',
                        }
                      }}
                    >
                      Continue
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Final Step Actions */}
        {activeStep === steps.length - 1 && !success && (
          <Box sx={{ mt: 2 }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              fullWidth
              disabled={loading || !agreeToTerms}
              sx={{
                py: 1.5,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #ff2d55 0%, #ff5c7f 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #cc0033 0%, #ff2d55 100%)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            {activeStep > 0 && (
              <Button 
                onClick={handleBack} 
                fullWidth 
                sx={{ mt: 1 }} 
                disabled={loading}
                variant="outlined"
              >
                Back
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: '#007aff',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default Register;