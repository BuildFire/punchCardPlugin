// eslint-disable-next-line no-unused-vars
class Transactions {
  static get TAG() {
    return 'transactions';
  }

  static search(options = {}) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.search(
        { ...options, recordCount: true },
        Transactions.TAG,
        (err, result) => {
          if (err) return reject(err);
          const data = result.result.map((record) => {
            record.data.id = record.id;
            return new Transaction(record.data).toJSON();
          });
          resolve({ data, totalItems: result.totalRecord });
        },
      );
    });
  }

  static save(data) {
    return new Promise((resolve, reject) => {
      buildfire.publicData.insert(
        new Transaction(data).toJSON(),
        Transactions.TAG,
        (err, res) => {
          if (err) return reject(err);
          return resolve(new Transaction(res.data).toJSON());
        },
      );
    });
  }

  static bulkInsert(data) {
    return new Promise((resolve, reject) => {
      const transactions = data.map((item) => new Transaction(item).toJSON());
      buildfire.publicData.bulkInsert(
        transactions,
        Transactions.TAG,
        (err, res) => {
          if (err) return reject(err);
          return resolve(res);
        },
      );
    });
  }
}
