const Contact = require("../../models/contact");
const sendMail = require("../../utils/sendMail");
const axios = require("axios");

const PostContactController = async (req, res) => {
  try {
    const { fullName, email, mobile, subject, course, message } = req.body;
    /* ===============================
       VALIDATION
    ============================== */
    if (!fullName || !email || !mobile || !subject || !course || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email format check
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    /* ===============================
       SAVE TO DATABASE
    ============================== */
    const newContact = new Contact({
      fullName,
      email,
      subject,
      course,
      message,
      mobile,
    });

    await newContact.save();

    await sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Contact Form Submission",
      html: `
    <h2>New Contact Request</h2>
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Mobile:</strong> ${mobile}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Course:</strong> ${course}</p>
    <p><strong>Message:</strong> ${message}</p>
    <hr/>
    <p>This message was submitted from your website contact form.</p>
  `,
    });

    await axios.post(process.env.WEB_URL, {
      fullName,
      email,
      mobile,
      subject,
      course,
      message,
    });

    /* ===============================
       RESPONSE
    ============================== */
    return res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: newContact,
    });
  } catch (err) {
    console.error("Contact Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  PostContactController,
};
