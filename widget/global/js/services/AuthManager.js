const AuthManager = {
  _currentUser: {},
  _isEmployee: false,
  get currentUser() {
    return AuthManager._currentUser;
  },
  set currentUser(user) {
    AuthManager._currentUser = user;
  },

  get isEmployee() {
    return AuthManager._isEmployee;
  },
  set isEmployee(isEmployee) {
    AuthManager._isEmployee = isEmployee;
  },
  getUserPermission() {
    return new Promise((resolve) => {
      buildfire.auth.getCurrentUser((err, user) => {
        this.currentUser = user;
        const { appId } = buildfire.getContext();
        const userTags = user.tags && user.tags[appId] ? user.tags[appId].map((t) => t.tagName) : [];
        if (widgetAppState.settings.employeesPermissions.some((p) => userTags.includes(p))) {
          AuthManager.isEmployee = true;
        }
        resolve();
      });
    });
  },

  getUserProfile(userId) {
    return new Promise((resolve, reject) => {
      buildfire.auth.getUserProfile({ userId }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  },
};
