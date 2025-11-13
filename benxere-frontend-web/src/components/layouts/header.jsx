import { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthStateContext, AuthDispatchContext, logout } from "../../contexts/auth";
import { twMerge } from "tailwind-merge";
import Button from "../core/button";
import Typography from "../core/typography";
import Container from "./container";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authState = useContext(AuthStateContext);
  const dispatch = useContext(AuthDispatchContext);

  const handleLogout = async () => {
    await logout(dispatch);
    navigate("/");
  };

  const getNavigationItems = () => {
    if (!authState.isLoggedIn) return [];
    console.log("Auth state: " + authState.user.role) ;
    
    let navItems = [];
    const userRole = authState.user?.role?.toLowerCase();
    
    if (userRole === "admin") {
      navItems.push({ name: "Trang dành cho quản trị viên", href: "/admin/dashboard" });
    }
    
    if (userRole === "customer") {
      navItems.push({ name: "Quản lý tài khoản", href: "/account/information" });
    }
    
    if (userRole === "bus_owner") {
      navItems.push({ name: "Trang chủ cho nhà xe", href: "/bus-owner/dashboard" });
    }
    if (userRole === "customer_care") {
      navItems.push({ name: "Trang chủ cho nhân viên CSKH", href: "/customer-care/schedules" });
    }
    return navItems;
  };

  const navigation = getNavigationItems();

  const isActive = (path) => location.pathname === path;

  const navLinkClasses = (active) =>
    twMerge(
      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
      active ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"
    );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <Container>
        <nav className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img className="h-20 w-auto" src="/logo.png" alt="Ben Xe So" />
              <Typography variant="h5" className="ml-2 hidden sm:block" color="primary">
                BenXeRe
              </Typography>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href} className={navLinkClasses(isActive(item.href))}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {authState.isLoggedIn ? (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Đăng nhập
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate("/auth")}>
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={twMerge(navLinkClasses(isActive(item.href)), "block")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col space-y-2">
              {authState.isLoggedIn ? (
                  <Button variant="ghost" size="sm" block onClick={() => { setIsMenuOpen(false); handleLogout(); }}>
                  Đăng xuất 
                  </Button>
              ) : (
                  <>
                    <Button variant="ghost" size="sm" block onClick={() => { setIsMenuOpen(false); navigate("/auth"); }}>
                      Đăng nhập
                    </Button>
                    <Button variant="primary" size="sm" block onClick={() => { setIsMenuOpen(false); navigate("/auth"); }}>
                      Đăng ký
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Header;
