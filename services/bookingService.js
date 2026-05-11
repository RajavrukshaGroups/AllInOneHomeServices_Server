const Booking = require("../models/Booking");
const { generateBookingId } = require("../utils/generateBookingId");
const createBookingService = async (customer, allActiveBookings) => {
  const bookingId = generateBookingId();

  const services = allActiveBookings.map((booking) => {
    const { selections } = booking;

    let selectedPriceOptions = [];

    // SINGLE OPTIONS
    if (selections.selectedOptions) {
      Object.values(selections.selectedOptions).forEach((opt) => {
        if (opt?.label) {
          selectedPriceOptions.push({
            title: opt.label,
            price: opt.price,
          });
        }
      });
    }

    // MULTI OPTIONS
    if (selections.selectedMultiOptions) {
      Object.values(selections.selectedMultiOptions).forEach((group) => {
        group.forEach((opt) => {
          if (opt?.label) {
            selectedPriceOptions.push({
              title: opt.label,
              price: opt.price,
            });
          }
        });
      });
    }

    // DEFAULT PRICE OPTION
    if (selections.selectedPriceOption?.label) {
      selectedPriceOptions.push({
        title: selections.selectedPriceOption.label,

        price: selections.selectedPriceOption.price,
      });
    }

    return {
      serviceId: booking.serviceId,

      serviceName: booking.serviceName,

      selectedPriceOptions,

      selectedDate: selections.selectedDate,

      selectedSlot: selections.selectedSlot,

      totalPrice: selections.totalPrice || 0,

      workProgress: "Not Started",
      paymentStatus: "Pending",
    };
  });

  const grandTotal = services.reduce((sum, item) => sum + item.totalPrice, 0);

  const booking = await Booking.create({
    bookingId,

    customer,

    services,

    grandTotal,
  });

  return booking;
};

module.exports = {
  createBookingService,
};
