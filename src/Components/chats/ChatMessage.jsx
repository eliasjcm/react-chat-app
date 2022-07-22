import { ListItem, ListItemText } from "@mui/material";
import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export const ChatMessage = ({ msg }) => {
  const { userState } = useContext(AppContext);
  return (
    <ListItem
      className={
        "chat-msg " +
        (msg.senderId === (userState.id || 5)
          ? "chat-msg-sent"
          : "chat-msg-received")
      }
      key={msg.id}
      sx={{
        // border: "1px solid",
        maxWidth: "60%",
        ...(msg.senderId === (userState.id || 5)
          ? { alignSelf: "flex-end" }
          : { alignSelf: "flex-start" }),

        width: "auto",
        clear: "both",
      }}
      {...(msg.type === "date" && {
        id: "chat-date-msgs",
        className: "chat-date-msgs",
      })}
    >
      <ListItemText
        sx={{ display: "flex" }}
        primary={msg.content}
        {...(msg.createdAt && {
          secondary: `${new Date(msg.createdAt)
            .getHours()
            .toString()
            .padStart(2, "0")}:${new Date(msg.createdAt)
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
        })}

        // ...(
        //   msg?.type !== "text" && {secondary: msg.createdAt.toLocaleString("en-US", {
        //   hour: "numeric",
        //   minute: "numeric",
        //   hour12: true,
        // }))
      />
    </ListItem>
  );
};
