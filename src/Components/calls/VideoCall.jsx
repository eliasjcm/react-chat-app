import {
  Grid,
  Typography,
  IconButton,
  Box,
  LinearProgress,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { red } from "@mui/material/colors";
import { Navigate } from "react-router-dom";
import { CALL_DEVELOPMENT } from "../../utils";
export const VideoCall = () => {
  const [uiState, setUiState] = useState("loading");
  const { otherUser, stream, callState, setCallState, socket, userState, otherUserStream } =
    useContext(AppContext);
  const myVideo = useRef();
  const partnerVideo = useRef();
  useEffect(() => {
    if (!CALL_DEVELOPMENT) {
      if (stream && otherUserStream) {
        if (!callState) {
          setCallState({
            user: {
              audio: true,
              video: true,
              screenShare: false,
            },
            otherUser: {
              audio: true,
              video: true,
              screenShare: false,
              focused: true,
            },
          });
        }

        console.log("myVideo", myVideo);
        myVideo.current.srcObject = stream;
        console.log("partnerVideo", partnerVideo);
        partnerVideo.current.srcObject = otherUserStream;
        setUiState("loaded");
      }
    } else {
      setCallState({
        user: {
          audio: true,
          video: true,
          screenShare: false,
        },
        otherUser: {
          audio: false,
          video: true,
          screenShare: false,
          focused: true,
        },
      });
      setUiState("loaded");
    }
  }, []);

  const toggleAudio = () => {
    if (stream != null && stream.getAudioTracks().length > 0) {
      stream.getAudioTracks()[0].enabled = !callState.user.audio;
      setCallState({
        ...callState,
        user: { ...callState.user, audio: !callState.user.audio },
      });
    }
  };

  const toggleCamera = () => {
    if (stream != null && stream.getVideoTracks().length > 0) {
      stream.getVideoTracks()[0].enabled = !callState.user.video;
      setCallState({
        ...callState,
        user: { ...callState.user, video: !callState.user.video },
      });
    }
  };

  const handleCloseCall = () => {
    console.log("from ", userState, "to ", otherUser);
    socket.emit("closeCall", { from: userState, to: otherUser });
  };

  return (
    <>
      {(!stream || !otherUserStream) && !CALL_DEVELOPMENT ? (
        <Navigate to="/" />
      ) : (
        <div>
          <Grid
            container
            justifyContent={"center"}
            alignContent={"center"}
            sx={{ marginTop: 15 }}
          >
            <Grid
              container
              item
              xs={6}
              justifyContent={"center"}
              alignContent={"center"}
              flexDirection={"column"}
            >
              <Grid item>
                <Typography width="100%" sx={{ textAlign: "center" }}>
                  Your camera
                </Typography>
              </Grid>
              <Grid item sx={{ width: "35vw", height: "40vh" }}>
                <video
                  style={{
                    width: "inherit",
                    height: "inherit",
                    objectFit: "cover",
                  }}
                  autoPlay
                  playsInline
                  ref={myVideo}
                  muted
                >
                  <source
                    src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    type="video/mp4"
                  />
                </video>
              </Grid>
            </Grid>
            <Grid
              container
              item
              xs={6}
              justifyContent={"center"}
              alignContent={"center"}
              flexDirection={"column"}
            >
              <Grid item>
                <Typography width="100%" sx={{ textAlign: "center" }}>
                  {otherUser?.username || "Partner"}'s camera
                </Typography>
              </Grid>
              <Grid item sx={{ width: "35vw", height: "40vh" }}>
                <video
                  style={{
                    width: "inherit",
                    height: "inherit",
                    objectFit: "cover",
                  }}
                  autoPlay
                  playsInline
                  ref={partnerVideo}
                >
                  <source
                    src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    type="video/mp4"
                  />
                </video>
              </Grid>
            </Grid>
            {uiState === "loading" ? (
              <Box sx={{ width: "80%", margin: "0 auto" }}>
                <LinearProgress />
              </Box>
            ) : (
              <Grid container justifyContent={"center"} columnGap={1.5}>
                <Grid item>
                  <IconButton
                    // edge="end"
                    aria-label="delete"
                    sx={{
                      backgroundColor: "primary.main",
                      ":hover": {
                        backgroundColor: "primary.dark",
                        // opacity:0.5,
                      },
                    }}
                    mr={5}
                    onClick={toggleAudio}
                    // onClick={handleStartCall}
                  >
                    {callState.user.audio ? (
                      <MicIcon
                        sx={{
                          color: "white",
                          // ":hover": {
                          //   color: "primary.main"
                          // }
                        }}
                      />
                    ) : (
                      <MicOffIcon
                        sx={{
                          color: "white",
                          // ":hover": {
                          //   color: "primary.main"
                          // }
                        }}
                      />
                    )}
                  </IconButton>
                </Grid>

                <Grid item>
                  <IconButton
                    // edge="end"
                    aria-label="delete"
                    sx={{
                      backgroundColor: red[600],
                      ":hover": {
                        backgroundColor: red[700],
                        // opacity:0.5,
                      },
                    }}
                    mr={5}
                    onClick={handleCloseCall}
                    // onClick={handleStartCall}
                  >
                    <CallEndIcon
                      sx={{
                        color: "white",
                        // ":hover": {
                        //   color: "primary.main"
                        // }
                      }}
                    />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    // edge="end"
                    aria-label="delete"
                    sx={{
                      backgroundColor: "primary.main",
                      ":hover": {
                        backgroundColor: "primary.dark",
                        // opacity:0.5,
                      },
                    }}
                    mr={5}
                    onClick={toggleCamera}
                    // onClick={handleStartCall}
                  >
                    {callState.user.video ? (
                      <VideocamIcon
                        sx={{
                          color: "white",
                          // ":hover": {
                          //   color: "primary.main"
                          // }
                        }}
                      />
                    ) : (
                      <VideocamOffIcon
                        sx={{
                          color: "white",
                          // ":hover": {
                          //   color: "primary.main"
                          // }
                        }}
                      />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
            )}
          </Grid>
        </div>
      )}
    </>
  );
};
