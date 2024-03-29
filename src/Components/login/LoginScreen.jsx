import React, { useContext } from "react";
import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useJwt } from "react-jwt";
import "../../styles.scss";
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
    try {
      const response = await fetch(`${HOSTNAME}/login`, {
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
          msg: "Login Successfully",
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
        setAlertMessage({ severity: "" });
      } else {
        setAlertMessage({
          msg: responseBody.error,
          severity: "error",
        });
      }
    } catch (err) {
      setAlertMessage({
        msg: err,
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
      style={{ height: "100vh", backgroundColor: "#fafbfc" }}

      //   sx={{ backgroundColor: "#131c21" }}
    >
      <Grid
        className="login-frame"
        container
        alignItems="center"
        justifyContent="center"
        sx={{
          // border: 1,
          // borderRadius: 5,
          // p: 10,
          // borderColor: "#00af9c",
          zIndex: 1,
          width: {
            md: "40vw",
            xs: "80vw",
          },
          margin: "0 auto",
          //   backgroundColor: "#00af9c",
        }}
      >
        <Grid item xs={12} container justifyContent={"center"}>
          <Typography variant="h3" mb={2} color={"#224957"}>
            Log In
          </Typography>
        </Grid>
        <Grid item mb={5} mt={1.5} xs={12} container justifyContent={"center"}>
          <Typography variant="subtitle1" color={"#224957"}>
            Sign in and start sharing with your friends
          </Typography>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <TextField
            label="Username"
            variant="standard"
            name="username"
            value={loginState.username}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} mt={2} container justifyContent={"center"}>
          <TextField
            label="Password"
            name="password"
            variant="standard"
            value={loginState.password}
            type="password"
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} mt={3} container justifyContent={"center"}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
          >
            Log In
          </Button>
        </Grid>
        <Grid item xs={12} mt={3} container justifyContent={"center"}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              navigate("/register", { replace: true });
            }}
            fullWidth
          >
            Don't have an account? Sign Up
          </Button>
        </Grid>
        {alertMessage.severity !== "" && (
          <Grid item xs={12} mt={5}>
            <Alert
              severity={alertMessage.severity}
              // style={{ maxWidth: "220px" }}
            >
              {alertMessage.msg}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
