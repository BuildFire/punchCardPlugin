// eslint-disable-next-line no-unused-vars
const TransactionController = {
  async getCustomerTransaction() {
    try {
      const { currentUser } = AuthManager;
      const transactions = await Transactions.search({
        filter: { '_buildfire.index.array1.string1': `customerId_${currentUser.userId}` },
      });
      console.log(transactions);
    } catch (error) {
      console.error('CustomerController.getTransactions():', error);
    }
  },
  async  getEmployeeTransaction() {
    try {
      const { currentUser } = AuthManager;
      const transactions = await Transactions.search({
        filter: { '_buildfire.index.array1.string1': `employeeId_${currentUser.userId}` },
      });
      return transactions.data.filter(
        (transaction) => transaction.action === Transaction.Action.STAMPS_CHANGE
          || transaction.action === Transaction.Action.REDEEMED,
      );
    } catch (error) {
      return [];
    }
  },

  addTransactions(data) {
    if (data.length === 1) Transactions.save(data[0]).then((res) => {  });
    else {
      Transactions.bulkInsert(data).then((res) => {});
    }
  },

};
