import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  Paper, 
  Divider,
  MenuItem,
  InputAdornment,
  IconButton,
  Popover,
  useTheme
} from '@mui/material';
import { 
  Event as EventIcon, 
  Person as PersonIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, differenceInDays, isAfter, isBefore } from 'date-fns';

const validationSchema = Yup.object({
  checkInDate: Yup.date()
    .required('Check-in date is required')
    .min(new Date(), 'Check-in date cannot be in the past'),
  checkOutDate: Yup.date()
    .required('Check-out date is required')
    .when('checkInDate', (checkInDate, schema) => {
      if (checkInDate) {
        const dayAfter = addDays(checkInDate, 1);
        return schema.min(dayAfter, 'Check-out must be at least 1 day after check-in');
      }
      return schema;
    }),
  guests: Yup.number()
    .required('Number of guests is required')
    .min(1, 'Minimum 1 guest')
    .max(10, 'Maximum 10 guests'),
});

const ReservationForm = ({ price, onDateSelect, maxGuests = 10, sx }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [cleaningFee, setCleaningFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Calculate fees when dates or price change
  useEffect(() => {
    if (nights > 0 && price) {
      const calculatedTotal = price * nights;
      const calculatedServiceFee = calculatedTotal * 0.1; // 10% service fee
      const calculatedCleaningFee = 25; // Flat cleaning fee
      const calculatedTax = (calculatedTotal + calculatedServiceFee + calculatedCleaningFee) * 0.08; // 8% tax
      
      setTotalPrice(calculatedTotal);
      setServiceFee(calculatedServiceFee);
      setCleaningFee(calculatedCleaningFee);
      setTax(calculatedTax);
      setGrandTotal(calculatedTotal + calculatedServiceFee + calculatedCleaningFee + calculatedTax);
    }
  }, [nights, price]);

  const formik = useFormik({
    initialValues: {
      checkInDate: null,
      checkOutDate: null,
      guests: 1,
    },
    validationSchema,
    onSubmit: (values) => {
      if (onDateSelect) {
        onDateSelect(values.checkInDate, values.checkOutDate);
      }
    },
  });

  // Handle date range selection
  const handleDateRangeSelect = (field, date) => {
    formik.setFieldValue(field, date);
    
    if (field === 'checkInDate' && formik.values.checkOutDate && isBefore(formik.values.checkOutDate, date)) {
      formik.setFieldValue('checkOutDate', null);
    }
    
    if (formik.values.checkInDate && formik.values.checkOutDate) {
      const nightsCount = differenceInDays(
        new Date(formik.values.checkOutDate),
        new Date(formik.values.checkInDate)
      );
      setNights(nightsCount);
      setIsDateRangeSelected(true);
    } else {
      setIsDateRangeSelected(false);
    }
  };

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'price-breakdown-popover' : undefined;

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={sx}>
      <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* Check-in Date */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-in"
                value={formik.values.checkInDate}
                onChange={(date) => handleDateRangeSelect('checkInDate', date)}
                minDate={new Date()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.checkInDate && Boolean(formik.errors.checkInDate)}
                    helperText={formik.touched.checkInDate && formik.errors.checkInDate}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {/* Check-out Date */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-out"
                value={formik.values.checkOutDate}
                onChange={(date) => handleDateRangeSelect('checkOutDate', date)}
                minDate={formik.values.checkInDate ? addDays(formik.values.checkInDate, 1) : new Date()}
                disabled={!formik.values.checkInDate}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.checkOutDate && Boolean(formik.errors.checkOutDate)}
                    helperText={formik.touched.checkOutDate && formik.errors.checkOutDate}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {/* Number of Guests */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Guests"
              name="guests"
              value={formik.values.guests}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.guests && Boolean(formik.errors.guests)}
              helperText={formik.touched.guests && formik.errors.guests}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                <MenuItem key={num} value={num}>
                  {num} {num === 1 ? 'guest' : 'guests'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Price Breakdown */}
        {isDateRangeSelected && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                ${price} x {nights} {nights === 1 ? 'night' : 'nights'}
              </Typography>
              <Typography variant="body2">${totalPrice.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">Service fee</Typography>
                <IconButton 
                  size="small" 
                  onClick={handleInfoClick}
                  sx={{ p: 0, ml: 0.5, color: 'text.secondary' }}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2">${serviceFee.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Cleaning fee</Typography>
              <Typography variant="body2">${cleaningFee.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Taxes</Typography>
              <Typography variant="body2">${tax.toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <Typography variant="subtitle1">Total</Typography>
              <Typography variant="subtitle1">${grandTotal.toFixed(2)}</Typography>
            </Box>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          type="submit"
          size="large"
          disabled={!formik.isValid || formik.isSubmitting}
          sx={{ mt: 3 }}
        >
          {isDateRangeSelected ? 'Reserve' : 'Check availability'}
        </Button>

        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
          You won't be charged yet
        </Typography>
      </Paper>

      {/* Service Fee Info Popover */}
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 280 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Service fee</Typography>
            <IconButton size="small" onClick={handleClosePopover}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            This helps us run our platform and offer services like 24/7 support on your trip.
          </Typography>
        </Box>
      </Popover>
    </Box>
  );
};

export default ReservationForm;
