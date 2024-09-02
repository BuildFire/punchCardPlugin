// eslint-disable-next-line no-unused-vars
class Customer {
  /**
     * Create a Customer model.
     * @param {object} data - model value
     */
  constructor(data = {}) {
    this.id = data.id || null;
    this.customerId = data.customerId;
    this.customerUserId = data.customerUserId;
    this.currentStamps = data.currentStamps || 0;
    this.lifeTimeStamps = data.lifeTimeStamps || 0;
    this.lifeTimeRedeems = data.lifeTimeRedeems || 0;
    this.availableRewards = data.availableRewards || [];
    this.createdOn = data.createdOn || new Date();
    this.createdBy = data.createdBy || null;
    this.updatedOn = data.updatedOn || new Date();
    this.updatedBy = data.updatedBy || null;
    this.isActive = data.isActive || true;
  }

  /**
     * Convert the model to plain JSON
     * @return {Customer} A Customer object.
     */
  toJSON() {
    return {
      id: this.id,
      customerId: this.customerId,
      customerUserId: this.customerUserId,
      currentStamps: this.currentStamps,
      lifeTimeStamps: this.lifeTimeStamps,
      lifeTimeRedeems: this.lifeTimeRedeems,
      availableRewards: this.availableRewards,
      createdOn: this.createdOn,
      createdBy: this.createdBy,
      updatedOn: this.updatedOn,
      updatedBy: this.updatedBy,
      isActive: this.isActive,
      _buildfire: {
        index: { string1: this.customerId },
      },
    };
  }
}
