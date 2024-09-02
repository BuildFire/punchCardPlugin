// eslint-disable-next-line no-unused-vars
class Setting {
  constructor(data = {}) {
    this.design = data.design || {};
    this.introductionWYSIWYG = data.introductionWYSIWYG || '';
    this.rewardName = data.rewardName || 'Reward';
    this.cardSize = data.cardSize || 10;
    this.employeesPermissions = data.employeesPermissions || ['admin'];
    this.createdOn = data.createdOn || new Date();
    this.createdBy = data.createdBy || null;
    this.lastUpdatedOn = data.lastUpdatedOn || new Date();
    this.lastUpdatedBy = data.lastUpdatedBy || null;
  }

  toJSON() {
    return {
      design: this.design,
      introductionWYSIWYG: this.introductionWYSIWYG,
      rewardName: this.rewardName,
      cardSize: this.cardSize,
      employeesPermissions: this.employeesPermissions,
      createdOn: this.createdOn,
      createdBy: this.createdBy,
      lastUpdatedOn: this.lastUpdatedOn,
      lastUpdatedBy: this.lastUpdatedBy,
    };
  }
}
