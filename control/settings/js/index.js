// eslint-disable-next-line no-unused-vars
const SettingView = {
  tagsInput: null,
  async init() {
    const { settingData } = await Settings.get();
    this.tagsInput = new buildfire.components.control.userTagsInput('#customTagsInputContainer', {
      languageSettings: {
        placeholder: 'Select tag',
      },
    });

    this.tagsInput.onUpdate = (data) => {
      let isDifferent = false;

      // Check if the lengths are different
      if (data.tags.length !== settingData.employeeTags.length) {
        isDifferent = true;
      } else {
        for (let i = 0; i < data.tags.length; i++) {
          if (data.tags[i].tagName !== settingData.employeeTags[i].tagName) {
            isDifferent = true;
            break;
          }
        }
      }

      if (isDifferent) {
        settingData.employeeTags = data.tags;
        Settings.save(settingData).then(() => {
          cpShared.syncWithWidget({ cmd: 'refresh' });
        });
      }
    };
    if (settingData.employeeTags.length > 0) {
      this.tagsInput.append(settingData.employeeTags);
    }
  },
};

window.onload = () => {
  SettingView.init();
};
