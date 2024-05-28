import React, { useState } from "react";
import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import "./SignupCss.css"; // Import CSS file for styling
import logo from "./logo.png"; // Assuming you have a logo image
import awsConfig from "./AwsConfig"; // Import the awsConfig file

console.log(awsConfig.backendUrl);
const poolData = awsConfig.poolData; // Extract poolData from awsConfig
console.log(poolData);
const userPool = new CognitoUserPool(poolData);

function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  async function signUp() {
    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "given_name", Value: firstName }), // First Name
      new CognitoUserAttribute({ Name: "family_name", Value: lastName }), // Last Name
      new CognitoUserAttribute({ Name: "custom:role", Value: selectedRole }),
    ];

    try {
      const result = await new Promise((resolve, reject) => {
        userPool.signUp(email, password, attributeList, null, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });

      setIsSignUpSuccess(true);

      // Handle successful response if needed
    } catch (error) {
      console.error("Error signing up or storing user details:", error);
      setSignUpError(error.message || "An error occurred during sign-up.");
    }
  }

  async function confirmSignUp() {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(verificationCode, true, async (err, result) => {
      if (err) {
        setVerificationError(err.message || "An error occurred during verification.");
        return;
      }

      try {
        // User signed up successfully, send user details to backend
        const user = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password, // Using the password entered by the user
          roleID: selectedRole, // Using the selected role from the form
        };

        const response = await fetch(`${awsConfig.backendUrl}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });

        if (!response.ok) {
          throw new Error("Failed to store user details in the database.");
        }
      } catch (err) {
        console.log("Error");
      }

      navigate("/login");
    });
  }

  return (
    <div className="signup-container">
      <img src={logo} alt="Your Logo" className="logo" />
      <div className="signup-form-container">
        <h2>Sign Up</h2>
        {!isSignUpSuccess ? (
          <div className="signup-form">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="">Select Role</option>
              <option value="professor">Professor</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={signUp}>Sign Up</button>
            {signUpError && <p className="error">{signUpError}</p>}
          </div>
        ) : (
          <div className="verification-form">
            <h3>Verification Code</h3>
            <input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button onClick={confirmSignUp}>Verify</button>
            {verificationError && <p className="error">{verificationError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default SignUpForm;
