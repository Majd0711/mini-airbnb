import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Grid, Paper, Button, Chip, Divider, 
  IconButton, Rating, Tabs, Tab, List, ListItem, ListItemIcon, 
  ListItemText, Avatar, useTheme, useMediaQuery, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Snackbar, Alert
} from '@mui/material';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import {
  ArrowBack, Favorite, FavoriteBorder, Share, LocationOn, Home,
  KingBed, Bathtub, Person, Wifi, Tv, AcUnit, Kitchen, LocalLaundryService,
  Work, SmokeFree, Pool, Check, Close, Star
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { roomAPI } from '../services/api';
import ReservationForm from '../components/ReservationForm';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const { data } = await roomAPI.getRoomById(id);
        setRoom(data.data);
        if (user?.favorites?.includes(data.data._id)) {
          setIsFavorite(true);
        }
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDetails();
  }, [id, user]);
  
  const toggleFavorite = () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to save favorites',
        severity: 'info'
      });
      return;
    }
    setIsFavorite(!isFavorite);
    // TODO: Call API to update favorites
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbar({
      open: true,
      message: 'Link copied to clipboard!',
      severity: 'success'
    });
  };
  
  const handleBookNow = () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to book',
        severity: 'info'
      });
      return;
    }
    setShowReservationForm(true);
  };
  
  const handleReservationSubmit = async (reservationData) => {
    try {
      // TODO: Call reservation API
      console.log('Reservation data:', reservationData);
      setShowReservationForm(false);
      setSnackbar({
        open: true,
        message: 'Reservation successful!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error creating reservation:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create reservation',
        severity: 'error'
      });
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !room) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" color="error" sx={{ mt: 2 }}>
          {error || 'Room not found'}
        </Typography>
      </Container>
    );
  }
  
  const galleryImages = room.images?.map(img => ({
    original: img.url,
    thumbnail: img.thumbnailUrl || img.url
  })) || [];
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back to results</Button>
      
      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* Left column - Room details */}
        <Grid item xs={12} md={8}>
          {/* Image gallery */}
          <Paper sx={{ mb: 3, overflow: 'hidden' }}>
            {galleryImages.length > 0 ? (
              <ImageGallery
                items={galleryImages}
                showPlayButton={!isMobile}
                showFullscreenButton={!isMobile}
                showThumbnails={!isMobile}
                thumbnailPosition={isMobile ? 'bottom' : 'left'}
              />
            ) : (
              <Box height={400} bgcolor="grey.100" display="flex" alignItems="center" justifyContent="center">
                <Typography color="text.secondary">No images available</Typography>
              </Box>
            )}
          </Paper>
          
          {/* Room header */}
          <Box sx={{ mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h4" component="h1">
                  {room.title}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <Rating value={room.rating?.average || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    {room.rating?.count || 'No'} reviews
                  </Typography>
                  <Typography variant="body2" color="text.secondary" ml={2}>
                    <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {room.location?.city}, {room.location?.country}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Room details */}
            <Box sx={{ mb: 4 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Description" value="description" />
                <Tab label="Amenities" value="amenities" />
                <Tab label="Location" value="location" />
              </Tabs>
              
              <Box sx={{ mt: 2 }}>
                {activeTab === 'description' && (
                  <Typography>{room.description}</Typography>
                )}
                
                {activeTab === 'amenities' && (
                  <Grid container spacing={2}>
                    {[
                      { icon: <Wifi />, label: 'WiFi', value: room.amenities?.wifi },
                      { icon: <Tv />, label: 'TV', value: room.amenities?.tv },
                      { icon: <AcUnit />, label: 'Air Conditioning', value: room.amenities?.airConditioning },
                      { icon: <Kitchen />, label: 'Kitchen', value: room.amenities?.kitchen },
                      { icon: <LocalLaundryService />, label: 'Washer', value: room.amenities?.washer },
                      { icon: <Work />, label: 'Workspace', value: room.amenities?.workspace },
                      { icon: <SmokeFree />, label: 'No smoking', value: room.amenities?.noSmoking },
                      { icon: <Pool />, label: 'Pool', value: room.amenities?.pool },
                    ].map((item, index) => (
                      item.value && (
                        <Grid item xs={6} sm={4} key={index}>
                          <Box display="flex" alignItems="center">
                            {item.icon}
                            <Typography variant="body2" ml={1}>{item.label}</Typography>
                          </Box>
                        </Grid>
                      )
                    ))}
                  </Grid>
                )}
                
                {activeTab === 'location' && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {room.location?.address}
                    </Typography>
                    <Typography paragraph>
                      {room.location?.city}, {room.location?.state}, {room.location?.country}
                    </Typography>
                    <Box height={300} bgcolor="grey.100" borderRadius={1} display="flex" alignItems="center" justifyContent="center">
                      <Typography color="text.secondary">Map view would be displayed here</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
            
            {/* Host information */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar src={room.host?.avatar} sx={{ width: 56, height: 56, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Hosted by {room.host?.name}</Typography>
                  {room.host?.isSuperhost && (
                    <Chip 
                      label="Superhost" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {room.host?.bio || 'No bio available'}
              </Typography>
            </Paper>
          </Box>
        </Grid>
        
        {/* Right column - Booking */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 24, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h5" component="div">
                  ${room.pricePerNight} <Typography component="span" color="text.secondary">night</Typography>
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Star color="primary" fontSize="small" />
                  <Typography variant="body2" ml={0.5}>
                    {room.rating?.average?.toFixed(1) || 'New'}
                    <Typography component="span" color="text.secondary" ml={0.5}>
                      ({room.rating?.count || 0} reviews)
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              
              <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Box>
            
            <ReservationForm
              pricePerNight={room.pricePerNight}
              minNights={room.minimumNights || 1}
              maxGuests={room.maxGuests}
              onSubmit={handleReservationSubmit}
              submitButtonText="Reserve"
              showFullForm={false}
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              fullWidth 
              sx={{ mt: 2, py: 1.5 }}
              onClick={handleBookNow}
            >
              Book now
            </Button>
            
            <Typography variant="body2" color="text.secondary" align="center" mt={1}>
              You won't be charged yet
            </Typography>
            
            <List dense sx={{ mt: 2 }}>
              <ListItem disableGutters>
                <ListItemText primary={`$${room.pricePerNight} x 1 night`} />
                <Typography>${room.pricePerNight}</Typography>
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Service fee" />
                <Typography>${(room.pricePerNight * 0.1).toFixed(2)}</Typography>
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem disableGutters>
                <ListItemText primary="Total" primaryTypographyProps={{ fontWeight: 'bold' }} />
                <Typography fontWeight="bold">
                  ${(room.pricePerNight * 1.1).toFixed(2)}
                </Typography>
              </ListItem>
            </List>
          </Paper>
          
          <Paper elevation={0} sx={{ p: 3, mt: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Home color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">
                Entire {room.type} hosted by {room.host?.name}
              </Typography>
            </Box>
            
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Chip icon={<KingBed />} label={`${room.bedrooms} ${room.bedrooms === 1 ? 'bedroom' : 'bedrooms'}`} size="small" />
              <Chip icon={<Bathtub />} label={`${room.bathrooms} ${room.bathrooms === 1 ? 'bathroom' : 'bathrooms'}`} size="small" />
              <Chip icon={<Person />} label={`Up to ${room.maxGuests} guests`} size="small" />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {room.summary || 'No additional information available.'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomDetails;
