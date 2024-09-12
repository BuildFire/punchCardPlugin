// eslint-disable-next-line no-unused-vars
const CustomerController = {
  async handleCustomerIdGeneration() {
    try {
      const { currentUser } = AuthManager;
      [widgetAppState.currentCustomer] = await Customers.search({
        filter: { '_buildfire.index.array1.string1': `customerId_${currentUser.userId}` },
        limit: 1,
      });
      if (!widgetAppState.currentCustomer) {
        const code = await UserCodeSequences.generateUserCode();
        widgetAppState.currentCustomer = await Customers.save({
          friendlyId: code,
        });
      }
    } catch (error) {
      console.error('CustomerController.handleCustomerIdGeneration():', error);
    }
  },

  incrementStamps(newStamps) {
    if (!AuthManager.isEmployee) {
      throw new Error('Only employees can increment stamps');
    }
    return newStamps + 1;
  },

  decrementStamps(newStamps, currentStamps) {
    if (!AuthManager.isEmployee) {
      throw new Error('Only employees can increment stamps');
    }
    if (currentStamps === 0) {
      return currentStamps;
    }
    return newStamps - 1;
  },

  getAvailbleRewardLength(newStamps, currentStamps, cardSize) {
    return Math.floor((newStamps + currentStamps) / cardSize);
  },

  redeem(newStamps, currentStamps, cardSize, availableRewards, lifeTimeRedeems, numberOfSelectedReward) {
    if (numberOfSelectedReward === 0) {
      return {
        availableRewards,
        lifeTimeRedeems,
      };
    }

    if (availableRewards.length >= numberOfSelectedReward) {
      availableRewards.splice(0, numberOfSelectedReward);
      lifeTimeRedeems += numberOfSelectedReward;
    } else if (this.getAvailbleRewardLength(newStamps, currentStamps, cardSize) >= numberOfSelectedReward) {
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
      // eslint-disable-next-line no-plusplus
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
  async addNewTransaction(newStamps, currentStamps, cardSize, availableRewards, lifeTimeRedeems,
    currentCustomer, numberOfSelectedReward) {
    if (!AuthManager.isEmployee) {
      throw new Error('Only employees can increment stamps');
    }
    let { availableRewards: updatedRewards, currentStamps: updatedStamps } = this.addRewards(newStamps,
      currentStamps, cardSize, availableRewards, AuthManager.currentUser);

    const result = this.redeem(newStamps, currentStamps, cardSize, updatedRewards, lifeTimeRedeems, numberOfSelectedReward);
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
    return await Customers.update(currentCustomer.id, payload).then(async () => {
      const customerProfile = await AuthManager.getUserProfile(currentCustomer.customerId);
      const availbleRewardLength = this.getAvailbleRewardLength(newStamps, currentStamps, cardSize);
      const transactions = [];

      if (newStamps !== 0) {
        transactions.push(new Transaction({
          action: Transaction.Action.STAMPS_CHANGE,
          customerId: currentCustomer.customerId,
          employeeId: AuthManager.currentUser._id,
          customerName: userName(customerProfile),
          employeeName: userName(AuthManager.currentUser),
          changeValue: newStamps,
          createdBy: AuthManager.currentUser._id,
        }));
      }
      if (availbleRewardLength > 0) {
        transactions.push(new Transaction({
          action: Transaction.Action.EARNED,
          customerId: currentCustomer.customerId,
          employeeId: AuthManager.currentUser._id,
          customerName: userName(customerProfile),
          employeeName: userName(AuthManager.currentUser),
          rewards: availbleRewardLength,
          createdBy: AuthManager.currentUser._id,
        }));
      }
      if (lifeTimeRedeems > currentCustomer.lifeTimeRedeems) {
        transactions.push(new Transaction({
          action: Transaction.Action.REDEEMED,
          customerId: currentCustomer.customerId,
          employeeId: AuthManager.currentUser._id,
          customerName: userName(customerProfile),
          employeeName: userName(AuthManager.currentUser),
          rewards: lifeTimeRedeems - currentCustomer.lifeTimeRedeems,
          createdBy: AuthManager.currentUser._id,
        }));
      }
      if (transactions.length > 0) {
        await TransactionController.addTransactions(transactions);
        if (newStamps > 0) {
          AnalyticsManager.trackAction('staffStampsGiven', { _buildfire: { aggregationValue: newStamps } });
        }

        if (lifeTimeRedeems > currentCustomer.lifeTimeRedeems) {
          AnalyticsManager.trackAction('staffRewardsRedeemed', {
            _buildfire: { aggregationValue: lifeTimeRedeems - currentCustomer.lifeTimeRedeems },
          });
        }
        if (availbleRewardLength > 0) {
          AnalyticsManager.trackAction('staffRewardsApproved', { _buildfire: { aggregationValue: availbleRewardLength } });
          NotificationsManager.sendEarnedReward(currentCustomer.customerId);
        }
      }
      return {
        newStamps,
        newRewards: availbleRewardLength,
        redeems: lifeTimeRedeems - currentCustomer.lifeTimeRedeems,
      };
    }).catch((error) => {
      console.error('Error updating customer', error);
      throw error;
    });
  },

  isCardSizeChanged(currentStamps, cardSize, availableRewards) {
    if (cardSize <= currentStamps) {
      const { availableRewards: updatedRewards, currentStamps: updatedStamps } = this.addRewards(0,
        currentStamps, cardSize, availableRewards, widgetAppState.currentCustomer);
      availableRewards = updatedRewards;
      currentStamps = updatedStamps;
      return {
        currentStamps,
        availableRewards,
      };
    }
    return false;
  },
  async  getCustomerInfo(friendlyId, cardSize) {
    [widgetAppState.currentCustomer] = await Customers.search({
      filter: { '_buildfire.index.array1.string1': `friendlyId_${friendlyId}` },
      limit: 1,
    });
    if (!widgetAppState.currentCustomer) {
      throw new Error('Customer does not exist');
    }

    const { currentStamps, availableRewards } = this.isCardSizeChanged(widgetAppState.currentCustomer.currentStamps,
      cardSize, widgetAppState.currentCustomer.availableRewards);
    return {
      currentStamps,
      availableRewards,
    };
  },

};
