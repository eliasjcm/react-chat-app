import { Avatar, Grid, ListItemText } from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import React from "react";

export const UserCard = ({ user }) => {
  return (
    <Grid
      item
      xs={"auto"}
      marginRight={1}
      sx={{
        border: 1,
        borderRadius: 5,
        borderColor: "#00af9c",
        cursor: "pointer",
        minWidth: "100px",
        padding: "15px 20px 10px",
      }}
    >
      <Avatar
        sx={{
          bgcolor: deepOrange[500],
          margin: "0 auto",
          width: "60px",
          height: "60px",
        }}
        // src={"https://mui.com/static/images/avatar/2.jpg"}
      >
        {user.name[0]}
      </Avatar>
      <ListItemText primary={user.name} secondary={`@${user.username}`} />
    </Grid>
  );
};
