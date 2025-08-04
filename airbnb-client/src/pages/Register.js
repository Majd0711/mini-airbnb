import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  useTheme,
  useMediaQuery,
  Step,
  StepLabel,
  Stepper,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  phone: Yup.string()
    .matches(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/,
      'Enter a valid phone number'
    )
    .required('Phone number is required'),
  birthDate: Yup.date()
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      'You must be at least 18 years old'
    )
    .required('Date of birth is required'),
  userType: Yup.string()
    .oneOf(['guest', 'host'], 'Please select a user type')
    .required('Please select a user type'),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

const steps = ['Account Information', 'Personal Details', 'Complete Registration'];

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      birthDate: null,
      userType: 'guest',
      termsAccepted: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        setLoading(true);
        
        // Format the data for the API
        const userData = {
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          password: values.password,
          phone: values.phone,
          birthDate: values.birthDate,
          role: values.userType,
        };

        const result = await register(userData);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.message || 'Registration failed. Please try again.');
        }
      } catch (err) {
        console.error('Registration error:', err);
        setError('An error occurred during registration. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleNext = () => {
    // Validate current step before proceeding
    const currentStepFields = getStepFields(activeStep);
    const currentSchema = Yup.object().shape(
      Object.keys(validationSchema.fields)
        .filter((key) => currentStepFields.includes(key))
        .reduce((obj, key) => ({
          ...obj,
          [key]: validationSchema.fields[key],
        }), {})
    );

    currentSchema
      .validate(formik.values, { abortEarly: false })
      .then(() => {
        setActiveStep((prevStep) => prevStep + 1);
      })
      .catch((err) => {
        const errors = {};
        err.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        formik.setErrors(errors);
      });
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return ['email', 'password', 'confirmPassword'];
      case 1:
        return ['firstName', 'lastName', 'phone', 'birthDate', 'userType'];
      case 2:
        return ['termsAccepted'];
      default:
        return [];
    }
  };

  const handleSocialRegister = (provider) => {
    // Implement social registration logic here
    console.log(`Registering with ${provider}`);
    // This would typically redirect to the OAuth provider
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Create a password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone number"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of birth"
                  value={formik.values.birthDate}
                  onChange={(date) => formik.setFieldValue('birthDate', date, true)}
                  maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                  openTo="year"
                  views={['year', 'month', 'day']}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      id="birthDate"
                      name="birthDate"
                      error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                      helperText={formik.touched.birthDate && formik.errors.birthDate}
                      disabled={loading}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" error={formik.touched.userType && Boolean(formik.errors.userType)}>
                <InputLabel id="user-type-label">I want to</InputLabel>
                <Select
                  labelId="user-type-label"
                  id="userType"
                  name="userType"
                  value={formik.values.userType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="I want to"
                  disabled={loading}
                  startAdornment={
                    <InputAdornment position="start">
                      <BadgeIcon color="action" sx={{ mr: 1 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="guest">Book places to stay</MenuItem>
                  <MenuItem value="host">Rent out my property</MenuItem>
                </Select>
                {formik.touched.userType && formik.errors.userType && (
                  <FormHelperText>{formik.errors.userType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              By creating an account, you agree to our{' '}
              <Link href="#" color="primary" underline="hover">
                Terms of Service
              </Link>
              ,{' '}
              <Link href="#" color="primary" underline="hover">
                Payments Terms of Service
              </Link>
              , and{' '}
              <Link href="#" color="primary" underline="hover">
                Nondiscrimination Policy
              </Link>
              . You also consent to receive phone calls and text messages from us regarding your account, and agree to our{' '}
              <Link href="#" color="primary" underline="hover">
                Privacy Policy
              </Link>
              .
            </Typography>
            <FormControl
              required
              error={formik.touched.termsAccepted && Boolean(formik.errors.termsAccepted)}
              component="fieldset"
              variant="standard"
              fullWidth
              margin="normal"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.termsAccepted}
                    onChange={formik.handleChange}
                    name="termsAccepted"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="I agree to the terms and conditions"
              />
              {formik.touched.termsAccepted && formik.errors.termsAccepted && (
                <FormHelperText>{formik.errors.termsAccepted}</FormHelperText>
              )}
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              We'll send you marketing promotions, special offers, inspiration, and policy updates via email. You can opt out of receiving these at any time in your account settings or directly from the marketing notification.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Create an account
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Join Mini-Airbnb to book unique homes and experiences around the world
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                variant="outlined"
                sx={{ minWidth: 120 }}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!formik.isValid || loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 120 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>

          {activeStep === 0 && (
            <>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR CONTINUE WITH
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                <IconButton
                  onClick={() => handleSocialRegister('google')}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                  }}
                >
                  <GoogleIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleSocialRegister('facebook')}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleSocialRegister('apple')}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                  }}
                >
                  <AppleIcon />
                </IconButton>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    color="primary"
                    underline="hover"
                    sx={{ fontWeight: 500 }}
                  >
                    Log in
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
