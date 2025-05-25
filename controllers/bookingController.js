require("dotenv").config();
const Booking = require("../models/Booking");
const Concert = require("../models/Concert");

module.exports = {
  // Get all concerts available for booking
  getUserBookingConcert: async (req, res) => {
    try {
      const concerts = await Concert.find().sort({ date: 1 });
      res.render("user/concert", { concerts });
    } catch (err) {
      res.render("error", { error: err.message });
    }
  },

  // Get a specific concert by ID
  getConcertById: async (req, res) => {
    try {
      const concert = await Concert.findById(req.params.concert_id);
      if (!concert) {
        req.flash("error", "Concert not found");
        return res.redirect("/concerts");
      }
      res.render("bookings/index", { concert });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/concerts");
    }
  },
  //view a specific booking by specific user
  getBookingById: async (req, res) => {
    try {
      const userId = req.params.user_id;
      const booking = await Booking.find({user: userId})
      // only concerts name 
      .populate("concert", "name")
      .populate("user", "username email role")
      .sort({ bookingDate: -1 }) 
      ;
      if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
      }
      res.render("user/my-booking", { booking });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/bookings");
    }
  },

  // Book tickets for a concert
  bookTickets: async (req, res) => {
    try {
      const { concertId, name, email, phone, ticketQuantity, paymentMethod } =
        req.body;
      const userId = req.user._id;
      console.log(
        "Booking request:",
        concertId,
        name,
        email,
        phone,
        ticketQuantity,
        paymentMethod
      );
      // Validation checks
      if (!concertId || !name || !email || !phone || !ticketQuantity) {
        req.flash("error", "Please fill all required fields");
        return res.redirect("back");
      }

      const concert = await Concert.findById(concertId);
      if (!concert) {
        req.flash("error", "Concert not found");
        return res.redirect("back");
      }

      if (ticketQuantity > concert.availableTickets) {
        req.flash("error", "Not enough tickets available");
        return res.redirect("back");
      }

      // Create booking
      const booking = await Booking.create({
        concert: concertId,
        user: userId,
        name,
        email,
        phone,
        tickets: ticketQuantity,
        paymentMethod,
        totalAmount: concert.ticketPrice * ticketQuantity,
        status: "confirmed",
        paymentStatus: "completed",
      });

      // Deduct tickets from concert availability
      concert.availableTickets -= ticketQuantity;
      await concert.save();

      // For other payment methods
      req.flash("success", "Booking successful!");
      res.redirect("/bookings");
    } catch (err) {
      console.error("Booking error:", err);
      req.flash("error", err.message);
      res.redirect("back");
    }
  },

  // Get all bookings
  // getAllBookingsAdmin: async (req, res) => {
  //   try {
  //     const bookings = await Booking.find()
  //       .populate("concert")
  //       .populate("user", " email role")
  //       .sort({ bookingDate: -1 });
  //     res.render("/concerts/get-all-booking", { bookings });
  //   } catch (err) {
  //     res.render("error", { error: err.message });
  //   }
  // },


  // Delete booking
  cancelBooking: async (req, res) => {
    try {
      // Get user ID from request
      const userId = req.user._id;
      const bookingId = req.params.id;
      console.log("Cancel booking ID:", bookingId);
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        req.flash("error", "Booking not found");
        // redirect user id and bookings
        return res.redirect(`/bookings`);
      }

      const concert = await Concert.findById(booking.concert);
      if (!concert) {
        req.flash("error", "Concert not found");
        return res.redirect("/bookings");
      }

      // Add tickets back to concert availability
      concert.availableTickets += booking.tickets;
      await concert.save();

      // Delete booking
      await Booking.findByIdAndDelete(bookingId);

      req.flash("success", "Booking canceled successfully!");
      res.redirect(`/bookings/my-bookings/${userId}`);
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/bookings");
    }
  },
};
