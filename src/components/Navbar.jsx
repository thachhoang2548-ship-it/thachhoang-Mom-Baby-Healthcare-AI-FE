import React, { useState, useRef, useEffect, useContext } from "react";
import HealthSyncLogo from "../assets/Logo/HealthSyncLogo.png";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { updateProfileImage } from "../services/authService";

const Navbar = () => {
  const location = useLocation();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, updateUser } = useContext(AuthContext);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProfileImageUrl = (path) => {
    if (!path) return "https://lh3.googleusercontent.com/aida-public/AB6AXuCq7A7u_bex9FXa_-2s4tWovTclbrwcYKJsTUI4Y5fxd-hLOcXD8fhMAU6QyCv5QYR9FxMaLmO3tIyGouDjwIfr_a8GV-kWzCQWTjH7frTqPGRMa4rsidUWZfGl-I89qb57vrvbpisv9GY3xxt4oJE-bvhrmWP0dxCiaD-LdFB1yi1iRb_ToRi6SXEQSMt7SomcbxxfMt2WMo0mbMadtn56z1HhlATgYSoHXUXoq7iib3ubN4AE77nj8uuGW7blxohvOh9FvFdjI-rB";
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000";
    return `${baseUrl}${path}`;
  };

  const [profileImage, setProfileImage] = useState(getProfileImageUrl(user?.profileImage));

  useEffect(() => {
    setProfileImage(getProfileImageUrl(user?.profileImage));
  }, [user?.profileImage]);

  const isActive = (path) => location.pathname === path
    ? "border-primary text-gray-900 dark:text-white"
    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white";

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const objectUrl = URL.createObjectURL(file);
        setProfileImage(objectUrl);

        const formData = new FormData();
        formData.append("image", file);

        const response = await updateProfileImage(formData);
        if (response.user) updateUser(response.user);
      } catch (error) {
        console.error("Failed to upload profile image:", error);
        setProfileImage(getProfileImageUrl(user?.profileImage));
        const errorMessage = error.response?.data?.message || "Không thể cập nhật ảnh đại diện. Vui lòng thử lại.";
        alert(errorMessage);
      }
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  return (
    <header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 dark:text-white font-display">
              <span className="text-primary flex items-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-1.5 text-primary">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Mom <span className="text-pink-600 dark:text-pink-400 ml-1">Ơi!</span>
              </span>
            </Link>

            <div className="hidden items-center space-x-5 md:flex">
              <Link to="/dashboard" className={`border-b-2 pb-1 text-sm font-semibold tracking-tight ${isActive("/dashboard")}`}>Bảng điều khiển</Link>
              <Link to="/fertility" className={`border-b-2 pb-1 text-sm font-semibold tracking-tight ${isActive("/fertility")}`}>Thụ thai</Link>
              <Link to="/pregnancy" className={`border-b-2 pb-1 text-sm font-semibold tracking-tight ${isActive("/pregnancy")}`}>Thai kỳ</Link>
              <Link to="/postpartum" className={`border-b-2 pb-1 text-sm font-semibold tracking-tight ${isActive("/postpartum")}`}>Sau sinh</Link>
              <Link to="/baby-nutrition" className={`border-b-2 pb-1 text-sm font-semibold tracking-tight ${isActive("/baby-nutrition")}`}>Dinh dưỡng bé</Link>
              <Link to="/chat" className={`border-b-2 pb-1 text-sm font-semibold tracking-tight ${isActive("/chat")}`}>Trợ lý AI</Link>
            </div>
          </div>

          <div className="hidden items-center space-x-4 lg:flex">
            <span className="px-2.5 py-1 text-xs font-bold bg-pink-100 text-pink-600 rounded-full uppercase tracking-wider dark:bg-pink-900/40 dark:text-pink-300">
              {user?.subscriptionTier === "vip" ? "Super Mom VIP" : user?.subscriptionTier === "modern" ? "Mom Hiện Đại" : "Mom Khởi Đầu"}
            </span>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            <Link to="/notifications" className="relative rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">2</span>
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button className="flex items-center space-x-2" onClick={toggleDropdown}>
                <div className="size-9 rounded-full bg-cover bg-center border-2 border-primary" style={{ backgroundImage: `url('${profileImage}')` }}></div>
              </button>

              <div className={`absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition-opacity duration-200 ${dropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <button onClick={triggerFileInput} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Thay ảnh đại diện</button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                <Link to="/login" className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">Đăng xuất</Link>
              </div>
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <Link to="/notifications" className="relative mr-2 rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">2</span>
            </Link>

            <div className="size-9 rounded-full bg-cover bg-center mr-2 border border-primary" style={{ backgroundImage: `url('${profileImage}')` }}></div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
              <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0 py-0"}`}>
          <div className="space-y-2 px-2 pt-2 pb-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`block rounded-md px-3 py-2 text-base font-medium ${location.pathname === "/dashboard" ? "bg-primary/10 text-primary dark:text-primary-light font-bold" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              <div className="flex items-center gap-3"><span className="material-symbols-outlined">dashboard</span>Bảng điều khiển</div>
            </Link>
            <Link to="/fertility" onClick={() => setMobileMenuOpen(false)} className={`block rounded-md px-3 py-2 text-base font-medium ${location.pathname === "/fertility" ? "bg-primary/10 text-primary dark:text-primary-light font-bold" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              <div className="flex items-center gap-3"><span className="material-symbols-outlined">calendar_today</span>Theo dõi thụ thai</div>
            </Link>
            <Link to="/pregnancy" onClick={() => setMobileMenuOpen(false)} className={`block rounded-md px-3 py-2 text-base font-medium ${location.pathname === "/pregnancy" ? "bg-primary/10 text-primary dark:text-primary-light font-bold" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              <div className="flex items-center gap-3"><span className="material-symbols-outlined">child_care</span>Chăm sóc thai kỳ</div>
            </Link>
            <Link to="/postpartum" onClick={() => setMobileMenuOpen(false)} className={`block rounded-md px-3 py-2 text-base font-medium ${location.pathname === "/postpartum" ? "bg-primary/10 text-primary dark:text-primary-light font-bold" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              <div className="flex items-center gap-3"><span className="material-symbols-outlined">favorite</span>Chăm sóc sau sinh</div>
            </Link>
            <Link to="/baby-nutrition" onClick={() => setMobileMenuOpen(false)} className={`block rounded-md px-3 py-2 text-base font-medium ${location.pathname === "/baby-nutrition" ? "bg-primary/10 text-primary dark:text-primary-light font-bold" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              <div className="flex items-center gap-3"><span className="material-symbols-outlined">restaurant_menu</span>Dinh dưỡng cho bé</div>
            </Link>
            <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className={`block rounded-md px-3 py-2 text-base font-medium ${location.pathname === "/chat" ? "bg-primary/10 text-primary dark:text-primary-light font-bold" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              <div className="flex items-center gap-3"><span className="material-symbols-outlined">smart_toy</span>Trợ lý AI</div>
            </Link>

            <div className="my-2 h-px bg-gray-200 dark:bg-gray-700"></div>

            <button onClick={() => { triggerFileInput(); setMobileMenuOpen(false); }} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center gap-3"><span className="material-symbols-outlined">account_circle</span>Thay ảnh đại diện</div>
            </button>

            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
              <div className="flex items-center gap-3"><span className="material-symbols-outlined">logout</span>Đăng xuất</div>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
