const UserController = require('../controllers/userController');
const JobController = require('../controllers/jobController');

const router = require('express').Router();

const authentication = require('../middleware/authentication');
const { authorization, authorizeJobApplicationPrivilege } = require('../middleware/authorization');

router.get('/', (req, res) => {
  res.send('Welcome to the API entrypoint');
});

router.post('/login', UserController.login);
router.post('/register', UserController.register);

router.get('/users', UserController.getUsers);
router.get('/users/:id', UserController.getUserById);

router.get('/categories', JobController.getCategories);
router.get('/education-levels', JobController.getEducationLevels);

router.get('/job-postings', JobController.getJobPostings);
router.get('/job-postings/:id', JobController.getJobPostingById);

router.use(authentication);

router.get('/user', UserController.getLoggedInUserDetails);
router.get('/user/reviews', UserController.getLoggedInUserReviews);
router.get('/user/job-applications', UserController.getLoggedInUserPostedJobApplications);
router.get('/user/job-postings', UserController.getLoggedInUserJobPostings);
router.patch('/user', UserController.editLoggedInUserDetails);

router.post('/job-postings', JobController.addJobPosting);
router.put('/job-postings/:id', authorization, JobController.updateJobPostingDetails);
router.patch('/job-postings/:id', authorization, JobController.updateJobPostingStatus);
router.get('/job-postings/:id/applicants', authorization, UserController.getLoggedInUserReceivedJobApplications);

router.post('/job-postings/:id/application', JobController.applyToJob);
router.patch('/job-applications/:id/accept', authorizeJobApplicationPrivilege, JobController.acceptJobApplication);
router.patch('/job-applications/:id/reject', authorizeJobApplicationPrivilege, JobController.rejectJobApplication);
router.patch('/job-applications/:id/start', authorizeJobApplicationPrivilege, JobController.startJob);
router.patch('/job-applications/:id/terminate', authorizeJobApplicationPrivilege, JobController.terminateJob);

router.post('/users/:id/review', UserController.addReview);

module.exports = router;
