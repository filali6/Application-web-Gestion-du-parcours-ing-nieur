import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const loginUnified = async ({ identifier, password }) => {
  // Try admin login (email)
  try {
    const res = await axios.post(`${API_BASE}/auth/loginAdmin`, {
      email: identifier,
      password
    });
    const { token } = res.data;
    const decoded = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('token', token);
    localStorage.setItem('role', decoded.role);
    localStorage.setItem('name', 'Admin');
    return res.data;
  } catch (err) {
    // Try teacher login (cin)
    try {
      const res = await axios.post(`${API_BASE}/auth/loginTeacher`, {
        cin: identifier,
        password
      });
      const { token, user } = res.data;
      const decoded = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('token', token);
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('name', `${user.firstName} ${user.lastName}`);
      return res.data;
    } catch (err) {
      // Try student login (cin)
      const res = await axios.post(`${API_BASE}/auth/loginStudent`, {
        cin: identifier,
        password
      });
      const { token, user } = res.data;
      const decoded = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('token', token);
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('name', `${user.firstName} ${user.lastName}`);
      return res.data;
    }
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
};
