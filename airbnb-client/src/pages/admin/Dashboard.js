import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Add as AddIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { roomAPI, reservationAPI } from '../../services/api';

// Status chip configuration
const statusChipProps = {
  pending: {
    label: 'Pending',
    color: 'warning',
    icon: <PendingIcon fontSize="small" />
  },
  confirmed: {
    label: 'Confirmed',
    color: 'success',
    icon: <CheckCircleIcon fontSize="small" />
  },
  cancelled: {
    label: 'Cancelled',
    color: 'error',
    icon: <CancelIcon fontSize="small" />
  },
  completed: {
    label: 'Completed',
    color: 'info',
    icon: <CheckCircleIcon fontSize="small" />
  }
};

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for rooms
  const [rooms, setRooms] = useState([]);
  const [roomPage, setRoomPage] = useState(0);
  const [roomRowsPerPage, setRoomRowsPerPage] = useState(10);
  const [roomSearch, setRoomSearch] = useState('');
  
  // State for reservations
  const [reservations, setReservations] = useState([]);
  const [reservationPage, setReservationPage] = useState(0);
  const [reservationRowsPerPage, setReservationRowsPerPage] = useState(10);
  
  // State for stats
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalReservations: 0,
    pendingReservations: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  
  // Loading and error states
  const [loading, setLoading] = useState({
    rooms: true,
    reservations: true,
    stats: true,
  });
  
  // Fetch data on component mount and when tab changes
  useEffect(() => {
    if (tabValue === 0) {
      fetchStats();
    } else if (tabValue === 1) {
      fetchRooms();
    } else if (tabValue === 2) {
      fetchReservations();
    }
  }, [tabValue, roomPage, roomRowsPerPage, reservationPage, reservationRowsPerPage]);
  
  // Fetch rooms data
  const fetchRooms = async () => {
    try {
      setLoading(prev => ({ ...prev, rooms: true }));
      const { data } = await roomAPI.getRooms({
        page: roomPage + 1,
        limit: roomRowsPerPage,
        search: roomSearch || undefined,
      });
      setRooms(data.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  };
  
  // Fetch reservations data
  const fetchReservations = async () => {
    try {
      setLoading(prev => ({ ...prev, reservations: true }));
      const { data } = await reservationAPI.getReservations({
        page: reservationPage + 1,
        limit: reservationRowsPerPage,
      });
      setReservations(data.data || []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(prev => ({ ...prev, reservations: false }));
    }
  };
  
  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      // Mock data - replace with actual API calls
      setStats({
        totalRooms: 42,
        activeRooms: 38,
        totalReservations: 156,
        pendingReservations: 8,
        totalRevenue: 24500,
        monthlyRevenue: 4500,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle room page change
  const handleRoomPageChange = (event, newPage) => {
    setRoomPage(newPage);
  };
  
  // Handle room rows per page change
  const handleRoomRowsPerPageChange = (event) => {
    setRoomRowsPerPage(parseInt(event.target.value, 10));
    setRoomPage(0);
  };
  
  // Handle reservation page change
  const handleReservationPageChange = (event, newPage) => {
    setReservationPage(newPage);
  };
  
  // Handle reservation rows per page change
  const handleReservationRowsPerPageChange = (event) => {
    setReservationRowsPerPage(parseInt(event.target.value, 10));
    setReservationPage(0);
  };
  
  // Handle room search
  const handleRoomSearch = (event) => {
    setRoomSearch(event.target.value);
    setRoomPage(0);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get status chip
  const getStatusChip = (status) => {
    const chipProps = statusChipProps[status] || {
      label: status,
      color: 'default',
      icon: null
    };
    
    return (
      <Chip
        icon={chipProps.icon}
        label={chipProps.label}
        color={chipProps.color}
        size="small"
        variant="outlined"
      />
    );
  };
  
  // Render stats cards
  const renderStatsCards = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <HomeIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{stats.totalRooms}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Rooms
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{stats.totalReservations}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reservations
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <PendingIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{stats.pendingReservations}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Reservations
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <MoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{formatCurrency(stats.monthlyRevenue)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Revenue
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  // Render rooms table
  const renderRoomsTable = () => (
    <Card>
      <CardHeader 
        title="Rooms"
        action={
          <Button 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/rooms/new')}
          >
            Add Room
          </Button>
        }
      />
      <Divider />
      <Box sx={{ p: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search rooms..."
          value={roomSearch}
          onChange={handleRoomSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, width: 300 }}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.rooms ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No rooms found
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={room.images?.[0]?.url} 
                        variant="rounded"
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Typography variant="body2">
                        {room.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.location?.city}, {room.location?.country}</TableCell>
                  <TableCell>{formatCurrency(room.pricePerNight)}/night</TableCell>
                  <TableCell>
                    <Chip 
                      label={room.isActive ? 'Active' : 'Inactive'} 
                      color={room.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => navigate(`/admin/rooms/${room._id}`)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={100} // Replace with actual count from API
        rowsPerPage={roomRowsPerPage}
        page={roomPage}
        onPageChange={handleRoomPageChange}
        onRowsPerPageChange={handleRoomRowsPerPageChange}
      />
    </Card>
  );
  
  // Render reservations table
  const renderReservationsTable = () => (
    <Card>
      <CardHeader 
        title="Reservations"
        action={
          <Button 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/reservations/new')}
          >
            Add Reservation
          </Button>
        }
      />
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking #</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.reservations ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No reservations found
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => (
                <TableRow key={reservation._id} hover>
                  <TableCell>#{reservation.bookingNumber}</TableCell>
                  <TableCell>{reservation.user?.name || 'Guest'}</TableCell>
                  <TableCell>
                    {reservation.room?.title?.substring(0, 20)}{reservation.room?.title?.length > 20 ? '...' : ''}
                  </TableCell>
                  <TableCell>
                    {formatDate(reservation.checkInDate)} - {formatDate(reservation.checkOutDate)}
                  </TableCell>
                  <TableCell>{formatCurrency(reservation.totalPrice)}</TableCell>
                  <TableCell>
                    {getStatusChip(reservation.status)}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/admin/reservations/${reservation._id}`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={100} // Replace with actual count from API
        rowsPerPage={reservationRowsPerPage}
        page={reservationPage}
        onPageChange={handleReservationPageChange}
        onRowsPerPageChange={handleReservationRowsPerPageChange}
      />
    </Card>
  );
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Dashboard" icon={<BarChartIcon />} {...a11yProps(0)} />
          <Tab label="Rooms" icon={<HomeIcon />} {...a11yProps(1)} />
          <Tab label="Reservations" icon={<PeopleIcon />} {...a11yProps(2)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {renderStatsCards()}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recent Reservations
          </Typography>
          <Paper sx={{ mb: 4 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking #</TableCell>
                    <TableCell>Guest</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.slice(0, 5).map((reservation) => (
                    <TableRow key={reservation._id} hover>
                      <TableCell>#{reservation.bookingNumber}</TableCell>
                      <TableCell>{reservation.user?.name || 'Guest'}</TableCell>
                      <TableCell>
                        {reservation.room?.title?.substring(0, 15)}{reservation.room?.title?.length > 15 ? '...' : ''}
                      </TableCell>
                      <TableCell>
                        {formatDate(reservation.checkInDate)} - {formatDate(reservation.checkOutDate)}
                      </TableCell>
                      <TableCell>{formatCurrency(reservation.totalPrice)}</TableCell>
                      <TableCell>
                        {getStatusChip(reservation.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderRoomsTable()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {renderReservationsTable()}
      </TabPanel>
    </Container>
  );
};

export default Dashboard;
