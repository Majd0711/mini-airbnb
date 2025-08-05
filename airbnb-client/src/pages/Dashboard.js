import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { reservationAPI } from '../services/api';

const Dashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const { data } = await reservationAPI.getReservations();
        setReservations(data.data || []);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Failed to load reservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!isAdmin) {
    return (
      <Container>
        <Typography variant="h5" color="error" sx={{ mt: 4 }}>
          Access Denied. Admin privileges required.
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h5" color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reservations Dashboard
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Reservation ID</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((reservation) => (
                  <TableRow hover key={reservation._id}>
                    <TableCell>{reservation._id}</TableCell>
                    <TableCell>{reservation.user?.email}</TableCell>
                    <TableCell>{reservation.room?.title}</TableCell>
                    <TableCell>
                      {format(new Date(reservation.checkInDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(reservation.checkOutDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={reservation.status}
                        color={
                          reservation.status === 'confirmed'
                            ? 'success'
                            : reservation.status === 'pending'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${reservation.totalPrice}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          // Handle view details
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={reservations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default Dashboard;
