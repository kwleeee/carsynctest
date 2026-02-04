import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import apiServices from '../services/api';
const userService = apiServices.userService;

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 24,
  padding: 40,
  width: '100%',
  maxWidth: 420,
  margin: '0 auto',
}));

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    if (isLoggedIn === 'true' && user) {
      navigate('/dashboard');
    }
  }, [navigate]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Call API for authentication
    const response = await userService.login({
      email: formData.email,
      password: formData.password
    });
    
    // Check if login was successful
    if (response.success) {
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('✅ Login successful:', response.user);
      
      // Show success message
      alert('✅ Login successful! Welcome back!');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      setError(response.message || 'Login failed');
    }
    
  } catch (err) {
    // Handle API errors
    console.error('Login error:', err);
    const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message ||
                        'Invalid email or password';
    setError(errorMessage);
  } finally {
    setLoading(false);
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
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your Vehicle Tracker account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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

            <Box sx={{ textAlign: 'right', mb: 1 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                sx={{
                  color: '#007aff',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #ff2d55 0%, #ff5c7f 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #cc0033 0%, #ff2d55 100%)',
                },
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </form>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: '#007aff',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Create Account
            </Link>
          </Typography>
        </Box>

        {/* Demo credentials - Optional: Remove if using real API */}
        <Box sx={{ mt: 4, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> Using API authentication. Create an account first.
          </Typography>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default Login;