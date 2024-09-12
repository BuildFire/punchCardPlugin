// eslint-disable-next-line no-unused-vars
const TransactionController = {
  async getCustomerTransaction(options = {}) {
    try {
      return await Transactions.search(options);
    } catch (error) {
      console.error('CustomerController.getTransactions():', error);
      return error;
    }
  },
  async  getEmployeeTransaction(options = {}) {
    try {
      const { currentUser } = AuthManager;
      const searchOptions = {
        filter: { '_buildfire.index.array1.string1': `employeeId_${currentUser.userId}` },
        ...options,
      };
      return await Transactions.search(searchOptions);
    } catch (error) {
      return [];
    }
  },

  addTransactions(data) {
    return new Promise((resolve, reject) => {
      if (data.length === 1) {
        Transactions.save(data[0])
          .then((res) => resolve(res))
          .catch((error) => reject(error));
      } else {
        Transactions.bulkInsert(data)
          .then((res) => resolve(res))
          .catch((error) => reject(error));
      }
    });
  },
};
