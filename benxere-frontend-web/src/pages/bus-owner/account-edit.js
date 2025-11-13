import React from 'react';
import Sidebar from '../../components/layouts/bus-owner/sidebar';

function AccountEdit() {
  return (
    <div style={styles.container}>
      <Sidebar />

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h2>Chỉnh sửa nhân viên</h2>
        </div>
        <form style={styles.form}>
          <div style={styles.formGroup}>
            <label>Họ và tên</label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              defaultValue="Nguyễn Văn A"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Số điện thoại</label>
            <input
              type="text"
              placeholder="0987654321"
              defaultValue="0987654321"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Chức vụ</label>
            <select defaultValue="Nhân viên" style={styles.input}>
              <option value="Nhân viên">Nhân viên</option>
              <option value="Quản lý">Quản lý</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label>Chi nhánh/Đại lý</label>
            <select defaultValue="Văn phòng A" style={styles.input}>
              <option value="Văn phòng A">Văn phòng A</option>
              <option value="Văn phòng B">Văn phòng B</option>
            </select>
          </div>
          <button type="submit" style={styles.button}>
            Lưu
          </button>
        </form>
        <div style={styles.backLink}>
          <a href="#!" style={styles.link}>Trở về Danh sách Nhân viên</a>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  mainContent: {
    flex: 1,
    padding: '2rem',
    background: '#f9f9f9',
  },
  header: {
    borderBottom: '1px solid #ccc',
    marginBottom: '2rem',
  },
  form: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    margin: '0.5rem 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    padding: '0.7rem 1.5rem',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  backLink: {
    marginTop: '2rem',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default AccountEdit;