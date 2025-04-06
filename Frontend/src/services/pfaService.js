import axios from "axios";

const API_URL = "http://localhost:5000";

//  récupérer le token du localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMyPfas = async () => {
  return axios.get(`${API_URL}/PFA/GetMyPFAs`, {
    headers: getAuthHeaders(),
  });
};

export const addPfas = async (pfas) => {
  return axios.post(
    `${API_URL}/pfa/addPfaS`,
    { pfas },
    { headers: getAuthHeaders() }
  );
};

export const updatePfa = async (id, pfaData) => {
  return axios.patch(`${API_URL}/PFA/${id}/updateMyPfa`, pfaData, {
    headers: getAuthHeaders(),
  });
};

export const deletePfa = async (id) => {
  return axios.delete(`${API_URL}/PFA/deletepfa/${id}`, {
    headers: getAuthHeaders(),
  });
};
export const fetchPFAs = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/pfa/getPFAs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const publishPFAs = async (response) => {
  const token = localStorage.getItem("token");
  await axios.patch(
    `${API_URL}/pfa/publish/${response}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const sendPfaEmail = async () => {
  const token = localStorage.getItem("token");
  await axios.post(
    `${API_URL}/pfa/list/sendEmails`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const rejectPfa = async (id) => {
  const token = localStorage.getItem("token");
  await axios.patch(
    `${API_URL}/pfa/reject/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
