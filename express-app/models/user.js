'use strict';
const { encrypt } = require('../helpers/password');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.EducationLevel, { as: 'educationLevel', foreignKey: 'EducationId' });
      User.hasMany(models.JobPosting, { as: 'postedJobs', foreignKey: 'AuthorId' });
      User.hasMany(models.JobApplication, { as: 'appliedJobs', foreignKey: 'UserId' });
      User.hasMany(models.Review, { as: 'postedReviews', foreignKey: 'EmployerId' });
      User.hasMany(models.Review, { as: 'receivedReviews', foreignKey: 'UserId' });
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Name is required' },
        notEmpty: { msg: 'Name is required' }
      }
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Phone number must be unique' },
      validate: {
        notNull: { msg: 'Phone number is required' },
        notEmpty: { msg: 'Phone number is required' },
        isNumeric: { msg: 'Phone number is invalid' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: { msg: 'Email must be unique' },
      validate: {
        isEmail: { msg: 'Email is invalid' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Password is required' },
        notEmpty: { msg: 'Password is required' },
        len: { 
          args: [5, 255], 
          msg: 'Password must be at least 5 characters long'
        }
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
    imgUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: 'Image URL is invalid' }
      }
    },
    EducationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'EducationLevels',
        key: 'id'
      }
    },
    gender: {
      type: DataTypes.ENUM,
      values: ['Male', 'Female'],
      allowNull: false,
      validate: {
        notNull: { msg: 'Gender is required' },
        notEmpty: { msg: 'Gender is required' }
      }
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: 'Date of birth is required' },
        notEmpty: { msg: 'Date of birth is required' }
      }
    },
    profileDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate((user, options) => {
    const { password } = user.dataValues;
    if (password) {
      user.dataValues.password = encrypt(password);
    }
  });
  return User;
};