import React, { useState } from "react";
import { Box, Button, Typography, Grid, Stack, IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { format, addDays } from "date-fns";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import CheckoutModal from "./CheckoutModal";

const StyledBox = styled(Box)({
  padding: "10px",
  backgroundColor: "#f5f5f5",
  borderRadius: "8px",
  maxWidth: "800px",
  margin: "0 auto",
});

const StyledIconButton = styled(IconButton)(({ theme, disabled }) => ({
  backgroundColor: disabled ? "#e0e0e0" : "transparent",
  color: "#1976d2",
  padding: "0px",
  borderRadius: "50%",
  "&:hover": {
    backgroundColor: disabled ? "#e0e0e0" : "#1976d2",
    color: "#fff",
  },
}));

const DayButton = styled(Button)(({ selected }) => ({
  minWidth: "70px",
  padding: "5px",
  margin: "2px",
  backgroundColor: selected ? "#1976d2" : "#fff",
  color: selected ? "#fff" : "#000",
  "&:hover": {
    backgroundColor: selected ? "#1565c0" : "#e0e0e0",
  },
}));

const TimeSlotButton = styled(Button)(({ selected }) => ({
  minWidth: "80px",
  maxWidth: "300px",
  padding: "5px",
  margin: "0px",
  backgroundColor: selected ? "#2ecc71" : "#fff",
  color: selected ? "#fff" : "#000",
  border: "1px solid #ccc",
  "&:hover": {
    backgroundColor: selected ? "#27ae60" : "#e0e0e0",
  },
}));

const DateSelector = () => {
  // Inside the DateSelector component
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [slotDetails, setSlotDetails] = useState({ date: "", slots: [], total: 0 });

  const sessionRates = {
    Morning: 500,
    Afternoon: 300,
    Evening: 800,
    Night: 1000,
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBooking = () => {
    if (selectedDay !== null && selectedSlot.length > 0) {
      // Check if the selected slots are consecutive
      if (!areSlotsConsecutive(selectedSlot)) {
        alert("Please select consecutive slots.");
        return;
      }
  
      const dayDate = format(days[selectedDay].fullDate, "yyyy-MM-dd");
  
      const sessionBreakdown = {};
      selectedSlot.forEach((slot) => {
        const period = slots.find((s) => s.label === slot)?.period;
        if (period) {
          sessionBreakdown[period] = (sessionBreakdown[period] || 0) + sessionRates[period];
        }
      });
  
      const totalAmount = Object.values(sessionBreakdown).reduce((acc, val) => acc + val, 0);
      
      setSlotDetails({ date: dayDate, slots: selectedSlot, total: totalAmount });
      setShowCheckoutModal(true); // Trigger modal display
    } 
    else {
      alert("Please select a date and time slot.");
    }
  };

  const calculateDays = () => {
    const baseDate = addDays(new Date(), weekOffset * 7);
    const days = [];
    for (let i = 0; i < 4; i++) {
      const currentDate = addDays(baseDate, i);
      days.push({
        dayName: format(currentDate, "EEE"),
        date: format(currentDate, "dd MMM"),
        fullDate: currentDate,
      });
    }
    return days;
  };

  const getTimeSlots = (startTime, endTime, sessionRates) => {
    const slots = [];

    const timePeriods = [
      { name: "Morning", start: 4, end: 12 },
      { name: "Afternoon", start: 12, end: 18 },
      { name: "Evening", start: 18, end: 21 },
      { name: "Night", start: 21, end: 24 },
    ];

    timePeriods.forEach(({ name, start, end }) => {
      const periodStart = Math.max(start, startTime);
      const periodEnd = Math.min(end, endTime);

      for (let hour = periodStart; hour < periodEnd; hour += 0.5) {
        const startHour = Math.floor(hour);
        const startMinute = (hour % 1) * 60;
        const endHour = Math.floor(hour + 0.5);
        const endMinute = ((hour + 0.5) % 1) * 60;

        const startLabel = formatTime(startHour, startMinute);
        const endLabel = formatTime(endHour, endMinute);
        const label = `${startLabel} - ${endLabel}`;

        slots.push({ label, period: name, start: hour, end: hour + 0.5 });
      }
    });

    return slots;
  };

  const formatTime = (hour, minute, isFormatReq = true) => {
    const period = hour < 12 ? "AM" : "PM";
    const twelveHour = hour % 12 || 12;
    const formattedMinute = minute === 0 ? "00" : minute.toString().padStart(2, "0");
    if (isFormatReq) {
      return `${twelveHour}:${formattedMinute} ${period}`;
    }
    return `${twelveHour}:${formattedMinute}`;
  };

  const handlePreviousWeek = () => {
    if (weekOffset > 0) {
      setWeekOffset((prev) => prev - 1);
      setSelectedDay(0);
    }
  };

  const handleNextWeek = () => {
    setWeekOffset((prev) => prev + 1);
    setSelectedDay(0);
  };

  const days = calculateDays();
  const slots = getTimeSlots(6, 24, sessionRates);

  const handleSlotSelection = (slotLabel) => {
    const slotIndex = slots.findIndex((slot) => slot.label === slotLabel);
    if (slotIndex === -1) return;
  
    setSelectedSlot((prevSelectedSlots) => {
      const updatedSlots = [...prevSelectedSlots];
  
      // If the slot is already selected, deselect it
      if (updatedSlots.includes(slotLabel)) {
        return updatedSlots.filter((slot) => slot !== slotLabel);
      }
  
      // If no slots are selected, allow selection of this slot and the next one
      if (updatedSlots.length === 0) {
        if (slotIndex < slots.length - 1) {
          const nextSlot = slots[slotIndex + 1];
          if (nextSlot.period === slots[slotIndex].period) {
            updatedSlots.push(slotLabel, nextSlot.label);
            return updatedSlots; // return after successful selection
          } else {
            alert("Cannot book. Slots must be in the same period.");
            return prevSelectedSlots; // return unchanged if invalid
          }
        } else {
          alert("Cannot book. No more slots available in this period.");
          return prevSelectedSlots; // return unchanged if no further slots
        }
      }
  
      // If slots are already selected, ensure the new slot is consecutive and in the same period
      const selectedSlotIndices = updatedSlots
        .map((label) => slots.findIndex((slot) => slot.label === label))
        .sort((a, b) => a - b);
  
      const newSlotIndex = slotIndex;
      const firstSelectedIndex = selectedSlotIndices[0];
      const lastSelectedIndex = selectedSlotIndices[selectedSlotIndices.length - 1];
  
      // Check if the new slot is consecutive and in the same period
      if (
        (newSlotIndex === firstSelectedIndex - 1 || newSlotIndex === lastSelectedIndex + 1) &&
        slots[newSlotIndex].period === slots[firstSelectedIndex].period
      ) {
        updatedSlots.push(slotLabel); // add the valid slot
        return updatedSlots; // return updated slots list
      } else {
        alert("Please select consecutive slots within the same period.");
        return prevSelectedSlots; // return unchanged state if validation fails
      }
    });
  };
  
  const areSlotsConsecutive = (selectedSlots) => {
    // Sort the slots by their start time
    const sortedSlots = selectedSlots
      .map((slotLabel) => slots.find((slot) => slot.label === slotLabel))
      .sort((a, b) => a.start - b.start);
  
    // Check if the slots are consecutive
    for (let i = 1; i < sortedSlots.length; i++) {
      const previousSlot = sortedSlots[i - 1];
      const currentSlot = sortedSlots[i];
  
      // If the difference between the end time of the previous slot and the start time of the current slot is more than 0.5 hours, they are not consecutive
      if (currentSlot.start - previousSlot.end > 0.5) {
        return false;
      }
    }
  
    return true;
  };

  const isPreviousWeekDisabled = weekOffset <= 0;

  return (
    <>
      <StyledBox>
        {/* Navigation */}
        <Box textAlign="left" m={2}>
          <Typography variant="h6">
            <i>{selectedDay !== null ? format(days[selectedDay].fullDate, "EEEE, MMMM dd") : "Select a date"}</i>
          </Typography>
        </Box>
        <Grid container spacing={1} alignItems="center" justifyContent="center">
          {/* Previous Week Button */}
          <Grid item xs={1}>
            <StyledIconButton onClick={handlePreviousWeek} aria-label="Previous week" size="large" disabled={isPreviousWeekDisabled}>
              <IoIosArrowBack />
            </StyledIconButton>
          </Grid>

          {/* Date Selector */}
          <Grid item xs={10}>
            <Grid container spacing={0} justifyContent="left">
              {days.map((day, index) => (
                <Grid item key={index}>
                  <DayButton selected={selectedDay === index} onClick={() => setSelectedDay(index)}>
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {day.dayName}
                      </Typography>
                      <Typography variant="caption">{day.date}</Typography>
                    </Stack>
                  </DayButton>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Next Week Button */}
          <Grid item xs={1}>
            <StyledIconButton onClick={handleNextWeek} aria-label="Next week" size="large">
              <IoIosArrowForward />
            </StyledIconButton>
          </Grid>
        </Grid>

        {/* Time Slots */}
        {days[selectedDay] && (
          <Box mt={4} mb={8}>
            {["Morning", "Afternoon", "Evening", "Night"].map((period) => (
              <Box key={period} mb={2}>
                <Typography variant="subtitle1" fontWeight="bold" color="textSecondary" mb={1}>
                  {period} - ₹{sessionRates[period]}
                </Typography>
                <Grid container spacing={1} justifyContent="left">
                  {slots
                    .filter((slot) => slot.period === period)
                    .map((slot, slotIndex) => (
                      <Grid item xs={3} key={slotIndex}>
                        <TimeSlotButton selected={selectedSlot.includes(slot.label)} onClick={() => handleSlotSelection(slot.label)}>
                          {slot.label}
                        </TimeSlotButton>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            ))}
          </Box>
        )}
      </StyledBox>

      {/* Book Turf Button */}
      <Box sx={{ position: "fixed", bottom: 0, left: 0, width: "100%", zIndex: 999 }}>
        {selectedSlot.length > 0 && (
          <Button variant="contained" color="primary" fullWidth sx={{ padding: "12px" }} onClick={handleBooking}>
            Book Turf (₹{selectedSlot.reduce((total, slot) => {
              const period = slots.find((s) => s.label === slot)?.period;
              return total + (period ? sessionRates[period] : 0);
            }, 0)})
          </Button>
        )}
      </Box>
        
      {showCheckoutModal && (
        <CheckoutModal
          slotDetails={slotDetails}
          onClose={() => setShowCheckoutModal(false)} // Function to close the modal
        />
      )}
    
    </>
  );
};

export default DateSelector;