import React, { useState, useEffect } from "react";
import { Modal, Container, Typography, Grid, Avatar, TextField, Button, Box, Stack, IconButton } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import CloseIcon from "@mui/icons-material/Close";  // Import CloseIcon
import SuccessModal from "./PaymentStatusModal";

export default function CheckoutModal({ slotDetails, onClose }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [paymentSuccess, setPaymentSuccess] = useState(true);

  useEffect(() => {
    if (!slotDetails || slotDetails.slots.length <= 0) {
      onClose();
    }
  }, [slotDetails, onClose]);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "No Date Selected!";
    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
      }).format(new Date(dateString));
    } catch (error) {
      console.error("Invalid date format:", error);
      return "Invalid Date";
    }
  };

  const formatSlotRange = (slots) => {
    if (!slots || slots.length < 1) return "No time selected";
    
    if (slots.length === 1) {
      const [start, end] = slots[0].split(" - ");
      return `${start} to ${end}`;
    }

    const startSlot = slots[0].split(" - ")[0];
    const endSlot = slots[slots.length - 1].split(" - ")[1];
    return `${startSlot} to ${endSlot}`;
  };

  const handlePhoneNumberChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length <= 10) setPhoneNumber(value);
  };

  const validateForm = () => {
    return name.trim().length >= 3 && phoneNumber.length === 10;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    console.log("Booking Details:", {
      name,
      phoneNumber,
      slotDetails,
    });

    setName("");
    setPhoneNumber("");
    setTouched({ name: false, phone: false });
    onClose();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };  

  const handlePayment = async () => {
    if (!validateForm()) return;
  
    const isRazorpayLoaded = await loadRazorpayScript();
    if (!isRazorpayLoaded) {
      alert("Failed to load Razorpay. Check your internet connection.");
      return;
    }
  
    // ✅ Now Razorpay is available
    const options = {
      key: "rzp_test_kuhZJZX5qOQ9QQ", // Replace with your actual Razorpay API Key
      amount: slotDetails?.total * 100, // Convert ₹ to paise (₹1 = 100 paise)
      currency: "INR",
      name: "Golden Glaze Turf",
      description: "Turf Booking Payment",
      image: "https://your-logo-url.com/logo.png", // Optional logo
      handler: function (response) {
        SuccessModal(true);
        onClose();
      },
      prefill: {
        name: name,
        contact: phoneNumber,
      },
      theme: {
        color: "#1976d2",
      },
    };
  
    try {
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
      alert("Error processing payment. Try again.");
    }
  };

  return (
    <Modal
      open={Boolean(slotDetails)}
      onClose={onClose}
      aria-labelledby="checkout-modal"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Container
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 3,
          boxShadow: 24,
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',  // Position relative to position the close button
          width: '90%',  // Custom width
          maxWidth: '500px',  // Or you can set maxWidth as a specific value like 500px
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 15,
            right: 12,
            color: 'text.primary',
            zIndex: 10,
            "&:hover": {
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 30 }} />
        </IconButton>

        <Typography variant="h5" align="left" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
          Confirm Your Booking
        </Typography>

        <Grid container spacing={2}>
          {/* Venue Details */}
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" spacing={2} justifyContent="left">
              <Avatar alt="Golden Glaze Turf" sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                <SportsCricketIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Golden Glaze Turf</Typography>
            </Stack>
          </Grid>

          {/* Booking Details */}
          <Grid item xs={12}>
            <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: 2, p: 3 }}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center">
                  <CalendarMonthIcon color="primary" sx={{ mr: 1.5 }} />
                  <Typography variant="body1">{formatDisplayDate(slotDetails?.date)}</Typography>
                </Box>

                <Box display="flex" alignItems="center">
                  <AccessTimeIcon color="primary" sx={{ mr: 1.5 }} />
                  <Typography variant="body1">{formatSlotRange(slotDetails?.slots) || "No time selected"}</Typography>
                </Box>

                <Box display="flex" alignItems="center">
                  <CurrencyRupeeIcon color="primary" sx={{ mr: 1.5 }} />
                  <Typography variant="body1" fontWeight="medium">
                    {slotDetails?.total?.toFixed(2) || "0.00"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Booking Form */}
          <Grid item xs={12}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setTouched((t) => ({ ...t, name: true }));
                  }}
                  error={touched.name && name.trim().length < 3}
                  helperText={touched.name && name.trim().length < 3 ? "Name must be at least 3 characters" : ""}
                  sx={{ borderRadius: 2 }}
                />

                <TextField
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  error={touched.phone && phoneNumber.length !== 10}
                  helperText={touched.phone && phoneNumber.length !== 10 ? "Valid 10-digit phone number required" : ""}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: 10,
                  }}
                  sx={{ borderRadius: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    mt: 2,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  disabled={!validateForm()}
                  onClick={handlePayment}
                >
                  Confirm Payment (₹{slotDetails?.total?.toFixed(2) || "0.00"})
                </Button>

                {paymentSuccess && <SuccessModal open={paymentSuccess} onClose={() => setPaymentSuccess(false)} />}
                
              </Stack>
            </form>
          </Grid>
        </Grid>
      </Container>
    </Modal>
  );
}
