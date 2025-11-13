import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import AccountSidebarLayout from "../../components/layouts/account-sidebar-layout";
import { getMyInfo, updateMyInfo } from "../../services/user-service";
import '../../styles/account-modern-theme.css';
import '../../styles/account-content-theme.css';

const ProfileCard = ({ form }) => (
  <motion.div
    className="content-card p-8 mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex items-center gap-8">
      {/* Avatar Section */}
      <div className="relative">
        <motion.div
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {form.firstName?.[0]?.toUpperCase() || "U"}
        </motion.div>
        <motion.div
          className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 blur-xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      {/* User Info */}
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="page-title mb-4">
            {form.firstName || "User"} {form.lastName}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                📧
              </div>
              <span>{form.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                📱
              </div>
              <span>{form.phoneNumber || "Chưa cập nhật"}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status Badge */}
      <div className="status-badge success">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Verified Account
      </div>
    </div>
  </motion.div>
);

const Information = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userData = await getMyInfo();
      setForm({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
      });
      setError(null);
    } catch (err) {
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      await updateMyInfo(form);
      setSuccessMessage("Thông tin đã được cập nhật thành công!");
    } catch (err) {
      setError("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AccountSidebarLayout>
        <div className="content-loading">
          <div className="loading-spinner"></div>
        </div>
      </AccountSidebarLayout>
    );
  }

  return (
    <AccountSidebarLayout>
      <div className="content-container max-w-4xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Thông tin cá nhân</h1>
          <p className="page-description">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Profile Card */}
        <ProfileCard form={form} />

        {/* Form Section */}
        <motion.div
          className="content-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="section-header">Cập nhật thông tin</h3>

          <form onSubmit={handleSubmit}>
            <AnimatePresence>
              {error && (
                <motion.div
                  className="status-badge error w-full mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <span>⚠️</span>
                  <p>{error}</p>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  className="status-badge success w-full mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <span>✅</span>
                  <p>{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="form-group">
                <label className="form-label">
                  Họ<span className="text-red-500">*</span>
                </label>
                <motion.input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label className="form-label">
                  Tên<span className="text-red-500">*</span>
                </label>
                <motion.input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                Email<span className="text-red-500">*</span>
              </label>
              <motion.input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="form-input"
                required
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                Số điện thoại
              </label>
              <motion.input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleInputChange}
                className="form-input"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={saving}
                className="content-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <span>Cập nhật thông tin</span>
                    <span>✨</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AccountSidebarLayout>
  );
};

export default Information;