// eslint-disable-next-line no-unused-vars
const handleCPSync = {
  syncTimeOut: null,
  receivedMessage() {
    buildfire.messaging.onReceivedMessage = async (data) => {
      if (data.cmd === 'refresh') {
        window.location.reload();
      } else if (data.cmd === 'contentChanged') {
        if (data.data.rewardName) {
          widgetAppState.settings.rewardName = data.data.rewardName;
        }
        if (data.data.content || data.data.content === '') {
          widgetAppState.settings.introductionWYSIWYG = data.data.content;
        }
        if (widgetAppRouter.currentPage) return;
        CustomerView._initListView();
        CustomerView._initValues();
      } else if (data.cmd === 'cardChanged') {
        if (data.data.cardSize) {
          widgetAppState.settings.cardSize = data.data.cardSize;
          const result = await CustomerController.getCustomerInfo(widgetAppState.currentCustomer.friendlyId,
            widgetAppState.settings.cardSize);
          if (result.currentStamps) {
            widgetAppState.currentCustomer.currentStamps = result.currentStamps;
            widgetAppState.currentCustomer.availableRewards = result.availableRewards;
          }
          widgetAppState.currentStamps = widgetAppState.currentCustomer.currentStamps;
          widgetAppState.availableRewards = widgetAppState.currentCustomer.availableRewards;
          const userData = await AuthManager.getUserProfile(widgetAppState.currentCustomer.customerId);
          widgetAppState.currentCustomer.userName = userName(userData);
          const user = await AuthManager.getUserProfile(widgetAppState.currentCustomer.customerId);
          widgetAppState.currentCustomer.imageUrl = user?.imageUrl ? user.imageUrl : 'https://app.buildfire.com/app/media/avatar.png';
        }

        if (widgetAppRouter.currentPage) return;
        CustomerView.drawStamps(widgetAppState.settings.cardSize);
        if (AuthManager.isEmployee) {
          CustomerView._initRewardList();
        }
      } else if (data.cmd === 'designChanged') {
        widgetAppState.settings.design = data.data.design;
        if (widgetAppRouter.currentPage) return;
        CustomerView.drawStamps(widgetAppState.settings.cardSize);
      }
    };
  },

};
