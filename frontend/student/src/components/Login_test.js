import React, { useState } from "react";
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./Login.css"; // Import CSS file for styling
import logo from "./logo.png";
import awsConfig from "./AwsConfig"; // Import the awsConfig file

console.log(awsConfig.backendUrl);
const poolData = awsConfig.poolData; // Extract poolData from awsConfig
console.log(poolData);
const userPool = new CognitoUserPool(poolData);

function Login({ setJwtToken }) {
  // Pass a prop to set the JWT token
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    const authenticationData = {
      Username: email,
      Password: password,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async function (session) {
        console.log("Login successful");

        // Get user attributes to determine role
        cognitoUser.getUserAttributes(async function (err, attributes) {
          if (err) {
            console.error("Error fetching user attributes:", err);
            return;
          }
          Cookies.set("jwtToken", session.getIdToken().getJwtToken());
          // Find the role attribute
          const roleAttribute = attributes.find((attr) => attr.getName() === "custom:role");
          if (roleAttribute) {
            const role = roleAttribute.getValue();
            try {
              const response = await fetch(`${awsConfig.backendUrl}/getUserId`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email }), // Include user email in the body
              });

              if (!response.ok) {
                throw new Error("Failed to get user ID.");
              }

              const responseData = await response.json(); // Parse response as JSON

              // Save the response data
              // For example, if the response contains user ID, save it in state
              const userId = responseData.userId;

              // Redirect user based on role and pass JWT token and user ID as URL parameters
              switch (role) {
                case "admin":
                  window.location.href = `http://202-admin-1339229027.us-east-1.elb.amazonaws.com/?jwtToken=${session
                    .getIdToken()
                    .getJwtToken()}&userId=${userId}!`;
                  break;
                case "professor":
                  window.location.href = `http://CMPE202-895333057.us-east-1.elb.amazonaws.com/faculty/#/dashboard?jwtToken=${session
                    .getIdToken()
                    .getJwtToken()}&userId=${userId}!`;
                  break;
                case "student":
                  navigate(`/student/dashboard?jwtToken=${session.getIdToken().getJwtToken()}&userId=${userId}!`);
                  break;
                default:
                  console.error("Unknown role:", role);
              }
            } catch (error) {
              console.error("Error getting user ID:", error);
              // Handle error if needed
            }
          } else {
            console.error("Role attribute not found");
          }
        });
      },
      onFailure: function (err) {
        console.error("Login failed", err);
        setLoginError(err.message || "An error occurred during login.");
      },
    });
  }

  return (
    <div className="login-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Canvas
          </a>
        </div>
      </nav>

      <div className="login-form-container">
        <img src={logo} alt="Your Image" />
        <h2>Login</h2>
        <div className="login-form">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          {loginError && <p>{loginError}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;
