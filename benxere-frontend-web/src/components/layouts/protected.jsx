import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthStateContext } from "../../contexts/auth";

const Protected = ({ children, allowedRoles = [] }) => {
  const { isLoggedIn = false, user = null } = useContext(AuthStateContext);
  let location = useLocation();
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ path: location.pathname }} />;
  }
  
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  let userRole = user?.role?.toLowerCase();
  
  const normalizedAllowedRoles = allowedRoles.map(role => 
    role.toLowerCase().replace('busowner', 'bus_owner')
  );
  
  const normalizedUserRole = userRole?.replace('busowner', 'bus_owner');
  
  console.log(`User role: ${userRole}, Normalized: ${normalizedUserRole}`);
  console.log(`Allowed roles: ${JSON.stringify(allowedRoles)}, Normalized: ${JSON.stringify(normalizedAllowedRoles)}`);
  
  if (!normalizedUserRole || !normalizedAllowedRoles.includes(normalizedUserRole)) {
    console.log(`Access denied: User role '${userRole}' not in allowed roles [${allowedRoles.join(', ')}]`);
    
    if (userRole === 'user') {
      return <Navigate to="/" replace />;
    } else if ((userRole === 'bus_owner' || userRole === 'busowner') && location.pathname.startsWith('/admin')) {
      return <Navigate to="/bus-owner/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default Protected;
