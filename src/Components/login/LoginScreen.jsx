import React, { useContext } from "react";
import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useJwt } from "react-jwt";
import "../../styles.css";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { HOSTNAME } from "../../utils";

export const LoginScreen = () => {
  console.log("LoginScreen");
  const navigate = useNavigate();
  const {
    loginState,
    setLoginState,
    alertMessage,
    setAlertMessage,
    setUserState,
    reEvaluateToken,
    setCurrentToken,
  } = useContext(AppContext);

  const handleLogin = async () => {
    setAlertMessage({ severity: "" });
    const response = await fetch(`${HOSTNAME}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: loginState.username,
        password: loginState.password,
      }),
    });
    console.log(response);
    const responseBody = await response.json();
    if (response.ok) {
      setAlertMessage({
        msg: "Login Successfulu",
        severity: "success",
      });
      // const { decodedToken, isExpired } = useJwt(responseBody.token);
      // responseBody.token
      // {
      //   isConnected: true,
      //   id: decodedToken.id,
      //   username: decodedToken.username,
      // }
      setUserState({ isLogged: true });
      // reEvaluateToken(responseBody.token);
      setCurrentToken(responseBody.token);
      localStorage.setItem("token", responseBody.token);
      navigate("/", { replace: true });
    } else {
      setAlertMessage({
        msg: responseBody.error,
        severity: "error",
      });
    }
  };

  const handleInputChange = (e) => {
    // console.log(e.target.name);
    setLoginState({ ...loginState, [e.target.name]: e.target.value });
    // console.log(e);
  };

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      direction="column"
      style={{ height: "100vh" }}
      //   sx={{ backgroundColor: "#131c21" }}
    >
      <Box
        className="login-frame"
        sx={{
          border: 1,
          borderRadius: 5,
          p: 10,
          borderColor: "#00af9c",
          zIndex: 1,
          //   backgroundColor: "#00af9c",
        }}
      >
        <Typography variant="h3" mb={2}>
          Log In
        </Typography>
        <Grid item xs={12}>
          <TextField
            label="Username"
            variant="standard"
            name="username"
            value={loginState.username}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} mt={2}>
          <TextField
            label="Password"
            name="password"
            variant="standard"
            value={loginState.password}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} mt={3}>
          <Button variant="outlined" color="primary" onClick={handleLogin}>
            Log In
          </Button>
        </Grid>
        {alertMessage.severity !== "" && (
          <Grid item xs={12} mt={5}>
            <Alert
              severity={alertMessage.severity}
              style={{ maxWidth: "220px" }}
            >
              {alertMessage.msg}
            </Alert>
          </Grid>
        )}
      </Box>
    </Grid>
  );
};
