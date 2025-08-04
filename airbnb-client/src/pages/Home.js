import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Tune as TuneIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import RoomCard from '../components/RoomCard';
import { roomAPI } from '../services/api';

// Sample categories for the filter tabs
const categories = [
  { id: 'all', label: 'All' },
  { id: 'apartments', label: 'Apartments' },
  { id: 'houses', label: 'Houses' },
  { id: 'cabins', label: 'Cabins' },
  { id: 'beachfront', label: 'Beachfront' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'amazing_views', label: 'Amazing views' },
  { id: 'trending', label: 'Trending' },
];

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch rooms on component mount and when filters change
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const { data } = await roomAPI.getRooms({
          category: activeCategory === 'all' ? undefined : activeCategory,
          search: searchQuery,
          limit: 12
        });
        setRooms(data.data || []);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [activeCategory, searchQuery]);
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle category change
  const handleCategoryChange = (event, newValue) => {
    setActiveCategory(newValue);
  };
  
  // Handle room click
  const handleRoomClick = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };
  
  // Handle search form submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // The search is already handled by the useEffect that watches searchQuery
  };
  
  // Render loading skeletons
  const renderLoadingSkeletons = () => {
    return Array(8).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Skeleton variant="rectangular" height={200} />
          <CardContent sx={{ flexGrow: 1 }}>
            <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={20} style={{ marginBottom: 8 }} />
            <Skeleton width="30%" height={20} />
          </CardContent>
        </Card>
      </Grid>
    ));
  };
  
  // Render room cards
  const renderRoomCards = () => {
    if (loading) {
      return renderLoadingSkeletons();
    }
    
    if (error) {
      return (
        <Grid item xs={12}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Grid>
      );
    }
    
    if (rooms.length === 0) {
      return (
        <Grid item xs={12}>
          <Typography variant="h6" align="center" color="textSecondary" sx={{ my: 4 }}>
            No rooms found matching your criteria. Try adjusting your search.
          </Typography>
        </Grid>
      );
    }
    
    return rooms.map((room) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={room._id}>
        <RoomCard 
          room={room} 
          onClick={() => handleRoomClick(room._id)} 
          isFavorite={false}
          onFavoriteToggle={() => {}}
        />
      </Grid>
    ));
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          height: { xs: '60vh', md: '70vh' },
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          px: 2,
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant={isMobile ? 'h4' : 'h2'} 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
            }}
          >
            Find your perfect getaway
          </Typography>
          
          {/* Search Form */}
          <Paper 
            component="form" 
            onSubmit={handleSearchSubmit}
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 800,
              mx: 'auto',
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'white',
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search destinations"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: {
                  '& fieldset': { border: 'none' },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ 
                ml: 1,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Search
            </Button>
          </Paper>
        </Container>
      </Box>
      
      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        {/* Category Tabs */}
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Tabs
            value={activeCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="room categories"
            sx={{
              '& .MuiTabs-scrollButtons.Mui-disabled': {
                opacity: 0.3,
              },
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                color: 'text.primary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category.id}
                value={category.id}
                label={category.label}
                sx={{
                  minWidth: 80,
                  '&.MuiTab-root': {
                    minHeight: 64,
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>
        
        {/* Room Grid */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {renderRoomCards()}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
