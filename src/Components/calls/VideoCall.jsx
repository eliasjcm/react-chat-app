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
import SwitchCameraIcon from "@mui/icons-material/SwitchCamera";
export const VideoCall = () => {
  const [uiState, setUiState] = useState("loading");
  const {
    otherUser,
    stream,
    callState,
    setCallState,
    socket,
    userState,
    otherUserStream,
    setOtherUser,
  } = useContext(AppContext);
  const unfocusVideo = useRef();
  const focusVideo = useRef();
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

        console.log("myVideo", unfocusVideo);
        unfocusVideo.current.srcObject = stream;
        console.log("partnerVideo", focusVideo);
        focusVideo.current.srcObject = otherUserStream;
        setUiState("loaded");
      }
    } else {
      setOtherUser({ name: "Other", username: "otherXX" });
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

  const handleChangeFocus = () => {
    let focusSrcObject = focusVideo.current.srcObject;
    let unfocusSrcObject = unfocusVideo.current.srcObject;
    focusVideo.current.srcObject = unfocusSrcObject;
    unfocusVideo.current.srcObject = focusSrcObject;
    setCallState({
      ...callState,
      otherUser: { ...callState.user, focused: !callState.otherUser.focused },
    });
  };

  console.log(
    "INSIDE VIDEO CALL",
    " STREAM: ",
    stream,
    " OTHER USER STREAM: ",
    otherUserStream
  );
  return (
    <>
      {(!stream || !otherUserStream) && !CALL_DEVELOPMENT ? (
        <Navigate to="/" />
      ) : (
        <Box
          position={"relative"}
          overflow={"hidden"}
          sx={{
            "@media (min-width:600px)": {
              height: "calc(100vh - 64px)",
            },
            "@media (min-width:0px)": {
              height: "calc(100vh - 56px)",
            },
            "@media (min-width:0px) and (orientation: landscape)": {
              height: "calc(100vh - 64px)",
            },
          }}
        >
          <Grid
            className="focus-video-container"
            container
            justifyContent={"center"}
            alignContent={"center"}
            sx={(theme) => {
              console.log("***********", theme.mixins.toolbar);
              return {
                height: "100%",
                width: "100%",
                backgroundColor: "black",
              };
            }}
            position={"relative"}
          >
            <video
              style={{
                width: "inherit",
                height: "inherit",
                objectFit: "contain",
              }}
              autoPlay
              playsInline
              ref={focusVideo}
              muted
            >
              <source
                src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                type="video/mp4"
              />
            </video>
            {uiState === "loaded" && (
              <Box
                sx={{
                  backgroundColor: "rgba(200,200,200,0.4)",
                  padding: "10px 20px",
                  borderRadius: "10px",
                }}
                position="absolute"
                bottom={10}
                left={15}
              >
                <Typography sx={{ color: "white" }} fontSize={15}>
                  {callState.otherUser.focused
                    ? otherUser?.username || "Partner"
                    : "You"}
                </Typography>
              </Box>
            )}
            <Grid
              className="unfocus-video-container"
              // unfocusedVideo
              container
              item
              // xs={6}

              justifyContent={"center"}
              alignContent={"center"}
              flexDirection={"column"}
              position="absolute"
              top={70}
              right={50}
              sx={{
                width: "initial",
                border: "1px solid #fff",
                borderRadius: "10px",
                width: "max-content",
                height: "max-content",
                overflow: "hidden",

                // ":hover": {opacity: 0.5, cursor: "pointer"}
              }}
              // display="block"
              // borderRadius={20}
            >
              <Box
                onClick={handleChangeFocus}
                position="absolute"
                sx={{
                  // backgroundColor: "rgba(0,0,0,0.0)",
                  width: "100%",
                  height: "100%",
                  zIndex: "100",
                  opacity: "0",
                  display: "block",
                  bgcolor: "rgba(0,0,0,0.5)",

                  // borderRadius: "10px",
                  height: "100%",

                  ":hover": {
                    opacity: "1",
                    cursor: "pointer",
                    transition: "all .5s ease",
                  },
                }}
              >
                <Grid
                  container
                  justifyContent={"center"}
                  alignContent={"center"}
                  flexDirection={"column"}
                  sx={{ height: "100%" }}
                >
                  <IconButton>
                    <SwitchCameraIcon
                      sx={{ color: "white", width: "50px", height: "50px" }}
                    />
                  </IconButton>
                  <Typography color="white" fontSize={20}>
                    Click to focus
                  </Typography>
                </Grid>
              </Box>
              {uiState === "loaded" && (
                <Box
                  sx={{
                    backgroundColor: "rgba(200,200,200,0.4)",
                    padding: "10px 20px",
                    borderRadius: "10px",
                  }}
                  position="absolute"
                  bottom={10}
                  left={15}
                >
                  <Typography sx={{ color: "white" }} fontSize={15}>
                    {!callState.otherUser.focused
                      ? otherUser?.username || "Partner"
                      : "You"}
                  </Typography>
                </Box>
              )}
              <video
                style={{
                  width: "inherit",
                  height: "inherit",
                  objectFit: "cover",
                  maxWidth: "252px",
                  maxHeight: "278px",
                  // borderRadius: "10px",
                }}
                autoPlay
                playsInline
                ref={unfocusVideo}
              >
                <source
                  src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  type="video/mp4"
                />
              </video>
            </Grid>
            {uiState === "loading" ? (
              <Box sx={{ width: "80%", margin: "0 auto" }}>
                {/* <LinearProgress /> */}
              </Box>
            ) : (
              <Grid
                container
                justifyContent={"center"}
                columnGap={1.5}
                position="absolute"
                bottom={20}
              >
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
        </Box>
      )}
    </>
  );
};
