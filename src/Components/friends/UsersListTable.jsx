import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { deepOrange } from "@mui/material/colors";
import { Box } from "@mui/system";
import { Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { HOSTNAME } from "../../utils";

export default function UsersListTable({ usersList, inline, setUsersList }) {
  const { userState } = React.useContext(AppContext);

  const showBorder = inline ? false : true;
  console.log("INLINE TABLE", showBorder);
  const primaryColor = "#1976D9";
  const secondaryColor = "#1976A1";

  console.log("UsersListTable", usersList);

  const navigate = useNavigate();

  const handleOpenUserProfile = (user) => {
    // console.log("Open user profile", user);
    navigate(`/profile/${user.username}`);
  };

  const handleFollow = (user) => {
    const otherUserId = user.id;

    (async () => {
      // use axios to make a post request to the follow-system/follow endpoint
      // pass otherUserId in the body
      const follow = await axios.post(
        `${HOSTNAME}/follow-system/follow`,
        {
          otherUserId,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const response = follow.data;

      if (follow.status === 200) {
        setUsersList((prev) => {
          return prev.map((user) => {
            if (user.id === otherUserId) {
              return { ...user, is_being_followed_by_me: true };
            }
            return user;
          });
        });
      }
    })();
  };

  const handleUnfollow = (user) => {
    const otherUserId = user.id;

    (async () => {
      // use axios to make a post request to the follow-system/unfollow endpoint
      // pass otherUserId in the body
      const unfollow = await axios.post(
        `${HOSTNAME}/follow-system/unfollow`,
        {
          otherUserId,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const response = unfollow.data;

      if (unfollow.status === 200) {
        setUsersList((prev) => {
          return prev.map((user) => {
            if (user.id === otherUserId) {
              return { ...user, is_being_followed_by_me: false };
            }
            return user;
          });
        });
      }
    })();
  };

  return (
    <Box
      {...(showBorder && {
        border: 2,
        borderColor: primaryColor,
        borderRadius: 3,
      })}
      sx={{
        width: "70vw",
        display: "flex",
        margin: "0 auto",
      }}
    >
      <List
        sx={{
          // xs: { width: "450px" },
          // xl: { width: "900px" },
          borderColor: "red",
          alignItems: "center",
          width: "100%",
        }}
      >
        {usersList.map((user, index) => {
          return (
            <>
              <ListItem
                alignItems="center"
                key={index}
                {...(showBorder && {
                  sx: { pl: 3, pt: 2, pb: 2 },
                })}
              >
                <ListItemAvatar
                  onClick={() => handleOpenUserProfile(user)}
                  sx={{ cursor: "pointer" }}
                >
                  <Avatar
                    sx={{
                      bgcolor: deepOrange[500],
                      margin: "0 auto",
                      width: "70px",
                      height: "70px",
                    }}
                  >
                    {user?.name[0]}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  sx={{ ml: 2, flex: "initial", cursor: "pointer" }}
                  //   primary={user.name}
                  primary={
                    <Grid container alignContent={"center"}>
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          fontWeight: "700",
                          // display: "inline"
                          fontSize: "1.1em",
                        }}
                      >
                        {user.name}
                      </Typography>
                      {!!user?.is_my_follower && (
                        <Grid
                          item
                          sx={{
                            backgroundColor: "rgba(06, 42, 78, 0.71)",
                            borderRadius: 2,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            alignContent: "center",
                          }}
                          ml={1}
                        >
                          <Typography
                            ml={1}
                            mr={1}
                            color="white"
                            fontWeight={"bold"}
                            fontSize={14}
                            mt={0.5}
                            mb={0.5}
                          >
                            Follows You!
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  }
                  secondary={
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      @{user.username}
                    </Typography>
                  }
                  onClick={() => handleOpenUserProfile(user)}
                />
                <Grid
                  item
                  container
                  direction={"row"}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                  sx={{ width: "initial", marginLeft: "auto" }}
                >
                  {/* {!!user?.is_being_followed_by_me ? (
                    <Grid item ml={3}>
                      <Button
                        variant="contained"
                        //   onClick={handleUnfollow}
                        color={"error"}
                      >
                        Unfollow
                      </Button>
                    </Grid>
                  ) : (
                    <Grid item ml={3}>
                      <Button
                        variant="contained"
                        // onClick={handleFollow}
                      >
                        Follow
                      </Button>
                    </Grid>
                  )} */}
                  {userState.id !== user.id &&
                    (!!user?.is_being_followed_by_me ? (
                      <Grid item ml={3}>
                        <Button
                          variant="contained"
                          onClick={() => handleUnfollow(user)}
                          color={"error"}
                        >
                          Unfollow
                        </Button>
                      </Grid>
                    ) : (
                      <Grid item ml={3}>
                        <Button
                          variant="contained"
                          onClick={() => handleFollow(user)}
                        >
                          Follow
                        </Button>
                      </Grid>
                    ))}
                </Grid>
              </ListItem>
              {showBorder && index < usersList.length - 1 && (
                <Divider variant="fullWidth" sx={{ bgcolor: secondaryColor }} />
              )}
            </>
          );
        })}
        {/* <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
        </ListItemAvatar>
        <ListItemText
          primary="Brunch this weekend?"
          secondary={
            <React.Fragment>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                Ali Connors
              </Typography>
              {" — I'll be in your neighborhood doing errands this…"}
            </React.Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
        </ListItemAvatar>
        <ListItemText
          primary="Summer BBQ"
          secondary={
            <React.Fragment>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                to Scott, Alex, Jennifer
              </Typography>
              {" — Wish I could come, but I'm out of town this…"}
            </React.Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
        </ListItemAvatar>
        <ListItemText
          primary="Oui Oui"
          secondary={
            <React.Fragment>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                Sandra Adams
              </Typography>
              {' — Do you have Paris recommendations? Have you ever…'}
            </React.Fragment>
          }
        />
      </ListItem> */}
      </List>
    </Box>
  );
}
