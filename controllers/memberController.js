const { sequelize } = require('../config/dbConfig');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const crypto = require('crypto');
const axios = require('axios');
const jwt = require('jsonwebtoken');



// Create a new member using the stored procedure "member_create"
// exports.createMember = async (req, res) => {
//   try {
//     const {
//       first_name,
//       last_name,
//       email,
//       password_hash,
//       middle_name,
//       mobile,
//       memb_level_id,
//       district_id,
//       age_group_id,
//       edu_level_id,
//       party_role_id,
//       gender,
//     } = req.body;
//     console.log("body: ", req.body);

//     // Basic validation (adjust as needed)
//     if (!first_name || !last_name || !email || !password_hash) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const saltRounds = 10; // Number of salt rounds for bcrypt
//     const password_hashed = await bcrypt.hash(password_hash, saltRounds);
//     // Call the stored procedure to create a new member.
//     // If you are not using a stored procedure, you can insert directly into the table.
//     const result = await sequelize.query(
//       'CALL member_create(:p_first_name, :p_last_name, :p_email, :p_password_hash, :p_middle_name, :p_mobile, :p_memb_level_id, :p_district_id, :p_age_group_id, :p_edu_level_id, :p_party_role_id, :p_gender)',
//       {
//         replacements: {
//           p_first_name: first_name,
//           p_last_name: last_name,
//           p_email: email,
//           p_password_hash: password_hashed,
//           p_middle_name: middle_name,
//           p_mobile: mobile,
//           p_memb_level_id: memb_level_id,
//           p_district_id: district_id,
//           p_age_group_id: age_group_id,
//           p_edu_level_id: edu_level_id,
//           p_party_role_id: party_role_id,
//           p_gender: gender,
//         },
//         // Using SELECT since the stored procedure returns a result set.
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     // result is an array containing the inserted row.
//     res.status(201).json(result[0]);
//   } catch (error) {
//     console.error('Error creating member:', error);
//     res.status(500).json({ error: 'Failed to create member' });
//   }
// };

exports.createMember = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password_hash,
      middle_name,
      mobile,
      party_role,
      memb_level_id,
      district_id,
      age_group_id,
      edu_level_id,
      party_role_id,
      gender,
      role_id
    } = req.body;
    console.log("body: ", req.body);

    // Basic validation (adjust as needed)
    if (!first_name || !last_name || !email || !password_hash || !role_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const saltRounds = 10; // Number of salt rounds for bcrypt
    const password_hashed = await bcrypt.hash(password_hash, saltRounds);

    // Use SELECT instead of CALL to match the function usage in addMember
    const result = await sequelize.query(
      'SELECT create_member(:first_name, :last_name, :email, :password_hash, :middle_name, :mobile, :memb_level_id, :district_id, :age_group_id, :edu_level_id, :party_role_id, :party_role, :gender, :role_id)',
      {
        replacements: {
          first_name,
          last_name,
          email,
          password_hash: password_hashed,
          middle_name,
          mobile,
          memb_level_id,
          district_id,
          age_group_id,
          edu_level_id,
          party_role_id,
          party_role,
          gender,
          role_id
        },
        type: sequelize.QueryTypes.SELECT, // Use SELECT to match function usage
      }
    );
    const newMemberId = result[0].member_id;

    // Return the first result (if any)
    res.status(201).json({ message: 'Member created successfully', member_id: newMemberId });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
};


// Retrieve a member by id
exports.getMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Missing member id' });
    }
    const result = await sequelize.query('SELECT * FROM members WHERE member_id = :id', {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT,
    });
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error retrieving member:', error);
    res.status(500).json({ error: 'Failed to retrieve member' });
  }
};

// Retrieve all members with optional pagination
exports.getAllMembers = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    let query = 'SELECT * FROM members';
    let replacements = {};

    if (page && limit) {
      const offset = (page - 1) * limit;
      query += ' LIMIT :limit OFFSET :offset';
      replacements = { limit, offset };
    }

    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    if (page && limit) {
      // Get total count for pagination
      const countResult = await sequelize.query('SELECT COUNT(*) as total FROM members', {
        type: sequelize.QueryTypes.SELECT,
      });
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
    console.error('Error retrieving members:', error);
    res.status(500).json({ error: 'Failed to retrieve members' });
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
      return res.status(400).json({ error: 'Missing required fields' });
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
    res.status(200).json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
};

// Delete a member
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Missing member id' });
    }
    await sequelize.query('DELETE FROM members WHERE member_id = :id', {
      replacements: { id },
      type: sequelize.QueryTypes.DELETE,
    });
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
};

exports.requestOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  console.log("Phone number: ", phoneNumber);

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const cleanedPhoneNumber = phoneNumber.startsWith('+252') ? phoneNumber.slice(4) : phoneNumber;
  console.log("Original Phone Number: ", phoneNumber);
  console.log("Cleaned Phone Number: ", cleanedPhoneNumber);

  try {
    // Generate OTP (6-digit random number)
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiry time (e.g., 5 minutes)
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save OTP to the database using the PostgreSQL function
    await sequelize.query(
      'SELECT member_add_otp(:mobile, :otp, :expiry_time)',
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
    await axios.post(
      'https://mgs-backend-api.samesoft.app/api/owners/sms',
      { phoneNumber: phoneNumber, message: `Your OTP is ${otp}` }
    );
    console.log("THIS IS THE OYP:", otp);
    res.status(200).json({ success: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {

  console.log(req.body);
  const { phoneNumber, otp } = req.body;



  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  try {
    // Call the PostgreSQL function to fetch the OTP record
    const [results] = await sequelize.query(
      'SELECT * FROM member_get_otp(:mobile, :otp)',
      {
        replacements: {
          mobile: phoneNumber,
          otp: otp,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    

    // Check if the result is empty
    if (!results || results.length === 0) {
      return res.status(400).json({ error: 'Incorrect OTP' });
    }
   console.log("This is the otp",results);
    const { otp: storedOtp, expiry_time: expiryTime } = results;

    // Verify if OTP matches
    if (storedOtp !== otp) {
      return res.status(400).json({ error: 'Incorrect OTP' });
    }

    // Check if OTP is expired
    const currentTime = new Date();
    if (currentTime > new Date(expiryTime)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // OTP is valid
    return res.status(200).json({ success: 'OTP verified successfully' });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

exports.loginMember = async (req, res) => {
  try {
    console.log(req.body);
    const { mobile, password_hash } = req.body;
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
      console.log('Member not found for mobile:', mobile);
      return res.status(404).json({ error: 'Member not found' });
    }

    // Compare the entered password hash with the stored password hash
    const isPasswordValid = await bcrypt.compare(password_hash, member.password_hash);
    if (!isPasswordValid) {
      console.log('Invalid password attempt for member:', mobile);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create a JWT token (optionally add member info as payload)
    const token = jwt.sign(
      { member_id: member.member_id, role_id: member.role_id },
      process.env.TOKEN_KEY,
      { expiresIn: '2h' }
    );

    // Respond with token, member_id, role_id and the role_name from the roles table.
    res.status(200).json({
      message: 'Login successful',
      token: token,
      member_id: member.member_id,
      role_id: member.role_id,
      role_name: member.role_name,
      district_id: member.district_id
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
};


exports.createDonation = async (req, res) => {
  try {
    const { member_id, amount, payment_method, transaction_id } = req.body;

    // Basic validation
    if (!member_id || !amount || !payment_method || !transaction_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call the stored function
    const result = await sequelize.query(
      'SELECT create_donation(:member_id, :amount, :payment_method, :transaction_id) AS don_id',
      {
        replacements: { member_id, amount, payment_method, transaction_id },
        type: sequelize.QueryTypes.RAW,
      }
    );

    res.status(201).json({ don_id: result[0].don_id });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
};


const initializeWaafiPay = () => {
  return require('waafipay-sdk-node').API(
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
        message: 'Phone number and amount are required fields.',
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
          console.error('Error from WaafiPay:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to request payment.',
            details: err.message,
          });
        }
        console.log('WaafiPay response:', result);


        if (result.responseCode === "2001") {

          // Extract relevant details from the WaafiPay response
          const { referenceId, transactionId, txAmount } = result.params;

          // Prepare the phone number for SMS
          const formattedPhone = phone.startsWith('+252') ? phone : `+252${phone}`;
          const message = `Thank you for donating $${txAmount} to the upd party`
          console.log("message: ", message);


          const response = await axios.post(
            'http://upd-party-backend.samesoft.app/api/members/sms',
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
              'https://api.waafipay.net/asm',
              data_for_asm,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            console.log('Response from WaafiPay ASM API:', apiResponse.data);

            // Payment request processed successfully
            return res.status(200).json({
              success: true,
              message: 'Payment request processed successfully',
              waafipayResponse: result,
              // asmResponse: apiResponse.data,
            });
          } catch (apiError) {
            console.error('Error while sending data to ASM API:', apiError);
            return res.status(500).json({
              success: false,
              message: 'Payment request processed but failed to commit the transaction.',
              details: apiError.message,
            });
          }
        }

        if (result.responseMsg.includes("Aborted")) {
          // Payment aborted by the user
          return res.status(400).json({
            success: false,
            message: 'Payment request was aborted by the user.',
          });
        }

        // Payment request failed
        return res.status(400).json({
          success: false,
          message: 'Payment request failed. Please try again.',
          details: result.responseMsg,
        });
      }
    );
  } catch (error) {
    console.error('Error while requesting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      details: error.message,
    });
  }
};

exports.sendSMS = async (req, res) => {
  const username = "MOF2024";
  const password = "2QSzn638r3ubcu7bHo0Zmg==";
  const sender_id = "WMaaliyadda";
  const { phoneNumber, message } = req.body;

  try {
    // Get access token
    const tokenResponse = await axios.post(
      'https://smsapi.hormuud.com/Token',
      new URLSearchParams({
        grant_type: 'password',
        username: username,
        password: password
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      throw new Error('Failed to retrieve access token.');
    }

    // Send SMS
    const smsResponse = await axios.post(
      'https://smsapi.hormuud.com/api/sendSMS',
      {
        mobile: phoneNumber,
        message: message,
        senderid: sender_id,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("sms response: ", smsResponse.data);
    res.status(200).json({ success: 'successfuly send the message' });

  } catch (error) {
    res.status(500).json('Error sending SMS:', error);
    console.error('Error sending SMS:', error);
    return { error: error.message || 'Failed to send SMS' };
  }
}
