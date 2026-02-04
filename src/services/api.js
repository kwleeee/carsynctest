import axios from 'axios';//import axios for api requests 

const API_BASE_URL = 'http://localhost:5000/api';//base url for backend server
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });//create axios instance with base url and json headers

//interceptors for centralized authentication - adds JWT token to every request if available
api.interceptors.request.use((config) => {//before any request is sent, this function runs (interceptors = dont have to manually find & add token to each request)
  const token = localStorage.getItem('token');//get token from localStorage
  if (token) config.headers.Authorization = `Bearer ${token}`;//bearer of this token is authorized to access data
  return config;//return modified config
});

export const vehicleService = {//constant object vehicleService with methods for vehicle related API calls
  fetchVehicles: async (userId) => {//fetch vehicles for specific user by userId but must wait for response (async)
    const res = await api.get(`/users/${userId}/vehicles`);//response = vehicles under a certain userID 
    return res.data;//return data from response
  },
  addVehicle: async (userId, vehicleData) => {//add vehicle for specific user by userId with vehicleData
    const res = await api.post(`/users/${userId}/vehicles`, vehicleData);//response = post vehicleData to userID
    return res.data;//return data from response
  },
  updateVehicle: async (vehicleId, vehicleData) => {//update vehicle by vehicleId with vehicleData
    const res = await api.put(`/vehicles/${vehicleId}`, vehicleData);//response = put vehicleData to vehicleId 
    return res.data;
  },
  deleteVehicle: async (vehicleId) => {//delete vehicle by vehicleId
    const res = await api.delete(`/vehicles/${vehicleId}`);//response = delete vehicleId
    return res.data;//return data from response
  }
};

export const appointmentService = {
  fetchAppointments: async (userId) => {
    const res = await api.get(`/users/${userId}/appointments`);
    return res.data;
  },
  bookAppointment: async (appointmentData) => {//book new appointment with appointmentData
    const res = await api.post('/appointments', appointmentData);
    return res.data;
  },
  cancelAppointment: async (id, reason) => {
    const res = await api.put(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },
  fetchMechanicAppointments: async () => {
    const res = await api.get('/mechanic/appointments');
    return res.data;
  },
  updateAppointmentStatus: async (id, status) => {
    const res = await api.put(`/appointments/${id}/status`, { status });//update appointment status by id with new status
    return res.data;
  }
};

export const invoiceService = {
  fetchInvoices: async (userId) => {
    const res = await api.get(`/users/${userId}/invoices`);
    return res.data;
  },
  fetchMaintenanceLogs: async (userId) => {
    const res = await api.get(`/users/${userId}/maintenance`);
    return res.data;
  },
  createInvoice: async (invoiceData) => {
    const res = await api.post('/invoices', invoiceData);
    return res.data;
  }
};

export const userService = {
  login: async (creds) => {//login with credentials
    const res = await api.post('/auth/login', creds);//response = post creds to auth/login
    if (res.data.success) {//if login successful
      localStorage.setItem('token', res.data.token);//set token in localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));//set user data in localStorage as string
    }
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  fetchAllUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  updateUserByAdmin: async (userId, userData) => {
    const res = await api.put(`/admin/users/${userId}`, userData);
    return res.data;
  },
  deleteUser: async (userId) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  }
};

const apiServices = { vehicleService, userService, appointmentService, invoiceService };
export default apiServices;