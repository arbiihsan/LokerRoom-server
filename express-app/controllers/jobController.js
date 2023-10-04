const { User, JobPosting, JobApplication, Review, Category, EducationLevel } = require("../models");
const { Op } = require('sequelize');

const { NUM_JOB_POSTINGS_PER_PAGE } = require('../config/pagination');

class Controller {

  static async getCategories(req, res, next) {
    try {
      const categories = await Category.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        order: [['name', 'ASC']]
      })
      res.status(200).json(categories);
    } catch(err) {
      next(err);
    }
  }

  static async getEducationLevels(req, res, next) {
    try {
      const educationLevels = await EducationLevel.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        order: [['priority', 'ASC'], ['id', 'ASC']]
      })
      res.status(200).json(educationLevels);
    } catch(err) {
      next(err);
    }
  }

  static async getJobPostings(req, res, next) {
    try {
      const p = req.query.p || 1;
      const { gender, maxAge, categoryId, education, location, isUrgent, status } = req.query;

      const filter = {};
      if (gender) filter.requiredGender = gender;
      if (maxAge) filter.maxAge = {
        [Op.lte]: maxAge
      }
      if (categoryId) filter.CategoryId = categoryId;
      if (education) filter.RequiredEducation = {
        [Op.or]: [
          {[Op.lte]: education},
          null
        ]
      }
      if (location) filter.address = {
        [Op.like]: `%${location}%`
      };
      if (isUrgent) filter.isUrgent = true;
      if (status) filter.status = {
        [Op.in]: status.split(',')
      }

      const { count, rows } = await JobPosting.findAndCountAll({
        attributes: {
          exclude: ['CategoryId', 'AuthorId', 'RequiredEducation', 'createdAt', 'updatedAt']
        },
        where: filter,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          },
          {
            model: User,
            as: 'author',
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          },
          {
            model: EducationLevel,
            as: 'requiredEducation',
            attributes: ['id', 'education']
          }
        ],
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        limit: NUM_JOB_POSTINGS_PER_PAGE,
        offset: (p-1) * NUM_JOB_POSTINGS_PER_PAGE
      });
      res.status(200).json({
        numPages: Math.ceil(count / NUM_JOB_POSTINGS_PER_PAGE),
        data: rows
      });
    } catch(err) {
      next(err);
    }
  }

  static async getJobPostingById(req, res, next) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) throw { name: 'NotFoundError' };
      const jobPosting = await JobPosting.findByPk(id, {
        attributes: {
          exclude: ['CategoryId', 'AuthorId', 'RequiredEducation', 'createdAt', 'updatedAt']
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          },
          {
            model: User,
            as: 'author',
            attributes: {
              exclude: ['password', 'createdAt', 'updatedAt']
            }
          },
          {
            model: EducationLevel,
            as: 'requiredEducation',
            attributes: ['id', 'education']
          }
        ]
      });
      if (!jobPosting) throw { name: 'NotFoundError' };
      res.status(200).json(jobPosting);
    } catch(err) {
      next(err);
    }
  }

  static async addJobPosting(req, res, next) {
    try {
      let { 
        title, description, address, long, lat,
        categoryId, minSalary, maxSalary, 
        requiredGender, maxAge, requiredEducation, isUrgent 
      } = req.body;
      if (!categoryId) categoryId = null;
      if (!minSalary) minSalary = null;
      if (!maxSalary) maxSalary = null;
      if (!requiredGender) requiredGender = null;
      if (!maxAge) maxAge = null;
      if (!requiredEducation) requiredEducation = null;
      await JobPosting.create({
        title, description, address, long, lat,
        CategoryId: categoryId,
        minSalary, maxSalary, requiredGender, maxAge,
        AuthorId: req.user.id,
        RequiredEducation: requiredEducation,
        isUrgent
      });
      res.status(201).json({
        message: 'Successfully added job posting'
      });
    } catch(err) {
      next(err);
    }
  }

  static async updateJobPostingDetails(req, res, next) {
    try {
      const { id } = req.params;
      let { 
        title, description, address, long, lat,
        categoryId, minSalary, maxSalary, 
        requiredGender, maxAge, requiredEducation, isUrgent 
      } = req.body;
      if (!categoryId) categoryId = null;
      if (!minSalary) minSalary = null;
      if (!maxSalary) maxSalary = null;
      if (!requiredGender) requiredGender = null;
      if (!maxAge) maxAge = null;
      if (!requiredEducation) requiredEducation = null;
      await JobPosting.update({
        title, description, address, long, lat,
        CategoryId: categoryId,
        minSalary, maxSalary, requiredGender, maxAge,
        AuthorId: req.user.id,
        RequiredEducation: requiredEducation,
        isUrgent
      }, {
        where: { id }
      });
      res.status(200).json({
        message: 'Successfully updated job posting'
      });
    } catch(err) {
      next(err);
    }
  }

  static async updateJobPostingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await JobPosting.update({
        status
      }, {
        where: { id }
      });
      res.status(200).json({
        message: 'Successfully updated status of job posting'
      })
    } catch(err) {
      next(err);
    }
  }

  static async applyToJob(req, res, next) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) throw { name: 'NotFoundError' };
      const jobPosting = await JobPosting.findByPk(id);
      if (!jobPosting) throw { name: 'NotFoundError' };
      if (jobPosting.status !== 'Active') {
        return res.status(400).json({
          message: 'Job posting is no longer active'
        })
      }

      let jobApplication = await JobApplication.findOne({
        where: { 
          UserId: req.user.id, 
          JobPostingId: id 
        }
      });
      if (jobApplication) {
        return res.status(400).json({
          message: 'User has already applied to this job posting'
        })
      };

      await JobApplication.create({
        UserId: req.user.id,
        JobPostingId: id,
        applicationStatus: 'Processing'
      });
      res.status(201).json({
        message: 'Job application has been posted'
      })
    } catch(err) {
      next(err);
    }
  }

  static async acceptJobApplication(req, res, next) {
    try {

      const { id } = req.params;

      if (req.jobApplication.applicationStatus !== 'Processing') {
        throw { 
          name: 'BadCredentials',
          message: 'Cannot change status of a job application that is already accepted/rejected' 
        }
      }

      await JobApplication.update({
        applicationStatus: 'Accepted',
        isEmployed: null,
        startDateOfEmployment: null,
        endDateOfEmployment: null
      }, { 
        where: { id, applicationStatus: 'Processing' } 
      });

      res.status(200).json({
        message: 'Successfully accepted job application'
      });

    } catch(err) {
      next(err);
    }
  }

  static async rejectJobApplication(req, res, next) {
    try {

      const { id } = req.params;

      if (req.jobApplication.applicationStatus !== 'Processing') {
        throw { 
          name: 'BadCredentials',
          message: 'Cannot change status of a job application that is already accepted/rejected' 
        }
      }

      await JobApplication.update({
        applicationStatus: 'Rejected',
        isEmployed: null,
        startDateOfEmployment: null,
        endDateOfEmployment: null
      }, { 
        where: { id, applicationStatus: 'Processing' } 
      });

      res.status(200).json({
        message: 'Successfully rejected job application'
      });

    } catch(err) {
      next(err);
    }
  }

  static async startJob(req, res, next) {
    try {

      const { id } = req.params;

      if (req.jobApplication.applicationStatus !== 'Accepted') {
        throw { 
          name: 'BadCredentials',
          message: 'Cannot change status of a job if job applicant has not been accepted' 
        }
      }

      await JobApplication.update({
        isEmployed: true,
        startDateOfEmployment: new Date(),
        endDateOfEmployment: null
      }, { 
        where: { id, applicationStatus: 'Accepted' } 
      });

      res.status(200).json({
        message: 'Successfully updated job status'
      });
      
    } catch(err) {
      next(err);
    }
  }

  static async terminateJob(req, res, next) {
    try {

      const { id } = req.params;

      if (req.jobApplication.applicationStatus !== 'Accepted') {
        throw { 
          name: 'BadCredentials',
          message: 'Cannot change status of a job if job applicant has not been accepted' 
        }
      }

      await JobApplication.update({
        isEmployed: false,
        endDateOfEmployment: new Date()
      }, { 
        where: { id, applicationStatus: 'Accepted' } 
      });

      res.status(200).json({
        message: 'Successfully updated job status'
      });

    } catch(err) {
      next(err);
    }
  }

}

module.exports = Controller;
