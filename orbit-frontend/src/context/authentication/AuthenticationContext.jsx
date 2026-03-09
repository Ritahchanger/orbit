import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { clearRedirection, setPageToRedirect } from "./RedirectionSlice";

import { authApiService } from "./authService";

import otpApi from "../../admin-pages/services/otp-api";

import { useStoreContext } from "../store/StoreContext";

const AuthContext = createContext();

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Helper function to clear cookie
const clearCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Helper to normalize user data from different API responses
const normalizeUserData = (apiData) => {
  // If response has data property (from /auth/me)
  if (apiData.data && apiData.success) {
    return apiData.data;
  }
  // If response has user property
  else if (apiData.user) {
    return apiData.user;
  }
  // If response is from /auth/signin (has userId)
  else if (apiData.userId) {
    return {
      _id: apiData.userId,
      email: apiData.email,
      firstName: apiData.firstName,
      lastName: apiData.lastName,
      role: apiData.role,
      store: apiData.store,
      // Map store data to assignedStore for consistency
      assignedStore: apiData.store?.storeId || "",
      // Add defaults for other fields
      phoneNo: "",
      profileImage: "",
      canAccessAllStores: false,
      storePermissions: [],
      storeRoles: [],
    };
  }
  // If already a user object
  else if (apiData._id) {
    return apiData;
  }

  console.warn("Could not normalize user data:", apiData);
  return null;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const location = useLocation();

  const dispatch = useDispatch();

  const { switchStore } = useStoreContext();

  // Get redirection state from Redux
  const { pageToRedirect } = useSelector((state) => state.redirection);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [userRole, setUserRole] = useState(null); // Add user role state

  // Check authentication status from cookies and sessionStorage on initial load
  useEffect(() => {
    const storedAuth = sessionStorage.getItem("isAuthenticated");
    const cookieToken = getCookie("token");
    const localStorageToken = localStorage.getItem("authToken");

    console.log("🔍 Initial auth check:", {
      storedAuth,
      hasCookieToken: !!cookieToken,
      hasLocalStorageToken: !!localStorageToken,
    });

    if (storedAuth === "true" || cookieToken || localStorageToken) {
      setIsAuthenticated(true);

      // If we have a cookie token but no localStorage token, sync them
      if (cookieToken && !localStorageToken) {
        localStorage.setItem("authToken", cookieToken);
        // Set authorization header for future requests
        authApiService.setAuthToken(cookieToken);
      }
    }
  }, []);

  // Handle post-login redirection - ONLY when authentication state changes

  const loginWithOtp = async (otpData) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      console.log("🔐 Attempting OTP login with:", {
        email: otpData.email,
        hasOtp: !!otpData.otp,
      });

      // First, verify the OTP using the OTP API
      const otpResponse = await otpApi.verifyLoginOTP({
        email: otpData.email,
        otp: otpData.otp,
      });

      console.log("✅ OTP verification response:", otpResponse.data);

      // Check if OTP verification was successful
      if (!otpResponse.data.success) {
        throw new Error(otpResponse.data.message || "OTP verification failed");
      }

      // If OTP verification returns a token directly (Option B from earlier)
      if (otpResponse.data.token) {
        console.log("✅ OTP verification returned token directly");

        // Store the token
        localStorage.setItem("authToken", otpResponse.data.token);
        authApiService.setAuthToken(otpResponse.data.token);

        // Set user data if provided
        if (otpResponse.data.user) {
          setUser(otpResponse.data.user);
          setUserRole(otpResponse.data.user.role);
        }

        setIsAuthenticated(true);
        sessionStorage.setItem("isAuthenticated", "true");

        return otpResponse.data.user?.role || "user";
      }

      // If OTP verification doesn't return token, we need to get user data
      console.log("🔄 OTP verified, fetching user data...");

      // Fetch user data after OTP verification
      const userResponse = await authApiService.getCurrentUser();
      const userData = userResponse.data.user || userResponse.data.data;

      if (!userData) {
        throw new Error("Failed to fetch user data after OTP verification");
      }

      console.log("✅ User data fetched:", userData);

      // Set user data
      setUser(userData);
      setUserRole(userData.role);
      setIsAuthenticated(true);
      sessionStorage.setItem("isAuthenticated", "true");

      // If we have a token from cookies, store it
      const cookieToken = getCookie("token");
      if (cookieToken) {
        localStorage.setItem("authToken", cookieToken);
        authApiService.setAuthToken(cookieToken);
      }

      return userData.role || "user";
    } catch (error) {
      console.error("❌ OTP login failed:", error);

      let errorMessage = "OTP login failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchUser = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      console.log("🔍 Fetching user with HTTP-only cookies...");

      const res = await authApiService.getCurrentUser();
      console.log("✅ User fetched from API:", res.data);

      // Normalize user data from different response structures
      const userData = normalizeUserData(res.data);

      if (!userData) {
        throw new Error("No user data received from server");
      }

      // Extract permission data from response
      const userPermissions = userData.permissions || [];
      const rolePermissions = userData.rolePermissions || [];
      const accessibleStores = userData.accessibleStores || [];
      const storePermissions = userData.storePermissions || [];
      const storeRoles = userData.storeRoles || [];

      // Enhance user data with permission helpers
      const enhancedUserData = {
        ...userData,
        // Permission helper methods
        hasPermission: (permissionKey, storeId = null) => {
          // Superadmin has all permissions
          if (userData.role === "superadmin") return true;

          // Check global permissions first
          if (userPermissions.includes(permissionKey)) {
            return true;
          }

          // Check store-specific permissions if storeId provided
          if (storeId) {
            const storePerm = storePermissions.find(
              (perm) => perm.store?._id === storeId || perm.store === storeId,
            );

            // Map permission keys to store permission flags
            const permissionMapping = {
              "products.view": "canView",
              "products.edit": "canEdit",
              "sales.create": "canSell",
              "stores.manage": "canManage",
              "workers.manage": "canManage",
            };

            const permFlag = permissionMapping[permissionKey];
            return storePerm ? storePerm[permFlag] || false : false;
          }

          return false;
        },

        // Check if user can access a specific store
        canAccessStore: (storeId) => {
          if (userData.role === "superadmin" || userData.canAccessAllStores) {
            return true;
          }

          // Check assigned store
          if (
            userData.assignedStore &&
            (userData.assignedStore._id === storeId ||
              userData.assignedStore === storeId)
          ) {
            return true;
          }

          // Check store permissions
          const hasStorePermission = storePermissions.some(
            (perm) => perm.store?._id === storeId || perm.store === storeId,
          );

          // Check accessible stores
          const hasAccessibleStore = accessibleStores.some(
            (store) => store._id === storeId || store === storeId,
          );

          return hasStorePermission || hasAccessibleStore;
        },

        // Get user's permissions for a specific store
        getStorePermissions: (storeId) => {
          const defaultPerms = {
            canView: false,
            canEdit: false,
            canSell: false,
            canManage: false,
          };

          if (userData.role === "superadmin") {
            return {
              ...defaultPerms,
              canView: true,
              canEdit: true,
              canSell: true,
              canManage: true,
            };
          }

          // Find store-specific permissions
          const storePerm = storePermissions.find(
            (perm) => perm.store?._id === storeId || perm.store === storeId,
          );

          if (storePerm) {
            return storePerm;
          }

          // Check if user has store role
          const storeRole = storeRoles.find(
            (role) => role.store?._id === storeId || role.store === storeId,
          );

          if (storeRole) {
            // Map store role to permissions
            const rolePermissionMap = {
              manager: {
                canView: true,
                canEdit: true,
                canSell: true,
                canManage: true,
              },
              cashier: {
                canView: true,
                canEdit: false,
                canSell: true,
                canManage: false,
              },
              staff: {
                canView: true,
                canEdit: true,
                canSell: false,
                canManage: false,
              },
            };

            return rolePermissionMap[storeRole.role] || defaultPerms;
          }

          return defaultPerms;
        },

        // Permission summary
        permissionsSummary: {
          total: userPermissions.length,
          fromRole: rolePermissions.length,
          fromUser: userPermissions.filter((p) => !rolePermissions.includes(p))
            .length,
          accessibleStores: accessibleStores.length,
        },
      };

      // Set user data and extract role
      setUser(enhancedUserData);
      setUserRole(userData.role);
      setIsAuthenticated(true);
      sessionStorage.setItem("isAuthenticated", "true");

      // Update store context if user has store info
      // Superadmin, admin, and manager can have assigned stores
      const rolesWithStores = ["superadmin", "admin", "manager", "cashier"];
      if (rolesWithStores.includes(userData.role) && userData.assignedStore) {
        try {
          if (switchStore && typeof switchStore === "function") {
            switchStore(userData.assignedStore);

            // Also store in session for persistence
            sessionStorage.setItem(
              "current_store_id",
              userData.assignedStore._id || userData.assignedStore,
            );
          }
        } catch (err) {
          console.warn("Could not switch store on fetch:", err);
          // Don't throw - this shouldn't break the auth flow
        }
      }

      console.log("✅ User fetched successfully:", enhancedUserData);
      return enhancedUserData;
    } catch (err) {
      console.error("❌ Fetch user failed:", err);

      // Extract meaningful error message
      let errorMessage = "Failed to fetch user data";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message.includes("Network Error")) {
        errorMessage =
          "Unable to connect to server. Please check your internet connection.";
      } else if (err.message.includes("401")) {
        errorMessage = "Session expired. Please log in again.";
      }

      setAuthError(errorMessage);

      // Don't call logout here - just clear local state
      clearAuthState();
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  // In your AuthenticationContext.jsx, update the login function:

  const login = async (credentials) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await authApiService.login(credentials);
      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }
      const token = response.data.token;
      if (token) {
        localStorage.setItem("authToken", token);
        authApiService.setAuthToken(token);
      }
      localStorage.setItem("last_activity", Date.now().toString());
      const normalizedUser = normalizeUserData(response.data);
      setUser(normalizedUser);
      const userRole = response.data.role || normalizedUser.role || "user";
      setUserRole(userRole);
      setIsAuthenticated(true);
      sessionStorage.setItem("isAuthenticated", "true");
      return userRole;
    } catch (error) {
      let errorMessage =
        error.message || "Login failed. Please check your credentials.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes("Please log in to continue")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Network error")) {
        errorMessage =
          "Cannot connect to server. Please check your internet connection.";
      }
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const storeIntendedPath = useCallback(() => {
    const currentPath = location.pathname + location.search;

    sessionStorage.setItem("preAuthPath", currentPath);

    localStorage.setItem("preAuthPath", currentPath);

    if (currentPath !== "/admin" && currentPath !== "/admin/login") {
      dispatch(setPageToRedirect(currentPath));
    }
  }, [location.pathname, location.search, dispatch]);

  const prepareForAuthentication = useCallback(() => {
    storeIntendedPath();
  }, [storeIntendedPath]);

  const logout = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await authApiService.logout();

      clearAuthState();

      navigate("/admin/login");
    } catch (err) {
      // Even if API call fails, clear local auth state
      clearAuthState();
      // Redirect to login page anyway
      navigate("/admin/login");

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to logout from server. Local session cleared.";

      setAuthError(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setAuthError(null);
    // Remove: setHasRedirected(false); // DELETE THIS

    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("preAuthPath");
    sessionStorage.removeItem("prevAuthPath");
    sessionStorage.removeItem("authToken");

    // sessionStorage.removeItem("current_store_id");
    // sessionStorage.removeItem("store_context_initialized");

    localStorage.removeItem("authToken");
    localStorage.removeItem("preAuthPath");
    localStorage.removeItem("prevAuthPath");

    clearCookie("token");
    clearCookie("refreshToken");

    authApiService.clearAuthToken();
  };
  // Google Authentication
  const initiateGoogleAuth = useCallback(() => {
    const currentPath = location.pathname + location.search;

    console.log("🚀 Initiating Google auth, intended path:", currentPath);

    // Store in multiple places for redundancy
    sessionStorage.setItem("preAuthPath", currentPath);
    localStorage.setItem("preAuthPath", currentPath); // Additional backup

    // Build Google auth URL with intended path as parameter
    const googleAuthUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }auth/google?intendedPath=${encodeURIComponent(currentPath)}`;

    authApiService
      .storeIntendedPath(currentPath)
      .then(() => {
        console.log("✅ Intended path stored, redirecting to Google...");
        window.location.href = googleAuthUrl;
      })
      .catch((err) => {
        console.error(
          "❌ Failed to store intended path, proceeding anyway:",
          err,
        );
        // Still proceed with Google auth, the backend will handle the fallback
        window.location.href = googleAuthUrl;
      });
  }, [location.pathname, location.search]);

  const handleGoogleCallback = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const error = urlParams.get("error");
      const cookieToken = getCookie("token");

      console.log("🔍 Google callback analysis:", {
        urlToken: !!token,
        cookieToken: !!cookieToken,
        hasError: !!error,
        currentPath: window.location.pathname + window.location.search,
      });

      if (error) {
        throw new Error(`Google authentication failed: ${error}`);
      }

      const authToken = token || cookieToken;
      if (!authToken) {
        throw new Error("No authentication token received");
      }

      // Store token and set authorization
      localStorage.setItem("authToken", authToken);
      authApiService.setAuthToken(authToken);

      // Fetch user data
      const userData = await fetchUser();

      // Get the intended path from multiple sources (with priority)
      let redirectPath = "/admin"; // default

      // 1. Check if we're already on the intended path (from backend redirect)
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== "/auth/callback" && currentPath !== "/") {
        redirectPath = currentPath;
        console.log("🎯 Using current path as redirect:", redirectPath);
      }
      // 2. Check session storage (from before auth)
      else if (sessionStorage.getItem("preAuthPath")) {
        redirectPath = sessionStorage.getItem("preAuthPath");
        console.log(
          "🎯 Using pre-auth path from sessionStorage:",
          redirectPath,
        );
        sessionStorage.removeItem("preAuthPath");
      }
      // 3. Check localStorage backup
      else if (localStorage.getItem("preAuthPath")) {
        redirectPath = localStorage.getItem("preAuthPath");
        console.log("🎯 Using pre-auth path from localStorage:", redirectPath);
        localStorage.removeItem("preAuthPath");
      }

      // Clean URL parameters if we had token in URL
      if (token || error) {
        const cleanUrl = redirectPath.startsWith("/")
          ? redirectPath
          : `/${redirectPath}`;

        window.history.replaceState({}, document.title, cleanUrl);
        console.log("🧹 Cleaned URL, redirected to:", cleanUrl);
      }

      console.log(
        "✅ Google authentication successful, user redirected to:",
        redirectPath,
      );
      return userData.role; // Return role from Google callback
    } catch (err) {
      console.error("❌ Google authentication callback failed:", err);
      setAuthError(err.message);
      clearAuthState();

      // Clean up storage on error
      sessionStorage.removeItem("preAuthPath");
      localStorage.removeItem("preAuthPath");

      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const requireAuth = useCallback(() => {
    return false;
  }, [pageToRedirect]);

  // Check for authentication on component mount
  // Check for authentication on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const error = urlParams.get("error");
      const cookieToken = getCookie("token");
      const localStorageToken = localStorage.getItem("authToken");

      if (token || error) {
        try {
          if (token) {
            await handleGoogleCallback();
          } else if (error) {
            throw new Error(`Authentication error: ${error}`);
          }
        } catch (err) {
          console.error("❌ Google authentication initialization failed:", err);
          navigate(`/auth/login?error=${encodeURIComponent(err.message)}`, {
            replace: true,
          });
        }
      } else if (cookieToken || localStorageToken) {
        try {
          // Use the token we have
          const authToken = cookieToken || localStorageToken;

          // Sync tokens if needed
          if (!localStorageToken && cookieToken) {
            localStorage.setItem("authToken", cookieToken);
          }

          // Set auth header
          authApiService.setAuthToken(authToken);

          // Fetch user data
          await fetchUser();
        } catch (err) {
          console.error("❌ Existing authentication failed:", err);
          clearAuthState();
        }
      } else {
      }
      setAuthLoading(false);
    };

    initializeAuth();
  }, [navigate]);

  const value = {
    user,
    userRole, // Expose user role to consumers
    isAuthenticated,
    authLoading,
    authError,
    login,
    logout,
    fetchUser,
    loginWithOtp,
    initiateGoogleAuth,
    handleGoogleCallback,
    clearAuthState,
    requireAuth,
    getCookie: () => getCookie("token"),
    prepareForAuthentication,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
