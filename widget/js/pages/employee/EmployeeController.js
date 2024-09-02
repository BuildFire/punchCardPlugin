// eslint-disable-next-line no-unused-vars
const EmployeeController = {

  incrementStamps(newStamps) {
    return newStamps + 1;
  },

  decrementStamps(newStamps, currentStamps) {
    if (currentStamps === 0) {
      return currentStamps;
    }
    return newStamps - 1;
  },

  getAvailbleRewardLength(newStamps, currentStamps, cardSize) {
    return Math.floor((newStamps + currentStamps) / cardSize);
  },

  redeem(availableRewards, lifeTimeRedeems, numberOfSelectedReward) {
    if (availableRewards.length >= numberOfSelectedReward) {
      availableRewards.splice(0, numberOfSelectedReward);
      lifeTimeRedeems += numberOfSelectedReward;
    } else if (this.getAvailbleRewardLength() >= numberOfSelectedReward) {
      lifeTimeRedeems += numberOfSelectedReward;
    }
    return {
      availableRewards,
      lifeTimeRedeems,
    };
  },

  addRewards(newStamps, currentStamps, cardSize, availableRewards, currentUser) {
    const availbleRewardLength = this.getAvailbleRewardLength(newStamps, currentStamps, cardSize);
    if (availbleRewardLength > 0) {
      for (let i = 0; i < availbleRewardLength; i++) {
        availableRewards.push({
          grantedBy: currentUser._id,
          grantedOn: new Date(),
        });
      }
      currentStamps = newStamps + currentStamps - (availbleRewardLength * cardSize);
    } else {
      currentStamps = newStamps + currentStamps;
    }
    return {
      availableRewards,
      currentStamps,
    };
  },

  async addNewTransaction(newStamps, currentStamps, cardSize, availableRewards, lifeTimeRedeems, currentCustomer) {
    let { availableRewards: updatedRewards, currentStamps: updatedStamps } = this.addRewards(newStamps, currentStamps, cardSize, availableRewards, AuthManager.currentUser);

    const result = this.redeem(updatedRewards, lifeTimeRedeems, 0);
    updatedRewards = result.availableRewards;
    lifeTimeRedeems = result.lifeTimeRedeems;
    const payload = {
      ...currentCustomer,
      currentStamps: updatedStamps,
      lifeTimeStamps: currentCustomer.lifeTimeStamps + newStamps,
      lifeTimeRedeems,
      availableRewards: updatedRewards,
      updatedBy: AuthManager.currentUser._id,
    };
    await Customers.update(currentCustomer.id, payload).then(async () => {
      const customerProfile = await AuthManager.getUserProfile(currentCustomer.customerId);
      const availbleRewardLength = this.getAvailbleRewardLength(newStamps, currentStamps, cardSize);
      const transactions = [];
      if (newStamps !== 0) {
        transactions.push(new Transaction({
          action: Transaction.Action.STAMPS_CHANGE,
          customerId: currentCustomer.customerId,
          employeeId: AuthManager.currentUser._id,
          customerName: utils.userName(customerProfile),
          employeeName: utils.userName(AuthManager.currentUser.name),
          changeValue: newStamps,
          createdBy: AuthManager.currentUser._id,
        }));
      }
      if (availbleRewardLength > 0) {
        transactions.push(new Transaction({
          action: Transaction.Action.EARNED,
          customerId: currentCustomer.customerId,
          employeeId: AuthManager.currentUser._id,
          customerName: utils.userName(customerProfile),
          employeeName: utils.userName(AuthManager.currentUser.name),
          rewards: availbleRewardLength,
          createdBy: AuthManager.currentUser._id,
        }));
      }
      if (lifeTimeRedeems > currentCustomer.lifeTimeRedeems) {
        transactions.push(new Transaction({
          action: Transaction.Action.REDEEMED,
          customerId: currentCustomer.customerId,
          employeeId: AuthManager.currentUser._id,
          customerName: utils.userName(customerProfile),
          employeeName: utils.userName(AuthManager.currentUser.name),
          rewards: lifeTimeRedeems - currentCustomer.lifeTimeRedeems,
          createdBy: AuthManager.currentUser._id,
        }));
      }
      if (transactions.length > 0) {
        TransactionController.addTransactions(transactions);
      }
    });
  },

  isCardSizeChanged(currentStamps, cardSize, availableRewards) {
    if (cardSize <= currentStamps) {
      const { availableRewards: updatedRewards, currentStamps: updatedStamps } = this.addRewards(0, currentStamps, cardSize, widgetAppState.currentCustomer.availableRewards, AuthManager.currentUser);
      availableRewards = updatedRewards;
      currentStamps = updatedStamps;
      return {
        currentStamps,
        availableRewards,
      };
    }
    return false;
  },
  getCustomerInfo() {
    const { currentStamps, availableRewards } = this.isCardSizeChanged(widgetAppState.currentCustomer.currentStamps, widgetAppState.settings.cardSize, widgetAppState.currentCustomer.availableRewards);
    return {
      currentStamps,
      availableRewards,
    };
  },
};
