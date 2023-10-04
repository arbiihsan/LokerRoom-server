'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class JobApplication extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      JobApplication.belongsTo(models.User, { as: 'applicant', foreignKey: 'UserId' });
      JobApplication.belongsTo(models.JobPosting, { as: 'jobPosting', foreignKey: 'JobPostingId' });
    }
  }
  JobApplication.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    JobPostingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'JobPostings',
        key: 'id'
      }
    },
    applicationStatus: {
      type: DataTypes.ENUM,
      values: ['Accepted', 'Rejected', 'Processing'],
      allowNull: false,
      defaultValue: 'Processing'
    },
    isEmployed: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    startDateOfEmployment: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDateOfEmployment: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'JobApplication',
  });
  return JobApplication;
};