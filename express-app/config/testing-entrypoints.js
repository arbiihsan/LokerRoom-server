const entrypoints = {
  
  // POST
  login: '/login',
  register: '/register',

  // GET
  users: (pageNumber = 1) => `/users?p=${pageNumber}`,
  user: (id) => `/users/${id}`,

  // GET (my own details)
  me: '/user',
  myReviews: '/user/reviews',
  myJobApplications: '/user/job-applications',
  myJobPostings: '/user/job-postings',
  myJobApplicants: (id) => `/job-postings/${id}/applicants`,

  // GET
  jobPostings: ({pageNumber = 1, requiredGender, maxAge, categoryId, education, location, isUrgent} = {}) => {
    let query = '';
    if (requiredGender) query += `&gender=${requiredGender}`;
    if (maxAge) query += `&maxAge=${maxAge}`;
    if (categoryId) query += `&categoryId=${categoryId}`
    if (education) query += `&education=${education}`;
    if (location) query += `&location=${location}`;
    if (isUrgent) query += `&isUrgent=${isUrgent}`;
    return `/job-postings?p=${pageNumber}${query}`
  },
  jobPosting: (id) => `/job-postings/${id}`,
  categories: '/categories',
  educationLevels: '/education-levels',
  
  // POST
  addJobPosting: '/job-postings',
  
  // PUT
  editJobPosting: (id) => `/job-postings/${id}`,

  // POST
  applyToJob: (id) => `/job-postings/${id}/application`,

  // PATCH
  acceptJobApplication: (id) => `/job-applications/${id}/accept`,
  rejectJobApplication: (id) => `/job-applications/${id}/reject`,
  startJob: (id) => `/job-applications/${id}/start`,
  terminateJob: (id) => `/job-applications/${id}/terminate`,

  // POST
  reviewUser: (id) => `/users/${id}/review`,

}

module.exports = entrypoints;