// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (using Twilio)
export const sendOTP = async (phone, otp) => {
  // In a real implementation, you would use Twilio or another SMS service
  // For demo purposes, we'll just log the OTP
  console.log(`OTP for ${phone}: ${otp}`);
  
  // In production, you would use something like:
  /*
  const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  await twilio.messages.create({
    body: `Your InfraDealer OTP is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
  */
  
  return true;
};
