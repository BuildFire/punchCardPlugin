class Transaction {
  constructor(data = {}) {
    this.id = data.id || null;
    this.action = data.action || ''; // ENUM
    this.customerId = data.customerId || '';
    this.employeeId = data.employeeId || '';
    this.customerName = data.customerName || '';
    this.employeeName = data.employeeName || '';
    this.changeValue = data.changeValue || 0; // changed stamps
    this.rewards = data.rewards || 0;
    this.createdOn = data.createdOn || new Date();
    this.createdBy = data.createdBy || null;
  }

    static Action = Object.freeze({
        EARNED: "earned",
        REDEEMED: 'redeemed',
        STAMPS_CHANGE: 'stampsChange',
    });

  /**
         * Convert the model to plain JSON
         * @return {Customer} A Customer object.
         */
  toJSON() {
    return {
      id: this.id,
      action: this.action,
      customerId: this.customerId,
      employeeId: this.employeeId,
      customerName: this.customerName,
      employeeName: this.employeeName,
      changeValue: this.changeValue,
      rewards: this.rewards,
      createdOn: this.createdOn,
      createdBy: this.createdBy,
      _buildfire: {
        index: {
          array1: [
            { string1: `employeeId_${this.employeeId}` },
            { string1: `customerId_${this.customerId}` }
          ],
          date1: this.createdOn,
        },
      },
    };
  }
}
