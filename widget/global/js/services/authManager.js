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
  refreshCurrentUser() {
    return new Promise((resolve) => {
      buildfire.auth.getCurrentUser((err, user) => {
        AuthManager.currentUser = err || !user ? null : user;
        resolve();
      });
    });
  },
  getUserPermission() {
    return new Promise((resolve) => {
      buildfire.auth.getCurrentUser((err, user) => {
        AuthManager.currentUser = user;
        const { appId } = buildfire.getContext();
        const userTags = user?.tags && user.tags[appId] ? user.tags[appId].map((t) => t.tagName) : [];
        if (widgetAppState.settings.employeeTags.some((p) => userTags.includes(p.value))) {
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
