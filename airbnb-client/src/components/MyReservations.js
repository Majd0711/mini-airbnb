import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Button, 
  Divider, 
  Chip,
  Tabs,
  Tab,
  useTheme,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Event as EventIcon, 
  Person as PersonIcon, 
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { format, isAfter, isBefore, parseISO, isToday } from 'date-fns';
import { reservationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ReservationStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

const statusChipProps = {
  [ReservationStatus.PENDING]: {
    label: 'Pending',
    color: 'warning',
    icon: <PendingIcon fontSize="small" />
  },
  [ReservationStatus.CONFIRMED]: {
    label: 'Confirmed',
    color: 'success',
    icon: <CheckCircleIcon fontSize="small" />
  },
  [ReservationStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'error',
    icon: <CancelIcon fontSize="small" />
  },
  [ReservationStatus.COMPLETED]: {
    label: 'Completed',
    color: 'info',
    icon: <CheckCircleIcon fontSize="small" />
  }
};

const MyReservations = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState('upcoming');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const { data } = await reservationAPI.getMyReservations();
        setReservations(data.data || []);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Failed to load your reservations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReservations();
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setCancelDialogOpen(true);
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;

    try {
      await reservationAPI.cancelReservation(selectedReservation._id);
      // Update the local state to reflect the cancellation
      setReservations(prevReservations =>
        prevReservations.map(res =>
          res._id === selectedReservation._id
            ? { ...res, status: ReservationStatus.CANCELLED }
            : res
        )
      );
      setCancelDialogOpen(false);
      setSelectedReservation(null);
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError('Failed to cancel reservation. Please try again.');
    }
  };

  const handleViewDetails = (reservationId) => {
    navigate(`/reservations/${reservationId}`);
  };

  const filteredReservations = reservations.filter(reservation => {
    const checkOutDate = parseISO(reservation.checkOutDate);
    const today = new Date();
    
    if (tabValue === 'upcoming') {
      return isAfter(checkOutDate, today) && reservation.status !== ReservationStatus.CANCELLED;
    } else if (tabValue === 'past') {
      return isBefore(checkOutDate, today) || reservation.status === ReservationStatus.CANCELLED;
    }
    return true;
  });

  const getReservationStatus = (reservation) => {
    const checkInDate = parseISO(reservation.checkInDate);
    const checkOutDate = parseISO(reservation.checkOutDate);
    const today = new Date();

    if (reservation.status === ReservationStatus.CANCELLED) {
      return statusChipProps[ReservationStatus.CANCELLED];
    }

    if (isToday(checkInDate)) {
      return { label: 'Check-in Today', color: 'primary', icon: <HelpOutlineIcon fontSize="small" /> };
    }

    if (isToday(checkOutDate)) {
      return { label: 'Check-out Today', color: 'primary', icon: <HelpOutlineIcon fontSize="small" /> };
    }

    if (isAfter(today, checkInDate) && isBefore(today, checkOutDate)) {
      return { label: 'Ongoing', color: 'secondary', icon: <HelpOutlineIcon fontSize="small" /> };
    }

    return statusChipProps[reservation.status] || statusChipProps[ReservationStatus.CONFIRMED];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          My Reservations
        </Typography>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label="Upcoming" value="upcoming" />
          <Tab label="Past & Cancelled" value="past" />
        </Tabs>

        {filteredReservations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No {tabValue === 'upcoming' ? 'upcoming' : 'past'} reservations
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {tabValue === 'upcoming' 
                ? 'You don\'t have any upcoming trips. Start exploring and book your next stay!' 
                : 'Your past and cancelled trips will appear here.'}
            </Typography>
            {tabValue === 'upcoming' && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/')}
              >
                Find a place to stay
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredReservations.map((reservation) => {
              const status = getReservationStatus(reservation);
              const checkInDate = parseISO(reservation.checkInDate);
              const checkOutDate = parseISO(reservation.checkOutDate);
              const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
              
              return (
                <Grid item xs={12} key={reservation._id}>
                  <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                    <CardMedia
                      component="img"
                      sx={{ width: { xs: '100%', md: 300 }, height: { xs: 200, md: 'auto' } }}
                      image={reservation.room?.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={reservation.room?.title}
                    />
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mr: 2 }}>
                          {reservation.room?.title || 'Unknown Property'}
                        </Typography>
                        <Chip
                          icon={status.icon}
                          label={status.label}
                          color={status.color}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HomeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {reservation.room?.location?.address || 'Address not available'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            {format(checkInDate, 'MMM d, yyyy')} - {format(checkOutDate, 'MMM d, yyyy')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EventIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            {nights} {nights === 1 ? 'night' : 'nights'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          ${reservation.totalPrice?.toFixed(2) || '0.00'}
                          <Typography component="span" variant="body2" color="text.secondary">
                            {' '}total
                          </Typography>
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleViewDetails(reservation._id)}
                          >
                            View Details
                          </Button>
                          
                          {reservation.status === ReservationStatus.CONFIRMED && 
                            isAfter(new Date(), checkInDate) && 
                            isBefore(new Date(), checkOutDate) && (
                            <Button 
                              variant="contained" 
                              color="primary"
                              size="small"
                              onClick={() => handleCancelClick(reservation)}
                            >
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="cancel-dialog-title">
          Cancel Reservation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your reservation at {selectedReservation?.room?.title}? 
            {selectedReservation?.cancellationPolicy && (
              <span> {selectedReservation.cancellationPolicy}</span>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Reservation
          </Button>
          <Button 
            onClick={handleCancelReservation} 
            variant="contained" 
            color="error"
            autoFocus
          >
            Cancel Reservation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyReservations;
