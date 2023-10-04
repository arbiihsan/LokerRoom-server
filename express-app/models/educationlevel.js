'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EducationLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      EducationLevel.hasMany(models.User, { foreignKey: 'EducationId' });
      EducationLevel.hasMany(models.JobPosting, { foreignKey: 'RequiredEducation' });
    }
  }
  EducationLevel.init({
    education: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Education title is required' },
        notEmpty: { msg: 'Education title is required' }
      }
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Order priority is required' },
        notEmpty: { msg: 'Order priority is required' }
      }
    }
  }, {
    sequelize,
    modelName: 'EducationLevel',
  });
  return EducationLevel;
};