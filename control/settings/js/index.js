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
      Settings.save(data);
    };
    if (settingsData.employeesPermissions) {
      this.tagsInput.set([{
        value: settingsData.employeesPermissions,
        tagName: settingsData.employeesPermissions,
      }]);
    }
  },
};

window.onload = () => {
  Settings.get().then((data) => {
    SettingController.init(data);
  });
};
