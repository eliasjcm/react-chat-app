import React, { useEffect, useRef, useState } from "react";
import { useJwt } from "react-jwt";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { ChatsScreen } from "./Components/chats/ChatsScreen";
import { LoginScreen } from "./Components/login/LoginScreen";
import { MainScreen } from "./Components/ui/MainScreen";
import { AppContext, contextStructure } from "./context/AppContext";
import { FriendsScreen } from "./Components/friends/FriendsScreen";

import { AppRouter } from "./routers/AppRouter";
import { PrivateRoute } from "./routers/PrivateRoute";
import jwt_decode from "jwt-decode";

const currentChat = {
  name: "Lucas",
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

  const [otherUser, setOtherUser] = useState(null);

  const [currentToken, setCurrentToken] = useState(localStorage.getItem("token") || "")


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
        setOtherUser,currentToken, setCurrentToken
      }}
    >
      {userState && (
        <BrowserRouter>
          <Routes>
            <Route exact path="/login" element={<LoginScreen />} />
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
    </AppContext.Provider>
  );
};
