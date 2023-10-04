const typeDefs = `#graphql

  # Enumerations
  enum Gender {
    Male
    Female
  }
  enum ApplicationStatus {
    Accepted
    Rejected
    Processing
  }
  enum JobPostingStatus {
    Active
    Inactive
    Filled
  }


  # Object Type buat Query 
  type EducationLevel {
    id: Int 
    education: String
    priority: Int
  }
  type Category {
    id: Int
    name: String
  }
  type User {
    id: Int 
    name: String
    telephone: String
    email: String
    address: String
    imgUrl: String
    gender: Gender
    dateOfBirth: String
    profileDescription: String
    educationLevel: EducationLevel
    receivedReviews: [Review]
  }
  type Me {
    id: Int 
    name: String
    telephone: String
    email: String
    address: String
    imgUrl: String
    gender: Gender
    dateOfBirth: String
    profileDescription: String
    educationLevel: EducationLevel
    appliedJobs: [JobApplication]
    receivedReviews: [Review]
    postedJobs: [JobPosting]
  }
  type JobApplication {
    id: Int
    jobPosting: JobPosting
    applicationStatus: ApplicationStatus
    isEmployed: Boolean
    startDateOfEmployment: String
    endDateOfEmployment: String
    applicant: User
  }
  type JobPosting {
    id: Int
    title: String
    description: String
    address: String
    long: Float
    lat: Float
    category: Category
    minSalary: Int
    maxSalary: Int
    author: User
    requiredGender: Gender
    maxAge: Int
    requiredEducation: EducationLevel
    status: JobPostingStatus
    isUrgent: Boolean
  }
  type Review {
    id: Int
    employer: User
    user: User
    jobPosting: JobPosting
    content: String
    rating: Int
  }
  type PageOfUsers {
    numPages: Int
    data: [User]
  }
  type PageOfJobPostings {
    numPages: Int
    data: [JobPosting]
  }


  # Response setelah mutation
  type Response {
    message: String
  }
  type Token {
    access_token: String
    userId: Int
  }


  # Input Types buat Mutation
  input loginCredentials {
    telephone: String
    email: String
    password: String
  }
  input registerDetails {
    name: String
    telephone: String
    email: String
    password: String
    address: String
    educationId: Int
    gender: Gender
    dateOfBirth: String
  }
  input userDetails {
    address: String
    imgUrl: String
    educationId: Int
    profileDescription: String
  }
  input newJobPosting {
    title: String
    description: String
    address: String
    long: Float
    lat: Float
    categoryId: Int
    minSalary: Int
    maxSalary: Int
    requiredGender: Gender
    maxAge: Int
    requiredEducation: Int
    isUrgent: Boolean
  }
  input newReview {
    userId: Int
    jobPostingId: Int
    content: String
    rating: Int
  }

  # Schema Query dan Mutation
  type Query {

    categories: [Category]
    educationLevels: [EducationLevel]

    me: Me
    user(userId: Int!): User
    users(pageNumber: Int): PageOfUsers
    jobPosting(jobPostingId: Int!): JobPosting
    jobPostings(
      gender: Gender, 
      maxAge: Int, 
      categoryId: Int,
      educationId: Int, 
      location: String, 
      isUrgent: Boolean,
      pageNumber: Int
    ): PageOfJobPostings
    jobApplications(jobPostingId: Int!): [JobApplication]

  }

  type Mutation {
    
    register(registerDetails: registerDetails): Response
    login(loginCredentials: loginCredentials): Token
    editUserDetails(userDetails: userDetails): Response

    addNewJobPosting(jobPosting: newJobPosting): Response
    editJobPosting(jobPostingId: Int!, jobPosting: newJobPosting): Response
    changeJobPostingStatus(jobPostingId: Int!, jobPostingStatus: JobPostingStatus!): Response

    applyToJob(jobPostingId: Int!): Response

    acceptJobApplication(jobApplicationId: Int!): Response
    rejectJobApplication(jobApplicationId: Int!): Response
    startEmploymentForJobApplication(jobApplicationId: Int!): Response
    endEmploymentForJobApplication(jobApplicationId: Int!): Response
    addReview(newReview: newReview): Response

  }
  
`;

module.exports = typeDefs;
