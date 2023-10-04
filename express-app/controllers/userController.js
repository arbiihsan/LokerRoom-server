const {
  User,
  JobPosting,
  JobApplication,
  Review,
  Category,
  EducationLevel,
} = require("../models");
const { compare } = require("../helpers/password");
const { signToken } = require("../helpers/jwt");

const { NUM_USERS_PER_PAGE } = require("../config/pagination");

class Controller {
  static async login(req, res, next) {
    try {
      const { telephone, email, password } = req.body;
      if (!telephone && !email) throw { name: "InvalidLogin" };

      const options = { where: {} };
      if (telephone && email) {
        options.where = { telephone, email };
      } else if (telephone) {
        options.where = { telephone };
      } else if (email) {
        options.where = { email };
      }
      const user = await User.findOne(options);
      if (!user) throw { name: "InvalidLogin" };
      if (!compare(password, user.password)) throw { name: "InvalidLogin" };

      const access_token = signToken({
        id: user.id,
        name: user.name,
      });
      res.status(200).json({ access_token, userId: user.id });
    } catch (err) {
      next(err);
    }
  }

  static async register(req, res, next) {
    try {
      let {
        name,
        telephone,
        email,
        password,
        address,
        educationId,
        gender,
        dateOfBirth,
      } = req.body;
      if (!email) email = null;
      if (!educationId) educationId = null;
      const user = await User.create({
        name,
        telephone,
        email,
        password,
        address,
        EducationId: educationId,
        gender,
        dateOfBirth,
        profileDescription: "",
      });
      res.status(201).json({
        message: "Registered new user",
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const p = req.query.q || 1;
      const { count, rows } = await User.findAndCountAll({
        attributes: {
          exclude: ["password", "EducationId", "createdAt", "updatedAt"],
        },
        include: [
          {
            model: EducationLevel,
            as: "educationLevel",
            attributes: ["id", "education"],
          },
          {
            model: Review,
            as: "receivedReviews",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            limit: 3,
            order: [
              ["createdAt", "DESC"],
              ["id", "DESC"],
            ],
          },
        ],
        order: [
          ["name", "ASC"],
          ["id", "ASC"],
        ],
        limit: NUM_USERS_PER_PAGE,
        offset: (p - 1) * NUM_USERS_PER_PAGE,
      });
      res.status(200).json({
        numPages: Math.ceil(count / NUM_USERS_PER_PAGE),
        data: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      if (isNaN(id)) throw { name: "NotFoundError" };
      const user = await User.findByPk(id, {
        attributes: {
          exclude: ["password", "EducationId", "createdAt", "updatedAt"],
        },
        include: [
          {
            model: EducationLevel,
            as: "educationLevel",
            attributes: ["id", "education"],
          },
          {
            model: Review,
            as: "receivedReviews",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            order: [
              ["createdAt", "DESC"],
              ["id", "DESC"],
            ],
          },
        ],
      });
      if (!user) throw { name: "NotFoundError" };
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async getLoggedInUserDetails(req, res, next) {
    try {
      const { id } = req.user;
      const user = await User.findByPk(id, {
        attributes: {
          exclude: ["password", "createdAt", "updatedAt"],
        },
        include: [
          {
            model: EducationLevel,
            as: "educationLevel",
            attributes: ["id", "education"],
          },
        ],
      });
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async getLoggedInUserReviews(req, res, next) {
    try {
      const { id } = req.user;
      const reviews = await Review.findAll({
        attributes: {
          exclude: [
            "EmployerId",
            "UserId",
            "JobPostingId",
            "createdAt",
            "updatedAt",
          ],
        },
        where: {
          UserId: id,
        },
        include: [
          {
            model: User,
            as: "employer",
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
          {
            model: JobPosting,
            as: "jobPosting",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
        order: [
          ["createdAt", "DESC"],
          ["id", "DESC"],
        ],
      });
      res.status(200).json(reviews);
    } catch (err) {
      next(err);
    }
  }

  static async getLoggedInUserPostedJobApplications(req, res, next) {
    try {
      const { id } = req.user;
      const jobApplications = await JobApplication.findAll({
        attributes: {
          exclude: ["UserId", "createdAt", "updatedAt"],
        },
        where: {
          UserId: id,
        },
        include: [
          {
            model: JobPosting,
            as: "jobPosting",
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            },
            include: [
              {
                model: User,
                as: "author",
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
              {
                model: Category,
                as: "category",
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
          ]
          },
        ],
        order: [
          ["createdAt", "DESC"],
          ["id", "DESC"],
        ],
      });
      res.status(200).json(jobApplications);
    } catch (err) {
      next(err);
    }
  }

  static async getLoggedInUserJobPostings(req, res, next) {
    try {
      const { id } = req.user;
      const jobPostings = await JobPosting.findAll({
        attributes: {
          exclude: [
            "CategoryId",
            "AuthorId",
            "RequiredEducation",
            "createdAt",
            "updatedAt",
          ],
        },
        where: {
          AuthorId: id,
        },
        include: [
          {
            model: Category,
            as: "category",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: User,
            as: "author",
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
          {
            model: EducationLevel,
            as: "requiredEducation",
            attributes: ["id", "education"],
          },
        ],
        order: [
          ["createdAt", "DESC"],
          ["id", "DESC"],
        ],
      });
      res.status(200).json(jobPostings);
    } catch (err) {
      next(err);
    }
  }

  static async getLoggedInUserReceivedJobApplications(req, res, next) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) throw { name: "NotFoundError" };
      const jobApplications = await JobApplication.findAll({
        attributes: {
          exclude: ["UserId", "JobPostingId", "createdAt", "updatedAt"],
        },
        where: {
          JobPostingId: id,
        },
        include: {
          model: User,
          as: "applicant",
          attributes: {
            exclude: ["EducationId", "password", "createdAt", "updatedAt"],
          },
          include: {
            model: EducationLevel,
            as: "educationLevel",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        },
      });
      res.status(200).json(jobApplications);
    } catch (err) {
      next(err);
    }
  }

  static async editLoggedInUserDetails(req, res, next) {
    try {
      const { address, imgUrl, educationId, profileDescription } = req.body;
      await User.update(
        {
          address,
          imgUrl,
          educationId,
          profileDescription,
        },
        {
          where: { id: req.user.id },
        }
      );
      res.status(200).json({
        message: "Updated user details",
      });
    } catch (err) {
      next(err);
    }
  }

  static async addReview(req, res, next) {
    try {
      const { id } = req.params;
      const { jobPostingId, content, rating } = req.body;

      if (!id || isNaN(id)) throw { name: "NotFoundError" };
      if (!jobPostingId || isNaN(jobPostingId)) throw { name: "NotFoundError" };
      const jobPosting = await JobPosting.findByPk(jobPostingId, {
        attributes: ["id", "AuthorId"],
      });
      if (!jobPosting) throw { name: "NotFoundError" };
      if (jobPosting.AuthorId !== req.user.id) throw { name: "Forbidden" };

      await Review.create({
        EmployerId: req.user.id,
        UserId: id,
        JobPostingId: jobPostingId,
        content,
        rating,
      });
      res.status(201).json({
        message: "Added review",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = Controller;
