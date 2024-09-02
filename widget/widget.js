const initApp = async () => {
  widgetAppState.settings = await Settings.get();
  await AuthManager.getUserPermission();
  if (AuthManager.isEmployee) {
    EmployeeController.init();
  } else {
    await CustomerController.init();
    EmployeeController.init();
  }
};

// // window.onload = initApp;
// let newStamps = 0;
//
// window.onload = async () => {
//   widgetAppState.settings = await Settings.get();
//   await AuthManager.getUserPermission();
//   await CustomerController.handleCustomerIdGeneration();
//   newStamps = EmployeeController.incrementStamps(newStamps);
//   //newStamps = EmployeeController.decrementStamps(newStamps, widgetAppState.currentCustomer.currentStamps);
//   EmployeeController.addNewTransaction(newStamps, widgetAppState.currentCustomer.currentStamps, 10, widgetAppState.currentCustomer.availableRewards, widgetAppState.currentCustomer.lifeTimeRedeems, widgetAppState.currentCustomer);
//   const data = EmployeeController.getCustomerInfo();
//   console.log(data);
// };
