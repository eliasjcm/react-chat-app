import { List } from "@mui/material";
import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { ChatMessage } from "./ChatMessage";

export const ChatMessages = () => {
  const { currentChatState, refChatBox } = useContext(AppContext);

  return (
    <List
    className="chat-messages"
      ref={refChatBox}
      sx={{
        display: "flex",
        flexDirection: "column",
        // maxHeight: "70vh",
        height: "100%",
        maxHeight: "100%",
        overflowY: "auto",
        // width: "100%",
      }}
    >
      {currentChatState.chatMessages.map((msg, idx) => (
        <ChatMessage key={idx} msg={msg} />
      ))}
    </List>
  );
};
