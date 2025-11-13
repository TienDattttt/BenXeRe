import { useReducer, createContext, useEffect } from "react";
import useLocalStorage from "../hooks/use-localstorage";
import { authenticate, handleOAuthToken } from "../services/authService";

const initialState = {
  isLoggingIn: false,
  isLoggedIn: false,
  user: null,
  error: null,
};

export const AuthStateContext = createContext();
export const AuthDispatchContext = createContext();

const ACTION_TYPES = {
  LOGIN_REQUEST: "LOGIN_REQUEST",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT_SUCCESS: "LOGOUT_SUCCESS",
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.LOGIN_REQUEST:
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        isLoggingIn: true,
        error: null,
      };
    case ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload.user,
        isLoggingIn: false,
        error: null,
      };
    case ACTION_TYPES.LOGIN_FAILURE:
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        isLoggingIn: false,
        error: action.payload.error,
      };
    case ACTION_TYPES.LOGOUT_SUCCESS:
      return {
        ...state,
        ...initialState,
      };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

export const login = async (dispatch, userData) => {
  dispatch({
    type: ACTION_TYPES.LOGIN_REQUEST,
  });
  try {
    const result = await authenticate(userData);
    if (result.authenticated) {
      const user = result.user || {
        email: userData.email,
        role: result.scope
      };
      
      dispatch({
        type: ACTION_TYPES.LOGIN_SUCCESS,
        payload: {
          user: user
        },
      });
      return true;
    } else {
      dispatch({
        type: ACTION_TYPES.LOGIN_FAILURE,
        payload: {
          error: "Invalid credentials",
        },
      });
    }
  } catch (error) {
    dispatch({
      type: ACTION_TYPES.LOGIN_FAILURE,
      payload: {
        error: error.message || "Sorry, unable to login!",
      },
    });
  }
};

export const logout = async (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch({
    type: ACTION_TYPES.LOGOUT_SUCCESS,
  });
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token) {
        try {
          const result = await handleOAuthToken(token);
          if (result && !result.error) {
            dispatch({
              type: ACTION_TYPES.LOGIN_SUCCESS,
              payload: {
                user: storedUser ? JSON.parse(storedUser) : {
                  email: result.sub,
                  role: result.scope
                }
              }
            });
          } else {
            if (result.error) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
        } catch (error) {
          console.error('Token validation error:', error);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
    };

    checkAuth();
  }, []);
  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthStateContext.Provider value={state}>
        {children}
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  );
};

export default AuthProvider;
