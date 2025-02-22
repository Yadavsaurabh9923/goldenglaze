import React, { useEffect } from "react";
import { Modal, Container, Typography, Button, Avatar } from "@mui/material";

export default function SuccessModal({ open, onClose }) {
  useEffect(() => {
    console.log("Success Modal Open Status:", open);
  }, [open]);  // ✅ Logs when `open` state changes

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="success-modal"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Container
        maxWidth="xs"
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 3,
          boxShadow: 24,
          textAlign: "center",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "success.main",
            width: 56,
            height: 56,
            mx: "auto",
            mb: 2,
          }}
        >
          ✅
        </Avatar>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body1" mb={3}>
          Your booking has been confirmed. 🎉
        </Typography>
        <Button variant="contained" color="primary" fullWidth onClick={onClose}>
          Close
        </Button>
      </Container>
    </Modal>
  );
}
