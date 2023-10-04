const { JobPosting, JobApplication } = require("../models");

async function authorization(req, res, next) {
  try {
    const { id: jobPostingId } = req.params;
    if (!jobPostingId || isNaN(jobPostingId)) throw { name: 'NotFoundError' };
    const jobPosting = await JobPosting.findByPk(jobPostingId, {
      attributes: ['id', 'AuthorId']
    });
    if (!jobPosting) throw { name: 'NotFoundError' };
    if (req.user.id !== jobPosting.AuthorId) throw { name: 'Forbidden' };
    next();
  } catch(err) {
    next(err);
  }
}

async function authorizeJobApplicationPrivilege(req, res, next) {
  try {
    const { id: jobApplicationId } = req.params;
    if (!jobApplicationId || isNaN(jobApplicationId)) throw { name: 'NotFoundError' };
    const jobApplication = await JobApplication.findByPk(jobApplicationId, {
      attributes: ['id', 'applicationStatus'],
      include: {
        model: JobPosting,
        as: 'jobPosting',
        attributes: ['id', 'AuthorId']
      }
    })
    if (!jobApplication) throw { name: 'NotFoundError' };
    if (req.user.id !== jobApplication?.jobPosting?.AuthorId) throw { name: 'Forbidden' };
    req.jobApplication = jobApplication;
    next();
  } catch(err) {
    next(err);
  }
}

module.exports = { authorization, authorizeJobApplicationPrivilege };