import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Grid,
  Backdrop,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";

import "../../styles.scss";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import { ChatsListSection } from "./ChatsListSection";

import { ChatsMessagesSection } from "./ChatsMessagesSection";

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
    refChatBox,
    setUiState,
  } = useContext(AppContext);

  // simple-peer

  const handleCloseNotAnswered = () => {
    setIsCallingActive(false);
    setCallStatus("NONE");
  };

  const handleCloseCallDeclined = () => {
    setIsCallingActive(false);
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    setCallStatus("NONE");
  };

  const [isCallingActive, setIsCallingActive] = useState(false);

  // NONE, FAILED
  const [callStatus, setCallStatus] = useState("NONE");

  const [timeoutID, setTimeoutID] = useState(null);

  // const [callStatus, setCallStatus] = useState("declin");

  /////////////////////////////

  const { id: chatId } = useParams();

  useEffect(() => {
    if (!chatId || !socket) return;
    console.log(`Emitting join-chat from chatsList with chat id ${chatId}`);
    socket.emit("leave-room", currentChatState.id);
    socket.emit("join-chat", chatId);
  }, [chatId]);

  useEffect(() => {
    setUiState({ state: "loading", message: "Loading chats..." });
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
        // console.log("newMessagesList", newMessagesList);
        setCurrentChatState({
          ...chatInfo,
          newMessage: "",
          chatMessages: newMessagesList,
        });
      });

      socket.on("new-message", (newMessage) => {
        console.log("MENSAJE RECIBIDO");
        const messageIdInCurrentChatState =
          currentChatState.chatMessages.findIndex(
            (msg) => msg.id === newMessage.id
          );
        if (messageIdInCurrentChatState !== -1) return;

        setCurrentChatState((currentChatState) => {
          let newMessages = addDateToList(
            [newMessage],
            currentChatState.chatMessages
          );
          let newChatMessagesList = [
            ...currentChatState.chatMessages,
            ...newMessages,
          ];
          // remove any duplicate messages id
          // newChatMessagesList = newChatMessagesList.filter(
          //   (msg, index, self) =>
          //     index === self.findIndex((t) => t?.id === msg?.id)
          // );

          // console.log("FROM STATE", currentChatState);
          return {
            ...currentChatState,
            chatMessages: newChatMessagesList,
          };
        });

        console.log(currentChatState);
        socket.emit("chats-list", 5);
      });

      // if chatId is not null, then we should join the chat
      if (chatId || chatId === null) {
        if (currentChatState?.newChat) {
          setCurrentChatState({
            newMessage: "",
            chatMessages: [],
            newChat: false,
            id: -1,
            name: currentChatState.otherUsername,
            otherUsername: currentChatState.otherUsername,
            newMessage: "",
          });
        } else {
          console.log("Join chat");
          socket.emit("join-chat", chatId);
        }
      } else {
        if (currentChatState?.newChat) {
          setCurrentChatState({
            newMessage: "",
            chatMessages: [],
            newChat: false,
            id: -1,
            name: currentChatState.otherUsername,
            otherUsername: currentChatState.otherUsername,
            newMessage: "",
          });
        }
      }
    }
    setUiState({ state: "ready", message: "" });
  }, [socket]);

  useEffect(() => {
    return () => {
      console.log("UNMOUNTING with timeoutID", timeoutID);
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
    };
  }, [timeoutID]);

  useEffect(() => {
    // Scroll to the bottom of the screen every time a new chat is loaded
    if (currentChatState.name !== null) {
      refChatBox.current.scrollTop = refChatBox.current.scrollHeight;
    }

    // console.log(refChatBox.current.scrollTop);
  }, [currentChatState]);

  useEffect(() => {
    return () => {
      setCurrentChatState((currentChatState) => {
        console.log(
          `Unmount ChatScreen where currentChatState.name is ${currentChatState.name} and currentChatState.id is ${currentChatState.id}`
        );
        if (currentChatState.name !== null || currentChatState.id !== -1) {
          socket.emit("leave-room", currentChatState.id);
          console.log("Leave room emitted");
        }

        return { ...currentChatState, name: null };
      });
    };
  }, []);
  return (
    <Grid
      container
      alignItems="center"
      direction="column"
      sx={{
        width: "100%",
        maxWidth: { md: "90vw" },
        margin: "0 auto",
        paddingTop: "2vh",
      }}
    >
      <Grid
        container
        direction="row"
        sx={{
          border: "1px red solid",
          borderColor: "primary.dark",
          height: "800px",
          maxHeight: "800px",
        }}
      >
        <Grid
          item
          xs={12}
          md={3}
          sx={{ borderRight: "1px solid", borderRightColor: "primary.dark" }}
        >
          <ChatsListSection />
        </Grid>
        <Grid
          item
          // xs={0}
          // display={{
          //   xs: "none",
          //   md: "block",
          // }}
          md={9}
          container
          direction="column"
          // sx={{backgroundColor: "primary.light"}}
        >
          <ChatsMessagesSection
            isCallingActive={isCallingActive}
            setIsCallingActive={setIsCallingActive}
            callStatus={callStatus}
            setCallStatus={setCallStatus}
            setTimeoutID={setTimeoutID}
            timeoutID={timeoutID}
          />
        </Grid>
      </Grid>
      {/* BACKDROP FOR MESSAGE: */}
      <Backdrop
        sx={{ color: "#fff", zIndex: 5 }}
        // open={open}
        open={
          (isCallingActive && callStatus === "NONE") ||
          (isCallingActive &&
            (callStatus === "FAILED" || callStatus === "DECLINED"))
        }
        // onClick={handleClose}
      >
        {isCallingActive && (
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
        )}
        <Dialog
          open={callStatus === "FAILED"}
          onClose={handleCloseNotAnswered}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            User cannot be contacted. Call finished.
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleCloseNotAnswered}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={callStatus === "DECLINED"}
          onClose={handleCloseCallDeclined}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            User declined the call.
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleCloseCallDeclined}>Close</Button>
          </DialogActions>
        </Dialog>
      </Backdrop>
    </Grid>
  );
};
