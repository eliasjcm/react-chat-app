import { Grid } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { UserCard } from "./UserCard";

export const UserCardsList = ({ usersList }) => {
  return (
    <Grid
      container
      // alignItems="center"
      // justifyContent="start"
      columnSpacing={5}
      // justifyContent="center"
      // onClick={() => navigate("/chats")}

      // flexGrow={1}
    >
      {usersList.map((user) => {
        return (
          <Grid item key={user.id}>
            <Link to={`/profile/${user.id}`} style={{textDecoration: 'none', color: 'initial'}}>
              <UserCard key={user.id} user={user} />
            </Link>
          </Grid>
        );
      })}
    </Grid>
  );
};
