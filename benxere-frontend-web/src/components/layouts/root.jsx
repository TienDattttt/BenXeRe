import { Suspense, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AuthProvider, { AuthStateContext } from "../../contexts/auth";
import CommonProvider from "../../contexts/common";
import Loader from "../loader";
import Header from "./header";
import Footer from "./footer";
import GlobalChatButton from "../chat/global-chat-button";

const RootWrapper = ({ routesWithoutHeaderFooter }) => {
  const location = useLocation();
  const { isLoggedIn } = useContext(AuthStateContext);
  const shouldShowHeaderFooter = !routesWithoutHeaderFooter.includes(location.pathname);

  return (
    <div className="app-container">
      {shouldShowHeaderFooter && <Header />}
      <Suspense fallback={<Loader />}>
        <div className={shouldShowHeaderFooter ? "bg-slate-200 min-h-[calc(100vh-136px)]" : "min-h-screen"}>
          <Outlet />
        </div>
      </Suspense>
      {shouldShowHeaderFooter && <Footer />}
      {isLoggedIn && shouldShowHeaderFooter && <GlobalChatButton />}
    </div>
  );
};

function Root(props) {
  return (
    <AuthProvider>
      <CommonProvider>
        <RootWrapper {...props} />
      </CommonProvider>
    </AuthProvider>
  );
}

export default Root;
