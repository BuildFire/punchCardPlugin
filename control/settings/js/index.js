// eslint-disable-next-line no-unused-vars
const SettingController = {
  tagsInput: null,
  init(settingsData) {
    this.tagsInput = new buildfire.components.control.userTagsInput('#customTagsInputContainer', {
      languageSettings: {
        placeholder: 'Select tag',
      },
    });

    this.tagsInput.onUpdate = (data) => {
      let isDifferent = false;

      // Check if the lengths are different
      if (data.tags.length !== settingsData.employeesPermissions.length) {
        isDifferent = true;
      } else {
        for (let i = 0; i < data.tags.length; i++) {
          if (data.tags[i].tagName !== settingsData.employeesPermissions[i].tagName) {
            isDifferent = true;
            break;
          }
        }
      }

      if (isDifferent) {
        settingsData.employeesPermissions = data.tags;
        Settings.save(settingsData).then(() => {
          cpShared.syncWithWidget({ cmd: 'refresh' });
        });
      }
    };
    if (settingsData.employeesPermissions.length > 0) {
      this.tagsInput.append(settingsData.employeesPermissions);
    }
  },
};

window.onload = () => {
  Settings.get().then((data) => {
    SettingController.init(data.data);
  });
};
