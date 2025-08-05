import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button, Chip, Divider,
  Tabs, Tab, List, ListItem, ListItemText, ListItemAvatar,
  Avatar, useTheme, useMediaQuery, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
  IconButton, Menu, MenuItem, Snackbar, Alert, ListItemIcon
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { reservationAPI } from '../services/api';

const UserReservations = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated } = useAuth();
  
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentActionId, setCurrentActionId] = useState(null);

  // Fetch user's reservations
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const { data } = await reservationAPI.getUserReservations();
        setReservations(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Failed to load reservations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, [isAuthenticated]);

  // Filter reservations based on active tab
  const filteredReservations = reservations.filter(reservation => {
    const now = new Date();
    const checkOutDate = new Date(reservation.checkOutDate);
    const checkInDate = new Date(reservation.checkInDate);
    
    if (activeTab === 'upcoming') {
      return isAfter(checkInDate, now) && reservation.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return isBefore(checkOutDate, now) || reservation.status === 'cancelled';
    }
    return true;
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle menu open
  const handleMenuOpen = (event, reservationId) => {
    setAnchorEl(event.currentTarget);
    setCurrentActionId(reservationId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentActionId(null);
  };

  // Handle cancel reservation
  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setCancelDialogOpen(true);
    handleMenuClose();
  };

  // Confirm cancel reservation
  const handleConfirmCancel = async () => {
    if (!selectedReservation) return;
    
    try {
      await reservationAPI.cancelReservation(selectedReservation._id);
      
      // Update local state
      setReservations(reservations.map(res => 
        res._id === selectedReservation._id 
          ? { ...res, status: 'cancelled' } 
          : res
      ));
      
      setSnackbar({
        open: true,
        message: 'Reservation has been cancelled.',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setSnackbar({
        open: true,
        message: 'Failed to cancel reservation. Please try again.',
        severity: 'error'
      });
    } finally {
      setCancelDialogOpen(false);
      setSelectedReservation(null);
    }
  };

  // Handle leave review
  const handleLeaveReview = (reservation) => {
    // Navigate to review page or open review dialog
    console.log('Leave review for:', reservation);
    handleMenuClose();
    
    setSnackbar({
      open: true,
      message: 'Review feature coming soon!',
      severity: 'info'
    });
  };

  // Handle contact host
  const handleContactHost = (reservation) => {
    // Implement contact host functionality
    console.log('Contact host for:', reservation);
    handleMenuClose();
    
    setSnackbar({
      open: true,
      message: 'Messaging feature coming soon!',
      severity: 'info'
    });
  };

  // Handle view receipt
  const handleViewReceipt = (reservation) => {
    // Implement view receipt functionality
    console.log('View receipt for:', reservation);
    handleMenuClose();
    
    setSnackbar({
      open: true,
      message: 'Receipt feature coming soon!',
      severity: 'info'
    });
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format date range
  const formatDateRange = (startDate, endDate) => {
    return `${format(parseISO(startDate), 'MMM d')} - ${format(parseISO(endDate), 'MMM d, yyyy')}`;
  };

  // Get status chip
  const getStatusChip = (status) => {
    const statusConfig = {
      confirmed: { label: 'Confirmed', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
      pending: { label: 'Pending', color: 'warning', icon: <PendingIcon fontSize="small" /> },
      cancelled: { label: 'Cancelled', color: 'error', icon: <CancelIcon fontSize="small" /> },
      completed: { label: 'Completed', color: 'info', icon: <CheckCircleIcon fontSize="small" /> }
    };
    
    const config = statusConfig[status] || { label: status, color: 'default', icon: null };
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
        sx={{ ml: 1 }}
      />
    );
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h6" color="error" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  // Render empty state
  if (reservations.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Box textAlign="center" py={6}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No reservations found
          </Typography>
          <Typography color="text.secondary" paragraph>
            You don't have any {activeTab} reservations yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/')}
          >
            Browse Rooms
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
        Back
      </Button>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Trips
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab label="Upcoming" value="upcoming" />
          <Tab label="Past" value="past" />
        </Tabs>
        
        <List disablePadding>
          {filteredReservations.map((reservation) => (
            <Paper 
              key={reservation._id} 
              variant="outlined" 
              sx={{ mb: 2, overflow: 'hidden' }}
            >
              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'}>
                {/* Room image */}
                <Box 
                  sx={{
                    width: isMobile ? '100%' : 200,
                    height: isMobile ? 180 : 'auto',
                    minHeight: isMobile ? 'auto' : 160,
                    bgcolor: 'grey.100',
                    backgroundImage: `url(${reservation.room?.images?.[0]?.url || ''})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  {reservation.status === 'cancelled' && (
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        color="common.white"
                        sx={{ 
                          transform: 'rotate(-15deg)',
                          textTransform: 'uppercase',
                          letterSpacing: 2,
                          fontWeight: 'bold',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        Cancelled
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Reservation details */}
                <Box flex={1} p={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {reservation.room?.title || 'Room'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {reservation.room?.location?.city}, {reservation.room?.location?.country}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" flexWrap="wrap" mt={1} mb={1.5}>
                        <Box display="flex" alignItems="center" mr={2}>
                          <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            {formatDateRange(reservation.checkInDate, reservation.checkOutDate)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                          </Typography>
                        </Box>
                        {getStatusChip(reservation.status)}
                      </Box>
                      
                      <Box display="flex" alignItems="center">
                        <Typography variant="h6" color="primary">
                          ${reservation.totalPrice?.toFixed(2) || '0.00'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" ml={1}>
                          total
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, reservation._id)}
                        aria-label="reservation actions"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && currentActionId === reservation._id}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <MenuItem onClick={() => {
                          navigate(`/rooms/${reservation.room?._id}`);
                          handleMenuClose();
                        }}>
                          <ListItemIcon>
                            <HomeIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>View Room</ListItemText>
                        </MenuItem>
                        
                        {reservation.status === 'confirmed' && (
                          <MenuItem onClick={() => handleCancelClick(reservation)}>
                            <ListItemIcon>
                              <CancelIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText primaryTypographyProps={{ color: 'error' }}>
                              Cancel Reservation
                            </ListItemText>
                          </MenuItem>
                        )}
                        
                        {activeTab === 'past' && reservation.status !== 'cancelled' && (
                          <MenuItem onClick={() => handleLeaveReview(reservation)}>
                            <ListItemIcon>
                              <StarBorderIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Leave a Review</ListItemText>
                          </MenuItem>
                        )}
                        
                        <MenuItem onClick={() => handleContactHost(reservation)}>
                          <ListItemIcon>
                            <MessageIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Message Host</ListItemText>
                        </MenuItem>
                        
                        <MenuItem onClick={() => handleViewReceipt(reservation)}>
                          <ListItemIcon>
                            <ReceiptIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>View Receipt</ListItemText>
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {reservation.status === 'cancelled' && (
                <Box bgcolor="grey.50" p={2} borderTop={1} borderColor="divider">
                  <Typography variant="body2" color="text.secondary">
                    This reservation was cancelled on {format(parseISO(reservation.updatedAt), 'MMMM d, yyyy')}.
                  </Typography>
                </Box>
              )}
            </Paper>
          ))}
        </List>
      </Box>
      
      {/* Cancel confirmation dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your reservation at {selectedReservation?.room?.title}? 
            
            {selectedReservation && new Date(selectedReservation.checkInDate) > new Date() && (
              <>
                {' '}A cancellation fee may apply based on the host's cancellation policy.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep Reservation</Button>
          <Button 
            onClick={handleConfirmCancel} 
            variant="contained" 
            color="error"
          >
            Yes, Cancel Reservation
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserReservations;
