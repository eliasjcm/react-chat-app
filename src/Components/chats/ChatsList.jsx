import { blue, deepOrange } from "@mui/material/colors";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Box,
  Typography
} from "@mui/material";
import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export const ChatsList = () => {
  const {
    chatsListState,
    setChatsListState,
    currentChatState,
    setCurrentChatState,
    socket,
  } = useContext(AppContext);

  const handlePickChat = (chatId) => {
    if (chatId !== currentChatState.id) {
      console.log(`Emitting join-chat from chatsList with chat id ${chatId}`);
      socket.emit("leave-chat", currentChatState.id);
      socket.emit("join-chat", chatId);
    }
    // }
  };

  return (
    <Box>
      <Box sx={{height: 80, bgcolor: blue[700], display: "flex"}} pl={2} >
      <Typography sx={{color: "white"}} fontSize={20}>Chats</Typography>
      </Box>
    <List className="chat-list" sx={{ padding: 0 }}>
      {chatsListState.map((chat) => (
        <Box
        key={chat.id}
        >
          <ListItem
            sx={{ border: "1px solid", cursor: "pointer" }}
            onClick={() => handlePickChat(chat.id)}
          >
            <ListItemAvatar sx={{ padding: 0 }}>
              <Avatar sx={{ bgcolor: deepOrange[500] }}>{chat.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={chat.name}
              secondary={chat.lastMessage.content}
            />
          </ListItem>
        </Box>
      ))}
    </List>
    </Box>
  );
};
