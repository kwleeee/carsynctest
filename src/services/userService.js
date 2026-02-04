//user service for authentication and user management
import { validateAdminKey } from '../utils/userRoles';

export const userService = {
  //register new user
  register: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          
          //check if user exists
          if (users.some(user => user.email === userData.email)) {
            reject(new Error('Email already registered'));
            return;
          }

          //validate admin key if registering as admin
          if (userData.role === 'admin') {
            if (!validateAdminKey(userData.adminKey)) {
              reject(new Error('Invalid admin key'));
              return;
            }
          }

          const newUser = {
            id: Date.now(),
            ...userData,
            role: userData.role || 'vehicle_owner',
            createdAt: new Date().toISOString(),
            isActive: true,
            lastLogin: null,
            preferences: {
              notifications: true,
              theme: 'dark',
              ...userData.preferences,
            },
            vehicles: []
          };

          //remove admin key from stored user data (for security)
          delete newUser.adminKey;

          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          
          resolve(newUser);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  },

  //login 
  login: async (email, password) => {
    return new Promise((resolve, reject) => {//creates a wait state and tells react response when done
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const user = users.find(u => u.email === email && u.password === password);
          
          if (user) {
            //remove password from returned user object
            const { password, ...userWithoutPassword } = user;
            
            //update last login
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
            
            resolve(userWithoutPassword);
          } else {
            reject(new Error('Invalid email or password'));
          }
        } catch (error) {
          reject(error);
        }
      }, 1000);//wait 1000 ms
    });
  },

  //get current user
  getCurrentUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  //get user role
  getUserRole: () => {
    const user = userService.getCurrentUser();
    return user?.role || 'vehicle_owner';
  },

  //check if user is admin
  isAdmin: () => {
    const role = userService.getUserRole();
    return role === 'admin';
  },

  //check if user is mechanic
  isMechanic: () => {
    const role = userService.getUserRole();
    return role === 'mechanic';
  },

  //check if user is vehicle owner
  isVehicleOwner: () => {
    const role = userService.getUserRole();
    return role === 'vehicle_owner';
  },

  //update user profile
  updateProfile: async (userId, updates) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            reject(new Error('User not found'));
            return;
          }

          users[userIndex] = { ...users[userIndex], ...updates };
          localStorage.setItem('users', JSON.stringify(users));
          
          //update current session
          const currentUser = localStorage.getItem('user');
          if (currentUser) {
            const userObj = JSON.parse(currentUser);
            if (userObj.id === userId) {
              const updatedUser = { ...userObj, ...updates };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }

          resolve(users[userIndex]);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  },

  //get all users (admin only)
  getAllUsers: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        // Remove passwords for security
        const usersWithoutPasswords = users.map(({ password, ...user }) => user);
        resolve(usersWithoutPasswords);
      }, 500);
    });
  },

  //delete user (admin only)
  deleteUser: async (userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const filteredUsers = users.filter(user => user.id !== userId);
          
          localStorage.setItem('users', JSON.stringify(filteredUsers));
          
          //if deleting current user, log them out
          const currentUser = userService.getCurrentUser();
          if (currentUser && currentUser.id === userId) {
            userService.logout();
          }
          
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  },

  //logout
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  },

  //check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  },

  //change password
  changePassword: async (userId, currentPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            reject(new Error('User not found'));
            return;
          }

          //verify current password
          if (users[userIndex].password !== currentPassword) {
            reject(new Error('Current password is incorrect'));
            return;
          }

          //update password
          users[userIndex].password = newPassword;
          localStorage.setItem('users', JSON.stringify(users));
          
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  },

  //forgot password
  resetPassword: async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const user = users.find(u => u.email === email);
          
          if (!user) {
            reject(new Error('Email not found'));
            return;
          }
          resolve({
            success: true,
            message: 'Password reset instructions sent to your email'
          });
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  },

  //update user preferences
  updatePreferences: async (userId, preferences) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            reject(new Error('User not found'));
            return;
          }

          users[userIndex].preferences = {
            ...users[userIndex].preferences,
            ...preferences
          };
          
          localStorage.setItem('users', JSON.stringify(users));
          
          //update current session
          const currentUser = localStorage.getItem('user');
          if (currentUser) {
            const userObj = JSON.parse(currentUser);
            if (userObj.id === userId) {
              userObj.preferences = users[userIndex].preferences;
              localStorage.setItem('user', JSON.stringify(userObj));
            }
          }
          
          resolve(users[userIndex]);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  //add vehicle to user
  addUserVehicle: async (userId, vehicleId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            reject(new Error('User not found'));
            return;
          }

          if (!users[userIndex].vehicles) {
            users[userIndex].vehicles = [];
          }

          if (!users[userIndex].vehicles.includes(vehicleId)) {
            users[userIndex].vehicles.push(vehicleId);
          }

          localStorage.setItem('users', JSON.stringify(users));
          
          //update current session
          const currentUser = localStorage.getItem('user');
          if (currentUser) {
            const userObj = JSON.parse(currentUser);
            if (userObj.id === userId) {
              userObj.vehicles = users[userIndex].vehicles;
              localStorage.setItem('user', JSON.stringify(userObj));
            }
          }
          
          resolve(users[userIndex]);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },
};

export default userService;