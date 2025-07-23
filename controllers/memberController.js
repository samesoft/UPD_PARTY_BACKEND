const { sequelize } = require("../config/dbConfig");
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const crypto = require("crypto");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const admin = require('firebase-admin');

exports.updateMemberProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      mobile,
      state_id,
      district_id,
      age_group_id,
      edu_level_id,
    } = req.body;

    console.log("Update request received for member:", id);
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);

    if (!id) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Validate required fields
    if (!first_name || !last_name || !email || !mobile) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch existing profile data
    const [existingData] = await sequelize.query(
      `SELECT profile_photo_url FROM members WHERE member_id = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!existingData) {
      return res.status(404).json({ error: "Member not found" });
    }

    let profilePhotoUrl = existingData.profile_photo_url;

    // Handle new profile photo upload
    if (req.file) {
      profilePhotoUrl = `/uploads/profile-photos/${req.file.filename}`;

      // Optional: Delete old profile photo from the server
      if (existingData.profile_photo_url) {
        const oldPhotoPath = path.join(
          __dirname,
          "..",
          "uploads",
          existingData.profile_photo_url
        );
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    }

    // Update Member Data
    /*

      TODO: Add a more profecient way of updating partial data

      // ,
      //  state_id = :state_id, district_id = :district_id, age_group_id = :age_group_id,
      //  edu_level_id = :edu_level_id

    */
    const [updated] = await sequelize.query(
      `UPDATE members 
       SET first_name = :first_name, last_name = :last_name, email = :email, 
           mobile = :mobile, profile_photo_url = :profile_photo_url
       WHERE member_id = :id`,
      {
        replacements: {
          first_name,
          last_name,
          email,
          mobile,
          profile_photo_url: profilePhotoUrl,
          // state_id: state_id || null,
          // district_id: district_id || null,
          // age_group_id: age_group_id || null,
          // edu_level_id: edu_level_id || null,
          id,
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    if (updated === 0) {
      return res
        .status(404)
        .json({ error: "No changes made or member not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: { profile_photo_url: profilePhotoUrl },
    });
  } catch (error) {
    console.error("Error updating member profile:", error);
    res
      .status(500)
      .json({ error: "Failed to update profile. Please try again later." });
  }
};
exports.createMember = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password_hash,
      middle_name,
      mobile,
      party_role = "", // default if missing
      memb_level_id,
      district_id,
      state_id, // new field
      age_group_id,
      edu_level_id,
      party_role_id,
      gender,
      role_id = 1, // default if missing
    } = req.body;

    console.log("body: ", req.body);

    // Basic validation (adjust as needed)
    if (!first_name || !last_name || !password_hash || !mobile) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Clean the mobile number if it starts with +252
    const cleanedPhoneNumber = mobile.startsWith("+252")
      ? mobile.slice(4)
      : mobile;

    // Check if a user with the cleaned mobile number already exists
    const existingMember = await sequelize.query(
      "SELECT * FROM members WHERE mobile = :cleanedPhoneNumber",
      {
        replacements: { cleanedPhoneNumber },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingMember.length > 0) {
      return res
        .status(400)
        .json({ error: "You're already registered, please login to continue" });
    }

    // Hash the password
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const password_hashed = await bcrypt.hash(password_hash, saltRounds);

    // Create the member
    const result = await sequelize.query(
      "SELECT create_member(:first_name, :last_name, :email, :password_hash, :middle_name, :mobile, :memb_level_id, :district_id, :state_id, :age_group_id, :edu_level_id, :party_role_id, :party_role, :gender, :role_id)",
      {
        replacements: {
          first_name,
          last_name,
          email,
          password_hash: password_hashed,
          middle_name,
          mobile: cleanedPhoneNumber, // Use the cleaned mobile number
          memb_level_id,
          district_id,
          state_id, // pass the new state_id
          age_group_id,
          edu_level_id,
          party_role_id,
          party_role,
          gender,
          role_id,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const newMemberId = result[0].member_id;
    res
      .status(201)
      .json({ message: "Member created successfully", member_id: newMemberId });
  } catch (error) {
    console.log("Error creating member:", error);
    res.status(500).json({ error: "Failed to create member" });
  }
};

// Retrieve a member by id
exports.getMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing member id" });
    }

    const result = await sequelize.query(
      "SELECT * FROM member_get_details(:id)",
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.status(200).json({ data: result[0] });
  } catch (error) {
    console.error("Error retrieving member:", error);
    res.status(500).json({ error: "Failed to retrieve member" });
  }
};

// Retrieve all members with optional pagination
exports.getAllMembers = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    let query = "SELECT * FROM members";
    let replacements = {};

    if (page && limit) {
      const offset = (page - 1) * limit;
      query += " LIMIT :limit OFFSET :offset";
      replacements = { limit, offset };
    }

    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    if (page && limit) {
      // Get total count for pagination
      const countResult = await sequelize.query(
        "SELECT COUNT(*) as total FROM members",
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const totalRecords = countResult[0].total;
      const totalPages = Math.ceil(totalRecords / limit);
      res.status(200).json({
        data: result,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
          totalRecords,
        },
      });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error("Error retrieving members:", error);
    res.status(500).json({ error: "Failed to retrieve members" });
  }
};

// Update an existing member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      password_hash,
      party_role,
      middle_name,
      mobile,
      memb_level_id,
      district_id,
      age_group_id,
      edu_level_id,
      party_role_id,
      gender,
    } = req.body;
    if (!id || !first_name || !last_name || !email || !password_hash) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    await sequelize.query(
      `UPDATE members 
       SET first_name = :first_name, last_name = :last_name, email = :email, password_hash = :password_hash, 
           party_role = :party_role, middle_name = :middle_name, mobile = :mobile, 
           memb_level_id = :memb_level_id, district_id = :district_id, age_group_id = :age_group_id, 
           edu_level_id = :edu_level_id, party_role_id = :party_role_id, gender = :gender 
       WHERE member_id = :id`,
      {
        replacements: {
          first_name,
          last_name,
          email,
          password_hash,
          party_role,
          middle_name,
          mobile,
          memb_level_id,
          district_id,
          age_group_id,
          edu_level_id,
          party_role_id,
          gender,
          id,
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );
    res.status(200).json({ message: "Member updated successfully" });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ error: "Failed to update member" });
  }
};

// Delete a member
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing member id" });
    }
    await sequelize.query("DELETE FROM members WHERE member_id = :id", {
      replacements: { id },
      type: sequelize.QueryTypes.DELETE,
    });
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.log("Error deleting member:", error);
    res.status(500).json({ error: "Failed to delete member" });
  }
};

exports.requestOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  console.log("Phone number: ", phoneNumber);

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  // Clean the phone number (remove +252 if it exists)
  const cleanedPhoneNumber = phoneNumber.startsWith("+252")
    ? phoneNumber.slice(4)
    : phoneNumber;
  console.log("Original Phone Number: ", phoneNumber);
  console.log("Cleaned Phone Number: ", cleanedPhoneNumber);

  try {
    // Check if the cleaned phone number exists in the members table
    const existingMember = await sequelize.query(
      "SELECT * FROM members WHERE mobile = :cleanedPhoneNumber",
      {
        replacements: { cleanedPhoneNumber },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingMember.length > 0) {
      return res
        .status(400)
        .json({ error: "You're already registered, please login to continue" });
    }

    // Generate OTP (6-digit random number)
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiry time (e.g., 5 minutes)
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save OTP to the database using the PostgreSQL function
    await sequelize.query(
      "SELECT member_add_otp(:mobile, :otp, :expiry_time)",
      {
        replacements: {
          mobile: cleanedPhoneNumber,
          otp: otp,
          expiry_time: expiryTime,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Send OTP to the phone number via /owners/sms
    await axios.post("https://mgs-otp.samesoft.app/api/owners/sms", {
      phoneNumber: phoneNumber,
      message: `Your verification code is: ${otp}`,
    });

    console.log("THIS IS THE OTP:", otp);
    res.status(200).json({ success: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

//const { sequelize } = require(".firebase-service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(require('../firebase-service-account.json')),
});


exports.sendNotification = async (req, res) => {
  const { device_token, title, body } = req.body;

  const message = {
    token: device_token,
    notification: {
      title: title,
      body: body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error sending message please contact 501:", error);
    res.status(500).send({ error: error.message });
  }
};
    

exports.requestOtpForReset = async (req, res) => {
  const { phoneNumber } = req.body;

  console.log("Phone number: ", phoneNumber);

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  // Clean the phone number (remove +252 if it exists)
  const cleanedPhoneNumber = phoneNumber.startsWith("+252")
    ? phoneNumber.slice(4)
    : phoneNumber;
  console.log("Original Phone Number: ", phoneNumber);
  console.log("Cleaned Phone Number: ", cleanedPhoneNumber);

  try {
    // Generate OTP (6-digit random number)
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiry time (e.g., 5 minutes)
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save OTP to the database using the PostgreSQL function
    await sequelize.query(
      "SELECT member_add_otp(:mobile, :otp, :expiry_time)",
      {
        replacements: {
          mobile: cleanedPhoneNumber,
          otp: otp,
          expiry_time: expiryTime,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Send OTP to the phone number via /owners/sms
    await axios.post("https://mgs-otp.samesoft.app/api/owners/sms", {
      phoneNumber: phoneNumber,
      message: `Your verification code is: ${otp}`,
    });

    console.log("THIS IS THE OTP:", otp);
    res.status(200).json({ success: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  console.log(req.body);
  let { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  // Remove +252 if it exists at the beginning
  const cleanedPhoneNumber = phoneNumber.startsWith("+252")
    ? phoneNumber.replace("+252", "")
    : phoneNumber;

  try {
    // Call the PostgreSQL function to fetch the OTP record
    const [results] = await sequelize.query(
      "SELECT * FROM member_get_otp(:mobile, :otp)",
      {
        replacements: {
          mobile: cleanedPhoneNumber, // Use the cleaned phone number
          otp: otp,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Check if the result is empty
    if (!results || results.length === 0) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    console.log("This is the OTP:", results);
    const { otp: storedOtp, expiry_time: expiryTime } = results;

    // Verify if OTP matches
    if (storedOtp !== otp) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    // Check if OTP is expired
    const currentTime = new Date().toISOString(); // Convert current time to UTC ISO format
    if (new Date(currentTime) > new Date(expiryTime)) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // OTP is valid
    return res.status(200).json({ success: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};

exports.loginMember = async (req, res) => {
  try {
    const { mobile, password_hash, device_token } = req.body;
    console.log(req.body);

    // Query with join: get member details and role_name from roles table.
    const [member] = await sequelize.query(
      `SELECT m.*, r.role_name 
       FROM members m 
       LEFT JOIN roles r ON m.role_id = r.role_id
       WHERE m.mobile = :mobile`,
      {
        replacements: { mobile },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // If member not found
    if (!member) {
      console.log("Member not found for mobile:", mobile);
      return res.status(404).json({ error: "Member not found" });
    }

    // Compare the entered password hash with the stored password hash
    const isPasswordValid = await bcrypt.compare(
      password_hash,
      member.password_hash
    );
    if (!isPasswordValid) {
      console.log("Invalid password attempt for member:", mobile);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update device token if provided
    if (device_token) {
      await sequelize.query(
        `UPDATE members SET device_token = :device_token WHERE member_id = :member_id`,
        {
          replacements: { device_token, member_id: member.member_id },
          type: sequelize.QueryTypes.UPDATE,
        }
      );
    }

    // Create a JWT token
    const token = jwt.sign(
      { member_id: member.member_id, role_id: member.role_id },
      process.env.TOKEN_KEY,
      { expiresIn: "2h" }
    );

    console.log(member);

    // Respond with token, member_id, role_id and the role_name from the roles table.
    res.status(200).json({
      message: "Login successful",
      token: token,
      member: member,
      member_id: member.member_id,
      role_id: member.role_id,
      state_id: member.state_id,
      role_name: member.role_name,
      district_id: member.district_id,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to log in", details: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { mobile, new_password, otp } = req.body;

    if (!mobile || !new_password || !otp) {
      return res
        .status(400)
        .json({ error: "Mobile number, new password, and OTP are required" });
    }

    // Clean the phone number by removing +252 if it exists
    const cleanedPhoneNumber = mobile.startsWith("+252")
      ? mobile.replace("+252", "")
      : mobile;

    // Verify OTP
    const [otpResults] = await sequelize.query(
      "SELECT * FROM member_get_otp(:mobile, :otp)",
      {
        replacements: { mobile: cleanedPhoneNumber, otp },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!otpResults || otpResults.length === 0) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    const { otp: storedOtp, expiry_time: expiryTime } = otpResults;

    if (storedOtp !== otp) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    const currentTime = new Date().toISOString();
    if (new Date(currentTime) > new Date(expiryTime)) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // OTP is valid, proceed with password reset
    const [existingUser] = await sequelize.query(
      `SELECT member_id FROM members WHERE mobile = :mobile`,
      {
        replacements: { mobile: cleanedPhoneNumber },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!existingUser) {
      return res
        .status(404)
        .json({ error: "Member with this phone number does not exist" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the password in the database
    await sequelize.query(
      `UPDATE members SET password_hash = :hashedPassword WHERE mobile = :mobile`,
      {
        replacements: { hashedPassword, mobile: cleanedPhoneNumber },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ error: "Failed to reset password", details: error.message });
  }
};

exports.createDonation = async (req, res) => {
  try {
    const { member_id, amount, payment_method, transaction_id } = req.body;

    // Basic validation
    if (!member_id || !amount || !payment_method || !transaction_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Call the stored function
    const result = await sequelize.query(
      "SELECT create_donation(:member_id, :amount, :payment_method, :transaction_id) AS don_id",
      {
        replacements: { member_id, amount, payment_method, transaction_id },
        type: sequelize.QueryTypes.RAW,
      }
    );

    res.status(201).json({ don_id: result[0].don_id });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ error: "Failed to create donation" });
  }
};

const initializeWaafiPay = () => {
  return require("waafipay-sdk-node").API(
    "API-1144768468AHX", //merchantUid
    "1000201", //apiUserId
    "M0910188", //apiKey
    { testMode: true } // false for production, true for testing
  );
};
exports.requestPayment = async (req, res) => {
  try {
    const { phone, amount } = req.query;

    console.log(req.query);

    // Validate required input fields
    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone number and amount are required fields.",
      });
    }
    const waafipay = initializeWaafiPay();

    waafipay.preAuthorize(
      {
        paymentMethod: "MWALLET_ACCOUNT",
        accountNo: `252${phone}`, // Ensure valid format
        amount,
        currency: "USD",
        description: "Request payment description",
      },
      async (err, result) => {
        if (err) {
          console.error("Error from WaafiPay:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to request payment.",
            details: err.message,
          });
        }
        console.log("WaafiPay response:", result);

        if (result.responseCode === "2001") {
          // Extract relevant details from the WaafiPay response
          const { referenceId, transactionId, txAmount } = result.params;

          // Prepare the phone number for SMS
          const formattedPhone = phone.startsWith("+252")
            ? phone
            : `+252${phone}`;
          const message = `Thank you for donating $${txAmount} to the Khaire party`;
          console.log("message: ", message);

          const response = await axios.post(
            "https://upd-party-backend.samesoft.app/api/members/sms",
            { phoneNumber: formattedPhone, message: message }
          );

          // console.log(response.data);

          const data_for_asm = {
            schemaVersion: "1.0",
            requestId: result.responseId,
            timestamp: "2025-01-27 Standard",
            channelName: "WEB",
            serviceName: "API_PREAUTHORIZE_COMMIT",
            serviceParams: {
              merchantUid: "M0910188",
              apiUserId: "1000201",
              apiKey: "API-1144768468AHX",
              transactionId: transactionId, // Reading from the main result
              description: "Commited",
              referenceId: referenceId, // Reading from the main result
            },
          };

          // console.log("data_for_asm: ", data_for_asm)
          try {
            // Make POST request to https://api.waafipay.net/asm
            const apiResponse = await axios.post(
              "https://api.waafipay.net/asm",
              data_for_asm,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("Response from WaafiPay ASM API:", apiResponse.data);

            // Payment request processed successfully
            return res.status(200).json({
              success: true,
              message: "Payment request processed successfully",
              waafipayResponse: result,
              // asmResponse: apiResponse.data,
            });
          } catch (apiError) {
            console.error("Error while sending data to ASM API:", apiError);
            return res.status(500).json({
              success: false,
              message:
                "Payment request processed but failed to commit the transaction.",
              details: apiError.message,
            });
          }
        }

        if (result.responseMsg.includes("Aborted")) {
          // Payment aborted by the user
          return res.status(400).json({
            success: false,
            message: "Payment request was aborted by the user.",
          });
        }

        // Payment request failed
        return res.status(400).json({
          success: false,
          message: "Payment request failed. Please try again.",
          details: result.responseMsg,
        });
      }
    );
  } catch (error) {
    console.error("Error while requesting payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      details: error.message,
    });
  }
};

exports.sendSMS = async (req, res) => {
  const username = "hiigsiiyohormar";
  const password = "NhoWuu1uabIuC16+LPgnUA==";
  const sender_id = "HIIGSIIYOHORMAR";
  const { phoneNumber, message } = req.body;

  try {
    // Get access token
    const tokenResponse = await axios.post(
      "https://smsapi.hormuud.com/Token",
      new URLSearchParams({
        grant_type: "password",
        username: username,
        password: password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      throw new Error("Failed to retrieve access token.");
    }

    // Send SMS
    const smsResponse = await axios.post(
      "https://smsapi.hormuud.com/api/sendSMS",
      {
        mobile: phoneNumber,
        message: message,
        senderid: sender_id,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("sms response: ", smsResponse.data);
    res.status(200).json({ success: "successfuly send the message" });
  } catch (error) {
    res.status(500).json("Error sending SMS:", error);
    console.error("Error sending SMS:", error);
    return { error: error.message || "Failed to send SMS" };
  }
};
