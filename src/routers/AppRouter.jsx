import React, { useContext, useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Toolbar,
  Typography,
  Button,
  DialogActions,
  Dialog,
  Backdrop,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import Peer from "simple-peer";

import { ChatsScreen } from "../Components/chats/ChatsScreen";
import { FriendsScreen } from "../Components/friends/FriendsScreen";
import { MainScreen } from "../Components/ui/MainScreen";

import { AppContext } from "../context/AppContext";
import { deepOrange } from "@mui/material/colors";
import { Profile } from "../Components/users/Profile";
import { VideoCall } from "../Components/calls/VideoCall";
import socketIOClient from "socket.io-client";
import { HOSTNAME } from "../utils";
import { closeCallStream } from "../helpers/calls";

export const AppRouter = () => {
  const {
    userState,
    setSocket,
    socket,
    otherUser,
    setOtherUser,
    stream,
    setStream,
    callState,
    setCallState,
    setOtherUserStream,
  } = useContext(AppContext);
  const [newCallReceived, setNewCallReceived] = useState(false);

  const [callClosed, setCallClosed] = useState(false);

  const [callExpired, setCallExpired] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    // console.log(location.pathname);
    console.log("Connecting socket");
    let newSocket = socketIOClient(HOSTNAME, {
      query: { token: localStorage.getItem("token") },
    });

    // console.log(refChatBox.current);

    // socket.on("connect_error", () => {
    //   // navigate("/login");
    //   console.log("Hubo un error");
    // });

    newSocket.on("newCallReceived", async (data) => {
      setOtherUser(data.from);
      setNewCallReceived(true);

      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log(stream);
      setStream(stream);
    });

    newSocket.on("callClosed", () => {
      console.log("CLOSING CURRENT CALL");
      navigate("/");
      setCallState(null);
      try {
        closeCallStream(stream);
      } catch (err) {
        console.log(err);
      }
      console.log("NULLING CALL STATE");
      setCallClosed(true);
      setOtherUserStream(null);
      setStream(null);
    });

    newSocket.on("callExpired", ({ from, to }) => {
      setNewCallReceived(false);
      console.log("CALL EXPIRED");
      setCallState(null);
      try {
        closeCallStream(stream);
      } catch (err) {
        console.log(err);
      }
      console.log("NULLING CALL STATE");
      setCallClosed(false);
      setOtherUserStream(null);
      setStream(null);
      setCallExpired(true);
      setOtherUser(from);
    });

    setSocket(newSocket);
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // const handleClickOpen = () => {
  //   setNewCallReceived(true);
  // };

  const handleClose = () => {
    setNewCallReceived(false);
    setCallClosed(false);
  };

  const handleDeclineCall = () => {
    setNewCallReceived(false);
    setCallClosed(false);
    socket.emit("declineCall", { to: otherUser, from: userState });
  };

  const handleCloseExpiredCall = () => {
    setOtherUser(null);
    setCallExpired(false);
  };

  const acceptCall = () => {
    console.log("ACCEPT CALL IN APPROUTER");
    // setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("acceptCall", { signal: data, to: otherUser });
      console.log("-----------------> signal");
      navigate("/video-call");
    });

    peer.on("stream", (stream) => {
      setOtherUser({ ...otherUser });
      setOtherUserStream(stream);
      console.log("-----------------> stream");
      // partnerVideo.current.srcObject = stream;
    });

    peer.signal(otherUser.signalData);
    setNewCallReceived(false);
    console.log("-----------------> PEER.SIGNAL");
    // console.log("stream", stream, "otro stream", otherUser.stream);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Link style={{ marginRight: "20px" }} to="/">
              <Typography
                variant="h6"
                noWrap
                component="div"
                // sx={{
                //   mr: 2,
                //   display: { xs: "none", md: "flex" },
                // }}
              >
                ChatApp
              </Typography>
            </Link>
            {/* <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton> */}
            <Link to="/friends">
              <Typography variant="h6" component="div">
                Friends
              </Typography>
            </Link>
            <Link to="/chats">
              <Typography variant="h6" component="div" sx={{ marginLeft: 2 }}>
                Chats
              </Typography>
            </Link>
            {!location.pathname.startsWith("/video-call") && !!callState && (
              <Link
                to="/video-call"
                style={{ marginLeft: "auto", marginRight: "10px" }}
              >
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  sx={{
                    backgroundColor: "primary.dark",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    //   border: "1px solid black",
                  }}
                >
                  <Typography>Call in progress, click to come back.</Typography>
                </Box>
              </Link>
            )}
            <Link
              to="/myProfile"
              style={{ marginLeft: "auto", marginRight: "10px" }}
            >
              <Box
                display={"flex"}
                alignItems={"center"}
                sx={{
                  backgroundColor: "primary.dark",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  //   border: "1px solid black",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: deepOrange[500],
                    width: "30px",
                    height: "30px",
                  }}
                >
                  {userState?.username && userState.username[0]}
                </Avatar>
                <Typography sx={{ marginLeft: 1 }}>
                  @{userState.username}
                </Typography>{" "}
              </Box>
            </Link>
            <Button
              color="inherit"
              //   sx={{ marginLeft: "auto" }}
              // onClick={() => {
              //   setUserState({
              //     isConnected: false,
              //     id: undefined,
              //     username: undefined,
              //   });
              //   // <navigate("/login")>;
              // }}
            >
              LOGOUT
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Routes>
        <Route path="/chats" element={<ChatsScreen />} />
        <Route path="/friends" element={<FriendsScreen />} />
        {/* <Route path="/" element={<MainScreen />} /> */}
        <Route path="/myProfile" element={<MainScreen />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/video-call" element={<VideoCall />} />
        <Route path="*" element={<FriendsScreen />} />
      </Routes>
      <Backdrop
        sx={{ color: "#fff", zIndex: 5 }}
        // open={open}
        open={newCallReceived}
        // onClick={handleClose}
      >
        <Dialog
          open={newCallReceived}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {`${otherUser?.username}'s is calling you`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Do you want to answer the call?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeclineCall}>Decline</Button>
            <Button onClick={acceptCall} autoFocus>
              Answer
            </Button>
          </DialogActions>
        </Dialog>
      </Backdrop>
      <Backdrop
        sx={{ color: "#fff", zIndex: 5 }}
        // open={open}
        open={callClosed}
        // onClick={handleClose}
      >
        <Dialog
          open={callClosed}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Call in progress finished
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Backdrop>
      {/* with */}

      <Backdrop
        sx={{ color: "#fff", zIndex: 5 }}
        // open={open}
        open={callExpired && !!otherUser && otherUser?.username}
        // onClick={handleClose}
      >
        {otherUser?.username && (
          <Dialog
            open={callExpired && !!otherUser && otherUser?.username}
            onClose={handleCloseExpiredCall}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              You have a missing call from {otherUser?.username}
            </DialogTitle>
            <DialogActions>
              <Button onClick={handleCloseExpiredCall}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </Backdrop>
    </>
  );
};
