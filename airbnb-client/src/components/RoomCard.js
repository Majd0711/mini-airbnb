import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Rating, 
  Chip, 
  CardActionArea,
  useTheme
} from '@mui/material';
import { LocationOn, Hotel, People, Wifi, AcUnit, LocalParking, Kitchen, Pool } from '@mui/icons-material';
import { format } from 'date-fns';

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Sample amenities (you can customize based on your data structure)
  const amenities = [
    { icon: <Wifi fontSize="small" />, label: 'WiFi' },
    { icon: <AcUnit fontSize="small" />, label: 'Air Conditioning' },
    { icon: <LocalParking fontSize="small" />, label: 'Parking' },
    { icon: <Kitchen fontSize="small" />, label: 'Kitchen' },
    { icon: <Pool fontSize="small" />, label: 'Pool' },
  ].slice(0, 3); // Show only first 3 amenities

  const handleCardClick = () => {
    navigate(`/rooms/${room._id}`);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardActionArea onClick={handleCardClick} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {/* Room Image */}
        <Box sx={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={room.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=Room+Image'}
            alt={room.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box 
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              px: 2,
            }}
          >
            <Chip 
              label={`${room.price}€ / night`} 
              color="primary" 
              sx={{ 
                fontWeight: 'bold',
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }} 
            />
            {room.isAvailable && (
              <Chip 
                label="Available" 
                color="success"
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  backdropFilter: 'blur(4px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }} 
              />
            )}
          </Box>
        </Box>

        {/* Room Details */}
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h3" noWrap sx={{ fontWeight: 600, flex: 1, mr: 1 }}>
              {room.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating 
                value={4.5} 
                precision={0.5} 
                readOnly 
                size="small"
                sx={{ mr: 0.5 }}
              />
              <Typography variant="body2" color="text.secondary">
                4.5
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn color="action" fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {room.location?.city}, {room.location?.country}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <People color="action" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}
            </Typography>
          </Box>

          {/* Amenities */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
            {amenities.map((amenity, index) => (
              <Chip
                key={index}
                icon={amenity.icon}
                label={amenity.label}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem',
                  '& .MuiChip-icon': { color: 'primary.main' },
                }}
              />
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default RoomCard;
