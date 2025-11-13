import { createContext, useReducer, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as authService from '../services/authService';
import { AuthStatus, UserRoles } from '../types';

const initialState = {
  status: AuthStatus.IDLE,
  user: null,
  error: null,
  isInitialized: false,
};

const ACTION_TYPES = {
  INITIALIZE: 'auth/initialize',
  LOGIN_REQUEST: 'auth/login_request',
  LOGIN_SUCCESS: 'auth/login_success',
  LOGIN_FAILURE: 'auth/login_failure',
  LOGOUT: 'auth/logout',
  UPDATE_USER: 'auth/update_user',
  RESET_ERROR: 'auth/reset_error',
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.INITIALIZE:
      return {
        ...state,
        status: action.payload.user ? AuthStatus.AUTHENTICATED : AuthStatus.IDLE,
        user: action.payload.user,
        isInitialized: true,
      };
    case ACTION_TYPES.LOGIN_REQUEST:
      return {
        ...state,
        status: AuthStatus.AUTHENTICATING,
        error: null,
      };
    case ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        status: AuthStatus.AUTHENTICATED,
        user: action.payload.user,
        error: null,
      };
    case ACTION_TYPES.LOGIN_FAILURE:
      return {
        ...state,
        status: AuthStatus.ERROR,
        user: null,
        error: action.payload.error,
      };
    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        status: AuthStatus.IDLE,
        user: null,
        error: null,
      };
    case ACTION_TYPES.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user },
      };
    case ACTION_TYPES.RESET_ERROR:
      return {
        ...state,
        error: null,
        status: state.status === AuthStatus.ERROR ? AuthStatus.IDLE : state.status,
      };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

const AuthStateContext = createContext(undefined);
const AuthDispatchContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const { isValid, user } = await authService.verifyToken();
      dispatch({
        type: ACTION_TYPES.INITIALIZE,
        payload: { user: isValid ? user : null },
      });
    } catch (error) {
      dispatch({
        type: ACTION_TYPES.INITIALIZE,
        payload: { user: null },
      });
    }
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: ACTION_TYPES.LOGIN_REQUEST });
    try {
      const { authenticated, user } = await authService.authenticate(credentials);
      if (authenticated && user) {
        dispatch({
          type: ACTION_TYPES.LOGIN_SUCCESS,
          payload: { user },
        });
        return true;
      }
      throw new Error('Authentication failed');
    } catch (error) {
      dispatch({
        type: ACTION_TYPES.LOGIN_FAILURE,
        payload: {
          error: error.message || 'Authentication failed',
        },
      });
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: ACTION_TYPES.LOGOUT });
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_USER,
      payload: { user: userData },
    });
  }, []);

  const resetError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    resetError,
    initialize,
    isAdmin: state.user?.role === UserRoles.ADMIN,
    isBusOwner: state.user?.role === UserRoles.BUS_OWNER,
    isAuthenticated: state.status === AuthStatus.AUTHENTICATED,
  };

  return (
    <AuthStateContext.Provider value={value}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (context === undefined) {
    throw new Error('useAuthDispatch must be used within an AuthProvider');
  }
  return context;
};