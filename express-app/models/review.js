'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(models.User, { as: 'employer', foreignKey: 'EmployerId' });
      Review.belongsTo(models.User, { as: 'user', foreignKey: 'UserId' });
      Review.belongsTo(models.JobPosting, { as: 'jobPosting', foreignKey: 'JobPostingId' });
    }
  }
  Review.init({
    EmployerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      allowNull: true
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      allowNull: true
    },
    JobPostingId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'JobPostings',
        key: 'id'
      },
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: 'Review content is required' },
        notEmpty: { msg: 'Review content is required' }
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Review rating is required' },
        notEmpty: { msg: 'Review rating is required' },
        min: {
          args: 1,
          msg: 'Review rating cannot be less than 1'
        },
        max: {
          args: 5,
          msg: 'Review rating cannot be more than 5'
        },
      }
    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};