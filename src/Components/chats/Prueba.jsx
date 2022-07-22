import React from "react";
export function Prueba({
  handlePickChat
}) {
  return <ListItem key={chat.id} sx={{
    border: "1px solid",
    cursor: "pointer"
  }} onClick={() => handlePickChat(chat.id)}>
            <ListItemAvatar sx={{
      padding: 0
    }}>
              <Avatar sx={{
        bgcolor: deepOrange[500]
      }}>{chat.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={chat.name} secondary={chat.lastMessage.content} />
          </ListItem>;
}
  