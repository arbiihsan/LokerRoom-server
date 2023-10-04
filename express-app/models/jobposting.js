'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class JobPosting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      JobPosting.belongsTo(models.Category, { as: 'category', foreignKey: 'CategoryId' });
      JobPosting.belongsTo(models.User, { as: 'author', foreignKey: 'AuthorId' });
      JobPosting.belongsTo(models.EducationLevel, { as: 'requiredEducation', foreignKey: 'RequiredEducation' });
      JobPosting.hasMany(models.JobApplication, { foreignKey: 'JobPostingId' });
      JobPosting.hasMany(models.Review, { foreignKey: 'JobPostingId' });
    }
  }
  JobPosting.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Title is required' },
        notEmpty: { msg: 'Title is required' }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Description is required' },
        notEmpty: { msg: 'Description is required' }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Address is required' },
        notEmpty: { msg: 'Address is required' }
      }
    },
    long: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    minSalary: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxSalary: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AuthorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    requiredGender: {
      type: DataTypes.ENUM,
      values: ['Male', 'Female'],
      allowNull: true
    },
    maxAge: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    RequiredEducation: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'EducationLevels',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM,
      values: ['Active', 'Inactive', 'Filled'],
      allowNull: false,
      defaultValue: 'Active'
    },
    isUrgent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'JobPosting',
  });
  return JobPosting;
};