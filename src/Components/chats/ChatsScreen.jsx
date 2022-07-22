import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  ListItem,
  Avatar,
  ListItemAvatar,
  ListItemText,
  IconButton,
  List,
  Backdrop,
  CircularProgress,
  Typography,
} from "@mui/material";
import Peer from "simple-peer";

import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import CallIcon from "@mui/icons-material/Call";

import "../../styles.css";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ChatsList } from "./ChatsList";
import { ChatMessages } from "./ChatMessages";
import { deepOrange } from "@mui/material/colors";

const ENDPOINT = "http://192.168.100.47:5000";

const strToDate = (date) => {
  var dateObj = new Date(date);
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  return year + "/" + month + "/" + day;
};

const addDateToList = (messagesList, currentList) => {
  let newMessagesList = [];
  let currentDate = "";
  if (currentList) {
    for (let i = currentList.length - 1; i >= 0; i--) {
      if (currentList[i].type === "date") {
        currentDate = currentList[i].content;
        break;
      }
    }
  }
  messagesList.forEach((msg) => {
    let newDate = strToDate(msg.createdAt);
    if (currentDate !== newDate) {
      currentDate = newDate;
      newMessagesList.push({
        content: currentDate,
        type: "date",
      });
    }
    newMessagesList.push(msg);
  });
  return newMessagesList;
};
export const ChatsScreen = () => {
  let {
    setChatsListState,
    currentChatState,
    setCurrentChatState,
    socket,
    setSocket,
    refChatBox,
    userState,
    stream,
    setStream,
    otherUser,
    setOtherUser,
  } = useContext(AppContext);

  // simple-peer

  const userVideo = useRef();

  const navigate = useNavigate();

  const [isCallingActive, setIsCallingActive] = useState(false);
  /////////////////////////////

  useEffect(() => {
    if (socket) {
      console.log("Ahora si");
      console.log(socket);
      socket.emit("chats-list", 5);

      socket.on("chats-list", (chatsList) => {
        console.log(chatsList);
        console.log("Ya llego");
        setChatsListState(chatsList);
      });

      socket.on("chat-info", (chatInfo) => {
        /////
        let newMessagesList = addDateToList(chatInfo.chatMessages);
        /////
        console.log("newMessagesList", newMessagesList);
        setCurrentChatState({
          ...chatInfo,
          newMessage: "",
          chatMessages: newMessagesList,
        });
      });

      socket.on("new-message", (newMessage) => {
        setCurrentChatState((currentChatState) => {
          let newMessages = addDateToList(
            [newMessage],
            currentChatState.chatMessages
          );
          // console.log("FROM STATE", currentChatState);
          return {
            ...currentChatState,
            chatMessages: [...currentChatState.chatMessages, ...newMessages],
          };
        });

        console.log(currentChatState);
        console.log("MENSAJE RECIBIDO");
        socket.emit("chats-list", 5);
      });
    }
  }, [socket]);

  useEffect(() => {
    // Scroll to the bottom of the screen every time a new chat is loaded
    refChatBox.current.scrollTop = refChatBox.current.scrollHeight;
    // console.log(refChatBox.current.scrollTop);
  }, [currentChatState]);

  const handleSendMessage = (e) => {
    if (currentChatState.newMessage === "") return;
    console.log(currentChatState.newMessage);
    socket.emit("send-message", {
      content: currentChatState.newMessage,
      senderId: userState.id,
      chatId: currentChatState.id,
    });
    setCurrentChatState({
      ...currentChatState,
      newMessage: "",
    });
  };

  const handleStartCall = async () => {
    console.log("STARTING CALL ");
    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log(stream);
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }

      setIsCallingActive(true);

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });

      peer.on("signal", (data) => {
        socket.emit("callUser", {
          chatId: currentChatState.id,
          signalData: data,
          from: userState,
        });
      });

      peer.on("stream", (partnerStream) => {
        // if (partnerVideo.current) {
        //   partnerVideo.current.srcObject = stream;
        // }
        setOtherUser({
          ...otherUser,
          stream: partnerStream,
        });
        console.log("SETTING OTHER USER STREAM");
        console.log("stream", stream, "otro stream", partnerStream);
        console.log("-----------------> stream");
        setIsCallingActive(false);
        navigate("/video-call");
      });

      socket.on("callAccepted", (signal) => {
        // setCallAccepted(true);
        peer.signal(signal);
        console.log("LLAMADA ACEPTADA");
        console.log("-----------------> callAccepted");
      });
    } catch (err) {
      alert(err);
    }

    // go to /video-call/:chatId
    // navigate(`/video-call/`);
  };

  return (
    <Grid
      container
      alignItems="center"
      direction="column"
      style={{ width: "100vw", maxWidth: "90vw", paddingTop: "2vh" }}
    >
      <Grid container direction="row">
        <Grid item xs={3}>
          <ChatsList />
        </Grid>
        <Grid item xs={9} container direction="column">
          <Box
            xs={3}
            sx={{
              // width: 300,
              // height: 300,
              backgroundColor: "primary.dark",
              color: "white",
              // '&:hover': {
              //   backgroundColor: 'primary.main',
              //   opacity: [0.9, 0.8, 0.7],
            }}
          >
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: deepOrange[500] }}>
                    {currentChatState.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>{currentChatState.name}</ListItemText>
                <IconButton
                  // edge="end"
                  aria-label="delete"
                  sx={{ color: "white" }}
                  mr={5}
                  onClick={handleStartCall}
                >
                  <CallIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  sx={{ color: "white" }}
                >
                  <ImageSearchIcon />
                </IconButton>
              </ListItem>
            </List>
            {/* Usuario actual: {`${userState.username} - ${userState.id}`}. Nombre
            del chat {currentChatState.name} */}
          </Box>
          <Box xs={9}>
            <ChatMessages />
            <Grid container sx={{ paddingTop: 2 }}>
              <Grid item xs={9}>
                <TextField
                  label="Write a message"
                  variant="filled"
                  multiline
                  fullWidth
                  value={currentChatState.newMessage}
                  onChange={(e) =>
                    setCurrentChatState({
                      ...currentChatState,
                      newMessage: e.target.value,
                    })
                  }
                  onKeyPress={(e) => {
                    if (e.which === 13 && !e.shiftKey) {
                      e.preventDefault();
                      // console.log("Envie");
                      handleSendMessage(e);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  variant={
                    currentChatState.newMessage !== "" ? "outlined" : "disabled"
                  }
                  color="primary"
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Backdrop
        sx={{ color: "#fff", zIndex: 5 }}
        // open={open}
        open={isCallingActive}
        // onClick={handleClose}
      >
        <Grid
          container
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection="column"
        >
          <Grid item>
            <CircularProgress color="inherit" />
          </Grid>
          <Grid item mt={5}>
            <Typography variant="h6" color="inherit">
              Trying to call {currentChatState.name}
            </Typography>
          </Grid>
        </Grid>
      </Backdrop>
    </Grid>
  );
};
