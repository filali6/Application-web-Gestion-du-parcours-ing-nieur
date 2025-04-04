import axios from "axios";

const API_URL = "http://localhost:5000/pfa";

export const fetchPFAs = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/getPFAs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const publishPFAs = async (response) => {
  const token = localStorage.getItem("token");
  await axios.patch(
    `${API_URL}/publish/${response}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const sendPfaEmail = async () => {
  const token = localStorage.getItem("token");
  await axios.post(
    `${API_URL}/list/sendEmails`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const rejectPfa = async (id) => {
  const token = localStorage.getItem("token");
  await axios.patch(
    `${API_URL}/reject/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
