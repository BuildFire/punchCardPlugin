// eslint-disable-next-line no-unused-vars
const CustomerController = {
  async handleCustomerIdGeneration() {
    try {
      const { currentUser } = AuthManager;
      [widgetAppState.currentCustomer] = await Customers.search({
        filter: { '_buildfire.index.string1': currentUser.userId },
        limit: 1,
      });
      if (!widgetAppState.currentCustomer) {
        const code = await UserCodeSequences.generateUserCode();
        widgetAppState.currentCustomer = await Customers.save({
          customerUserId: code,
        });
        console.log(widgetAppState.currentCustomer);
      }
    } catch (error) {
      console.error('CustomerController.handleCustomerIdGeneration():', error);
    }
  },

};
