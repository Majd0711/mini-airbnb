import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Rating, 
  Button, 
  Divider, 
  Chip, 
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  LocationOn, 
  People, 
  ArrowBack, 
  Favorite, 
  FavoriteBorder,
  Wifi, 
  AcUnit, 
  LocalParking, 
  Kitchen, 
  Pool,
  Tv,
  HotTub,
  LocalLaundryService,
  Pets,
  SmokeFree,
  LocalBar,
  Bathtub,
  Elevator,
  FitnessCenter,
  Restaurant,
  BeachAccess,
  AirlineSeatIndividualSuite
} from '@mui/icons-material';
import { DateRange } from '@mui/icons-material';
import { format } from 'date-fns';
import { roomAPI } from '../services/api';
import ReservationForm from './ReservationForm';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

const amenitiesIcons = {
  wifi: <Wifi />,
  airConditioning: <AcUnit />,
  parking: <LocalParking />,
  kitchen: <Kitchen />,
  pool: <Pool />,
  tv: <Tv />,
  hotTub: <HotTub />,
  laundry: <LocalLaundryService />,
  petsAllowed: <Pets />,
  noSmoking: <SmokeFree />,
  minibar: <LocalBar />,
  bathtub: <Bathtub />,
  elevator: <Elevator />,
  gym: <FitnessCenter />,
  restaurant: <Restaurant />,
  beachAccess: <BeachAccess />,
  kingBed: <AirlineSeatIndividualSuite />
};

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState({
    checkInDate: null,
    checkOutDate: null,
  });
  const [openReservation, setOpenReservation] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const { data } = await roomAPI.getRoom(id);
        setRoom(data.data);
        
        // Prepare images for gallery
        if (data.data.images && data.data.images.length > 0) {
          const galleryImages = data.data.images.map(img => ({
            original: img.url,
            thumbnail: img.url,
            originalAlt: data.data.title,
            thumbnailAlt: data.data.title
          }));
          setImages(galleryImages);
        } else {
          // Fallback to placeholder if no images
          setImages([{
            original: 'https://via.placeholder.com/1200x800?text=No+Image+Available',
            thumbnail: 'https://via.placeholder.com/150x100?text=No+Image+Available',
            originalAlt: 'No image available',
            thumbnailAlt: 'No image available'
          }]);
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  const handleDateSelect = (checkIn, checkOut) => {
    setSelectedDates({
      checkInDate: checkIn,
      checkOutDate: checkOut,
    });
    setOpenReservation(true);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically make an API call to save to favorites
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading room details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />} sx={{ mt: 2 }}>
          Back to Rooms
        </Button>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Room not found</Typography>
        <Button onClick={() => navigate('/')} startIcon={<ArrowBack />} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        onClick={() => navigate(-1)} 
        startIcon={<ArrowBack />} 
        sx={{ mb: 2 }}
      >
        Back to Results
      </Button>

      {/* Room Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {room.title}
          </Typography>
          <IconButton onClick={handleFavoriteToggle} color="primary">
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Rating value={4.5} precision={0.5} readOnly size="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              4.5 · 24 reviews
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn color="action" fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {room.location?.address}, {room.location?.city}, {room.location?.country}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Image Gallery */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden', 
          mb: 4,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <ImageGallery
          items={images}
          showPlayButton={!isMobile}
          showFullscreenButton={!isMobile}
          showThumbnails={!isMobile}
          showNav={!isMobile}
          thumbnailPosition={isMobile ? 'bottom' : 'left'}
          additionalClass="room-gallery"
          lazyLoad={true}
        />
      </Paper>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Room Type and Capacity */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {room.title} · {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {room.description}
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Amenities */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              What this place offers
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(amenitiesIcons).map(([key, icon]) => (
                <Grid item xs={6} sm={4} key={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ color: 'primary.main', mr: 1 }}>{icon}</Box>
                    <Typography variant="body2">
                      {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Location */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Location
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {room.location?.address}, {room.location?.city}, {room.location?.country}
            </Typography>
            {/* Here you would typically embed a map */}
            <Box 
              sx={{ 
                height: 300, 
                backgroundColor: theme.palette.grey[200],
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.text.secondary
              }}
            >
              Map would be displayed here
            </Box>
          </Box>
        </Grid>

        {/* Booking Card */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              position: 'sticky',
              top: 20
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                €{room.price} <Typography component="span" color="text.secondary">night</Typography>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={4.5} precision={0.5} readOnly size="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  4.5 (24)
                </Typography>
              </Box>
            </Box>

            <ReservationForm 
              price={room.price}
              onDateSelect={handleDateSelect}
              sx={{ mb: 3 }}
            />

            <Button 
              fullWidth 
              variant="contained" 
              size="large"
              onClick={() => setOpenReservation(true)}
              sx={{ py: 1.5, mb: 2 }}
            >
              Reserve
            </Button>

            <Typography variant="body2" color="text.secondary" align="center">
              You won't be charged yet
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Reservation Dialog */}
      <Dialog 
        open={openReservation} 
        onClose={() => setOpenReservation(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Complete your booking
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Review your booking details before proceeding to payment.
          </Typography>
          
          {/* Here you would add the reservation form or payment form */}
          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              {room.title}
            </Typography>
            {selectedDates.checkInDate && selectedDates.checkOutDate && (
              <Typography variant="body2" color="text.secondary">
                {format(new Date(selectedDates.checkInDate), 'MMM d, yyyy')} - {format(new Date(selectedDates.checkOutDate), 'MMM d, yyyy')}
              </Typography>
            )}
          </Box>
          
          {/* Add your payment form or booking confirmation here */}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenReservation(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            // Handle booking confirmation
            setOpenReservation(false);
            // Navigate to booking confirmation page
          }}>
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoomDetails;
