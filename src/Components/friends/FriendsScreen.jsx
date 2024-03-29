import {
  Alert,
  AppBar,
  Box,
  Button,
  Grid,
  IconButton,
  LinearProgress,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { UserCard } from "./UserCard";
import MenuIcon from "@mui/icons-material/Menu";
import { UserCardsList } from "./UserCardsList";
import { HOSTNAME } from "../../utils";
import { display } from "@mui/system";
import { Loading } from "../ui/Loading";
import UsersListTable from "./UsersListTable";
import SearchIcon from "@mui/icons-material/Search";

export const FriendsScreen = () => {
  const {
    usersListState,
    setUsersListState,
    searchState,
    setSearchState,
    uiState,
    setUiState,
  } = useContext(AppContext);

  const [screenState, setScreenState] = useState({
    inSearch: false,
    friendsList: [],
    value: "",
  });

  const handleFindFriends = async (e) => {
    console.log("Asking for a friend");
    e.preventDefault();
    const request = await fetch(`${HOSTNAME}/users?q=${searchState.value}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(request);
    const friendsRes = await request.json();
    console.log(friendsRes);
    setUsersListState(friendsRes);
    setScreenState({ ...screenState, inSearch: true });
  };

  const handleClearSearch = () => {
    setScreenState({ ...screenState, inSearch: false });
    setSearchState({ ...searchState, value: "" });
    setUsersListState(screenState.friendsList);
  };

  const askFriends = async () => {
    const request = await fetch(`${HOSTNAME}/users?onlyFriends=true`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(request);
    const friendsRes = await request.json();
    console.log(friendsRes);
    setScreenState({ ...screenState, friendsList: friendsRes });
    return friendsRes;
  };
  // useEffect(async () => {
  //   setUiState({ state: "loading" });
  //   const friends = await askFriends();
  //   setUsersListState(friends);
  //   setUiState({ state: "ready" });
  // }, []);
  return (
    <div style={{ padding: "15px" }}>
      <Grid
        container
        sx={{ marginTop: 2, marginBottom: 3, alignItems: "stretch" }}
      >
        <Grid item flexGrow={1}>
          <form onSubmit={handleFindFriends}>
            <TextField
              label="Find a user"
              fullWidth
              variant="outlined"
              size="small"
              onSubmit={(e) => {
                console.log("Submit");
              }}
              onChange={(e) => {
                setSearchState({ value: e.target.value });
              }}
              value={searchState.value}
            />
          </form>
        </Grid>

        <Grid item>
          <Button variant="outlined" onClick={handleFindFriends}>
            Find
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleClearSearch}
          >
            Clear
          </Button>
        </Grid>
      </Grid>
      {screenState.inSearch && (
        <>
          <Typography variant="h4" marginBottom={4}>
            Search Results
          </Typography>
          {usersListState.length > 0 ? (
            // <UserCardsList usersList={usersListState} />
            <UsersListTable usersList={usersListState} setUsersList={setUsersListState} />
          ) : (
            <Alert severity="warning">No users found!</Alert>
          )}
        </>
      )}
      {!screenState.inSearch && (
        // <>
        //   <Typography variant="h4" marginTop={10} marginBottom={4}>
        //     Following
        //   </Typography>
        //   {uiState.state === "loading" ? (
        //     <Loading />
        //   ) : usersListState.length > 0 ? (
        //     <>
        //       {/* <UserCardsList usersList={usersListState} /> */}
        //       <Grid
        //         container
        //         justifyContent={"center"}
        //         alignItems={"center"}
        //         sx={{ marginTop: 5 }}
        //       >
        //         <Grid item>
        //           <UsersListTable usersList={usersListState} />
        //         </Grid>
        //       </Grid>
        //     </>
        //   ) : (
        //     <Alert severity="warning">You have no friends!</Alert>
        //   )}
        // </>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          flexDirection={"column"}
          sx={{ height: "50vh" }}
        >
          <SearchIcon color="primary" sx={{ fontSize: 100 }} />
          <Typography color={"primary"} fontSize={26}>
            Enter a username to find new users!
          </Typography>
        </Grid>
      )}
    </div>
  );
};
