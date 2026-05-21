const storage = {
  getUser:   ()    => JSON.parse(localStorage.getItem('pragfy_user') || 'null'),
  setUser:   (u)   => localStorage.setItem('pragfy_user', JSON.stringify(u)),
  clearUser: ()    => localStorage.removeItem('pragfy_user')
};
