import React, { useContext, useState } from "react";
import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useJwt } from "react-jwt";
import "../../styles.scss";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { HOSTNAME } from "../../utils";

export const RegisterScreen = () => {
  console.log("LoginScreen");
  const navigate = useNavigate();
  const [registerState, setRegisterState] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const {
    alertMessage,
    setAlertMessage,
    setUserState,
    reEvaluateToken,
    setCurrentToken,
  } = useContext(AppContext);

  const handleRegister = async () => {
    setAlertMessage({ severity: "" });
    try {
      const response = await fetch(`${HOSTNAME}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerState.username,
          name: registerState.name,
          password: registerState.password,
        }),
      });
      console.log(response);
      const responseBody = await response.json();
      if (response.ok) {
        setAlertMessage({
          msg: "User created successfully",
          severity: "success",
        });
        setTimeout(() => {
          setAlertMessage({ severity: "" });
          navigate("/login", { replace: true });
        }, 2000);
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
    setRegisterState({ ...registerState, [e.target.name]: e.target.value });
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
            lg: "40vw",
            xs: "80vw",
          },
          margin: "0 auto",
          //   backgroundColor: "#00af9c",
        }}
      >
        <Grid item xs={12} container justifyContent={"center"}>
          <Typography variant="h3" mb={2} color={"#224957"}>
            Sign Up
          </Typography>
        </Grid>
        <Grid item mb={5} mt={1.5} xs={12} container justifyContent={"center"}>
          <Typography variant="subtitle1" color={"#224957"}>
            Create your account to start meeting new people
          </Typography>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <TextField
            label="Username"
            variant="standard"
            name="username"
            value={registerState.username}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} mt={2} container justifyContent={"center"}>
          <TextField
            label="Name"
            variant="standard"
            name="name"
            value={registerState.name}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} mt={2} container justifyContent={"center"}>
          <TextField
            type={"password"}
            label="Password"
            name="password"
            variant="standard"
            value={registerState.password}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} mt={2} container justifyContent={"center"}>
          <TextField
            type={"password"}
            label="Confirm Password"
            name="confirmPassword"
            variant="standard"
            value={registerState.confirmPassword}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} mt={3} container justifyContent={"center"}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRegister}
            fullWidth
          >
            Register
          </Button>
        </Grid>
        <Grid item xs={12} mt={3} container justifyContent={"center"}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              navigate("/login", { replace: true });
            }}
            fullWidth
          >
            Already have an account? Log In
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
