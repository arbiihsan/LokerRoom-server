const axios = require("axios");
const REST_API_SERVICE_URL = process.env.REST_API_SERVICE_URL;
// const { dateScalar } = require('./scalars');
const redis = require("./config/redisConnection");

const { getRequestedTopLevelFields } = require("./utils/graphql");
const { throwApiError } = require("./utils/errorHandler");

const resolvers = {
  // Date: dateScalar,

  Query: {
    categories: async () => {
      const cache = await redis.get("categories");
      if (cache) {
        const categories = JSON.parse(cache);
        return categories;
      } else {
        const response = await fetch(`${REST_API_SERVICE_URL}/categories`);
        const data = await response.json();
        if (!response.ok) throwApiError(data);
        await redis.set("categories", JSON.stringify(data));
        return data;
      }
    },
    educationLevels: async () => {
      const cache = await redis.get("educationLevels");
      if (cache) {
        const educationLevels = JSON.parse(cache);
        return educationLevels;
      } else {
        const response = await fetch(
          `${REST_API_SERVICE_URL}/education-levels`
        );
        const data = await response.json();
        if (!response.ok) throwApiError(data);
        await redis.set("educationLevels", JSON.stringify(data));
        return data;
      }
    },
    user: async (_, args) => {
      const { userId } = args;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/users/${userId || 0}`
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      return data;
    },
    users: async (_, args) => {
      const { pageNumber } = args;
      let redisTag = `users?p=${pageNumber || 1}`;
      const cache = await redis.get(redisTag);
      if (cache) {
        const users = JSON.parse(cache);
        return users;
      } else {
        const response = await fetch(`${REST_API_SERVICE_URL}/${redisTag}`);
        const data = await response.json();
        if (!response.ok) throwApiError(data);
        await redis.set(redisTag, JSON.stringify(data));
        return data;
      }
    },
    jobPosting: async (_, args) => {
      const { jobPostingId } = args;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/job-postings/${jobPostingId}`
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      return data;
    },
    jobPostings: async (_, args) => {
      const {
        gender,
        maxAge,
        categoryId,
        educationId,
        location,
        isUrgent,
        pageNumber,
      } = args;
      let query = `?p=${pageNumber || 1}`;
      if (gender) query += `&gender=${gender}`;
      if (maxAge) query += `&maxAge=${maxAge}`;
      if (categoryId) query += `&categoryId=${categoryId}`;
      if (educationId) query += `&education=${educationId}`;
      if (location) query += `&location=${location}`;
      if (isUrgent) query += `&isUrgent=true`;

      let redisTag = `job-postings${query}`;
      const cache = await redis.get(redisTag);
      if (cache) {
        const jobPostings = JSON.parse(cache);
        return jobPostings;
      } else {
        const response = await fetch(`${REST_API_SERVICE_URL}/${redisTag}`);
        const data = await response.json();
        if (!response.ok) throwApiError(data);
        await redis.set(redisTag, JSON.stringify(data));
        return data;
      }
    },
    jobApplications: async (_, args, context, info) => {
      const { access_token } = context;
      const { jobPostingId } = args;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/job-postings/${jobPostingId}/applicants`,
        {
          headers: { access_token: access_token },
        }
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      return data;
    },

    me: async (_, args, context, info) => {
      const { access_token } = context;

      const requestedFields = getRequestedTopLevelFields(info);
      const fetchCalls = ["/user"];
      for (let field of requestedFields) {
        switch (field) {
          case "postedJobs":
            fetchCalls.push("/user/job-postings");
            break;
          case "appliedJobs":
            fetchCalls.push("/user/job-applications");
            break;
          case "receivedReviews":
            fetchCalls.push("/user/reviews");
            break;
        }
      }

      try {
        const [{ data }, ...arr] = await Promise.all(
          fetchCalls.map((route) => {
            return axios.get(`${REST_API_SERVICE_URL}${route}`, {
              headers: { access_token },
            });
          })
        );

        for (let res of arr) {
          switch (res.request.path) {
            case "/user/job-postings":
              data.postedJobs = res.data;
              break;
            case "/user/job-applications":
              data.appliedJobs = res.data;
              break;
            case "/user/reviews":
              data.receivedReviews = res.data;
              break;
          }
        }
        return data;
      } catch (err) {
        throwApiError(err);
      }
    },
  },

  Mutation: {
    async register(_, args) {
      const { registerDetails } = args;
      const response = await fetch(`${REST_API_SERVICE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerDetails),
      });
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      return data;
    },

    async login(_, args) {
      const { loginCredentials } = args;
      // console.log(loginCredentials, "<<<<<<loginCredentials");
      const response = await fetch(`${REST_API_SERVICE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginCredentials),
      });
      const data = await response.json();
      console.log(data, "<<<<<<<di resolvers");
      if (!response.ok) throwApiError(data);
      return data;
    },

    async editUserDetails(_, args, context) {
      const { userDetails } = args;
      const { access_token } = context;
      console.log(userDetails, "<<<userDetails");
      console.log(access_token, "<<<access_token");
      const response = await fetch(`${REST_API_SERVICE_URL}/user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          access_token: access_token,
        },
        body: JSON.stringify(userDetails),
      });
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      await redis.flushall();
      return data;
    },

    async addNewJobPosting(_, args, context) {
      const { jobPosting } = args;
      const { access_token } = context;
      const response = await fetch(`${REST_API_SERVICE_URL}/job-postings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: access_token,
        },
        body: JSON.stringify(jobPosting),
      });
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      await redis.flushall();
      return data;
    },

    async editJobPosting(_, args, context) {
      const { jobPostingId, jobPosting } = args;
      const { access_token } = context;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/job-postings/${jobPostingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            access_token: access_token,
          },
          body: JSON.stringify(jobPosting),
        }
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      await redis.flushall();
      return data;
    },

    async changeJobPostingStatus(_, args, context) {
      const { jobPostingId, jobPostingStatus } = args;
      const { access_token } = context;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/job-postings/${jobPostingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            access_token: access_token,
          },
          body: JSON.stringify({
            status: jobPostingStatus,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      await redis.flushall();
      return data;
    },

    async applyToJob(_, args, context) {
      const { jobPostingId } = args;
      const { access_token } = context;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/job-postings/${jobPostingId}/application`,
        {
          method: "POST",
          headers: {
            access_token: access_token,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      return data;
    },

    async acceptJobApplication(_, args, context) {
      const { jobApplicationId } = args;
      const { access_token } = context;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/job-applications/${jobApplicationId}/accept`,
        {
          method: "PATCH",
          headers: {
            access_token: access_token,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      return data;
    },

    async rejectJobApplication(_, args, context) {
      const { jobApplicationId } = args;
      const { access_token } = context;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/job-applications/${jobApplicationId}/reject`,
        {
          method: "PATCH",
          headers: {
            access_token: access_token,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      return data;
    },

    async startEmploymentForJobApplication(_, args, context) {
      const { jobApplicationId } = args;
      const { access_token } = context;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/job-applications/${jobApplicationId}/start`,
        {
          method: "PATCH",
          headers: {
            access_token: access_token,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      return data;
    },

    async endEmploymentForJobApplication(_, args, context) {
      const { jobApplicationId } = args;
      const { access_token } = context;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/job-applications/${jobApplicationId}/terminate`,
        {
          method: "PATCH",
          headers: {
            access_token: access_token,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      return data;
    },

    async addReview(_, args, context) {
      const { newReview } = args;
      const { userId, jobPostingId, content, rating } = newReview;
      const { access_token } = context;
      const response = await fetch(
        `${REST_API_SERVICE_URL}/users/${userId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            access_token: access_token,
          },
          body: JSON.stringify({
            jobPostingId: jobPostingId,
            content: content,
            rating: rating,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throwApiError(data);
      await redis.flushall();
      return data;
    },
  },
};

module.exports = resolvers;
