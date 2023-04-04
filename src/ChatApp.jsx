import React, { useEffect, useRef, useState } from "react";
import { useJwt } from "react-jwt";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginScreen } from "./Components/login/LoginScreen";
import { AppContext } from "./context/AppContext";
import { AppRouter } from "./routers/AppRouter";
import { PrivateRoute } from "./routers/PrivateRoute";
import jwt_decode from "jwt-decode";
import { Alert, Snackbar } from "@mui/material";
import { RegisterScreen } from "./Components/register/RegisterScreen";

const currentChat = {
  name: null,
  id: 10,
  newMessage: "",
  chatMessages: [
    {
      id: 10,
      content: "Hello World",
      senderId: 5,
      createdAt: new Date(2000, 1, 1),
    },
    {
      id: 9,
      content: "Bro I dont care about your hair, youre just bald",
      senderId: 4,
      createdAt: new Date(2000, 1, 1),
    },
    {
      id: 8,
      content: "Lorem ipsum dolor sit amet.",
      senderId: 4,
      createdAt: new Date(2000, 1, 1),
    },
    {
      id: 7,
      content: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      senderId: 5,
      createdAt: new Date(2000, 1, 1),
    },
    {
      id: 6,
      content: "Hello World",
      senderId: 5,
      createdAt: new Date(2000, 1, 1),
    },
  ],
};

export const ChatApp = () => {
  const refChatBox = useRef(null);

  const { decodedToken, isExpired, reEvaluateToken } = useJwt(
    localStorage.getItem("token") || ""
  );

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    msg: "",
  });

  const [searchState, setSearchState] = useState({ value: "" });
  const [userState, setUserState] = useState(null);

  const [currentChatState, setCurrentChatState] = useState(currentChat);

  const [chatsListState, setChatsListState] = useState(
    // contextStructure.chatsList
    []
  );

  const [loginState, setLoginState] = useState({
    username: "",
    password: "",
  });

  const [alertMessage, setAlertMessage] = useState({
    msg: "",
    severity: "",
  });

  const [loadingState, setLoadingState] = useState({
    chatsList: "",
  });

  const [usersListState, setUsersListState] = useState([
    { name: "Luigi", username: "lugi32", id: 10 },
    { name: "Luigi", username: "lugi32", id: 24 },
    { name: "Luigi", username: "lugi32", id: 34 },
    { name: "Luigi", username: "lugi32", id: 44 },
    { name: "Luigi", username: "lugi32", id: 54 },
    { name: "Luigi", username: "lugi32", id: 64 },
  ]);

  const [uiState, setUiState] = useState({});

  const [postsListState, setPostsListState] = useState([
    {
      content: "Primer post de prueba",
      createdAt: "2022-07-12 00:00:00",
      id: 1,
      likesCount: 2,
      publisher: {
        name: "Santa Clos",
        username: "christmasX1",
        id: 1,
      },
    },
    {
      content: "Primer post de prueba",
      createdAt: "2022-07-12 00:00:00",
      id: 2,
      likesCount: 0,
      publisher: {
        name: "Santa Clos",
        username: "christmasX1",
        id: 1,
      },
    },
  ]);

  const [socket, setSocket] = useState(undefined);

  const [stream, setStream] = useState();
  const [otherUserStream, setOtherUserStream] = useState();

  const [otherUser, setOtherUser] = useState(null);

  const [currentToken, setCurrentToken] = useState(
    localStorage.getItem("token") || ""
  );

  useEffect(() => {
    // console.log(localStorage.getItem("token"), isExpired)
    // console.log("decodedToken", decodedToken)
    // reEvaluateToken(localStorage.getItem("token"))
    let decodedToken;
    if (currentToken) {
      decodedToken = jwt_decode(currentToken);
    }
    // let
    // console.log("decodedToken", decodedToken)
    // console.log("decodedToken", decodedToken)
    // console.log(decodedToken)
    if (decodedToken) {
      setUserState({
        isConnected: true,
        id: decodedToken.id,
        username: decodedToken.username,
      });
      console.log("NEW token");
    } else {
      setUserState({});
      console.log("No token");
    }
  }, [currentToken]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const [callState, setCallState] = useState(null);

  const [paginationState, setPaginationState] = useState({
    page: 1,
    pageSize: 20,
    hasNext: true,
  });

  return (
    <AppContext.Provider
      value={{
        chatsListState,
        setChatsListState,
        currentChatState,
        setCurrentChatState,
        loginState,
        setLoginState,
        alertMessage,
        setAlertMessage,
        socket,
        setSocket,
        userState,
        setUserState,
        decodedToken,
        reEvaluateToken,
        refChatBox,
        usersListState,
        setUsersListState,
        searchState,
        setSearchState,
        postsListState,
        setPostsListState,
        stream,
        setStream,
        otherUser,
        setOtherUser,
        currentToken,
        setCurrentToken,
        callState,
        setCallState,
        otherUserStream,
        setOtherUserStream,
        uiState,
        setUiState,
        snackbarState,
        setSnackbarState,
        paginationState,
        setPaginationState,
      }}
    >
      {userState && (
        <BrowserRouter>
          <Routes>
            <Route exact path="/login" element={<LoginScreen />} />
            <Route exact path="/register" element={<RegisterScreen />} />
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <AppRouter />
                </PrivateRoute>
              }
            />
            {/* <Route path="*" element={<Navigate to="/" />} /> */}
          </Routes>
        </BrowserRouter>
      )}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={2000}
        onClose={() => {
          setSnackbarState({ ...snackbarState, open: false });
        }}
        key={"bottom" + "center"}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            setSnackbarState({ ...snackbarState, open: false });
          }}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarState.msg}
        </Alert>
      </Snackbar>
    </AppContext.Provider>
  );
};
