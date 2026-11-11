const userProps = {
  name: { type: 'string', example: 'Ayşe Yılmaz' },
  email: { type: 'string', example: 'ayse@example.com' },
  graduation_year: { type: 'integer', example: 2022 },
  department: { type: 'string', example: 'Management Information Systems' },
};

const announcementProps = {
  title: { type: 'string', example: 'Alumni Reunion 2026' },
  content: { type: 'string', example: 'Annual alumni meetup at the Main Campus.' },
  author: { type: 'string', example: 'Department Secretariat' },
  category: { type: 'string', example: 'Event' },
};

const jobPostingProps = {
  title: { type: 'string', maxLength: 120, example: 'Junior Software Engineer' },
  company: { type: 'string', example: 'Istanbul Tech Hub' },
  city: { type: 'string', example: 'Istanbul', nullable: true },
  description: { type: 'string', example: 'Backend development with Express and PostgreSQL.', nullable: true },
  user_id: { type: 'integer', example: 1, nullable: true },
};

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };
const userIdParam = { name: 'userId', in: 'path', required: true, schema: { type: 'integer' } };

const json = (schema) => ({ 'application/json': { schema } });
const form = (ref) => ({ 'application/x-www-form-urlencoded': { schema: { $ref: ref } } });
const ok = (description, schema) => ({ description, ...(schema && { content: json(schema) }) });
const html = (description) => ({ description, content: { 'text/html': { schema: { type: 'string' } } } });
const redirect = { description: 'Redirect (303)' };
const badRequest = { description: '400 Bad Request / Validation Error', content: json({ $ref: '#/components/schemas/ErrorResponse' }) };
const notFound = { description: '404 Guardian - Resource Not Found', content: json({ $ref: '#/components/schemas/ErrorResponse' }) };
const serverError = { description: '5xx Guardian - Internal Server Error', content: json({ $ref: '#/components/schemas/ErrorResponse' }) };

const user = { $ref: '#/components/schemas/User' };
const announcement = { $ref: '#/components/schemas/Announcement' };
const job = { $ref: '#/components/schemas/JobPosting' };

const createBody = { required: true, content: json({ $ref: '#/components/schemas/UserCreate' }) };
const updateBody = { required: true, content: json({ $ref: '#/components/schemas/UserUpdate' }) };
const formBody = { required: true, content: form('#/components/schemas/UserCreate') };

const createAnnouncementBody = { required: true, content: json({ $ref: '#/components/schemas/AnnouncementCreate' }) };
const updateAnnouncementBody = { required: true, content: json({ $ref: '#/components/schemas/AnnouncementUpdate' }) };

const createJobBody = { required: true, content: json({ $ref: '#/components/schemas/JobPostingCreate' }) };
const updateJobBody = { required: true, content: json({ $ref: '#/components/schemas/JobPostingUpdate' }) };

const text = (description) => ({ description, content: { 'text/plain': { schema: { type: 'string' } } } });

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Alumni Tracking System',
    version: '0.6.0',
    description: 'IU MIS alumni tracking with PostgreSQL, Middlewares (Logger, 404 Guardian, 5xx Guardian) and Job Postings.',
  },
  tags: [
    { name: 'General', description: 'Basic routes & health check' },
    { name: 'User', description: 'HTML views, /users' },
    { name: 'ApiUser', description: 'JSON API, /api/users' },
    { name: 'Announcement', description: 'HTML views, /announcements' },
    { name: 'ApiAnnouncement', description: 'JSON API, /api/announcements' },
    { name: 'JobPosting', description: 'HTML views, /jobs' },
    { name: 'ApiJobPosting', description: 'JSON API, /api/jobs' },
  ],
  paths: {
    '/': { get: { tags: ['General'], summary: 'Home page', responses: { 200: html('HTML') } } },
    '/about': { get: { tags: ['General'], summary: 'About page', responses: { 200: html('HTML') } } },
    '/hello': { get: { tags: ['General'], summary: 'Hello, World!', responses: { 200: text('Hello, World!') } } },
    '/hello/{name}': {
      get: { tags: ['General'], summary: 'Greet by name', parameters: [{ name: 'name', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: text('Hello {name}') } },
    },
    '/sum/{number1}/{number2}': {
      get: {
        tags: ['General'],
        summary: 'Sum of two integers',
        parameters: [
          { name: 'number1', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'number2', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: text('The sum'), 422: badRequest },
      },
    },
    '/api/health': { get: { tags: ['General'], summary: 'Health check', responses: { 200: ok('OK', { type: 'object', properties: { status: { type: 'string', example: 'ok' } } }) } } },
    '/api/test-error': { get: { tags: ['General'], summary: 'Test 5xx Guardian & error logging', responses: { 500: serverError } } },

    '/users': {
      get: { tags: ['User'], summary: 'List users (HTML)', responses: { 200: html('Users table + add form') } },
      post: { tags: ['User'], summary: 'Create user (form)', requestBody: formBody, responses: { 303: redirect, 422: badRequest } },
    },
    '/users/{id}': {
      get: { tags: ['User'], summary: 'User detail (HTML)', parameters: [idParam], responses: { 200: html('Detail page'), 404: notFound } },
    },
    '/users/{id}/edit': {
      get: { tags: ['User'], summary: 'Edit form (HTML)', parameters: [idParam], responses: { 200: html('Pre-filled form'), 404: notFound } },
      post: { tags: ['User'], summary: 'Update user (form)', parameters: [idParam], requestBody: formBody, responses: { 303: redirect, 404: notFound, 422: badRequest } },
    },
    '/users/{id}/delete': {
      post: { tags: ['User'], summary: 'Delete user (form)', parameters: [idParam], responses: { 303: redirect, 404: notFound } },
    },

    '/api/users': {
      get: { tags: ['ApiUser'], summary: 'List users', responses: { 200: ok('All users', { type: 'array', items: user }) } },
      post: { tags: ['ApiUser'], summary: 'Create user', requestBody: createBody, responses: { 201: ok('Created', user), 422: badRequest } },
    },
    '/api/users/{id}': {
      get: { tags: ['ApiUser'], summary: 'Get user', parameters: [idParam], responses: { 200: ok('The user', user), 404: notFound } },
      put: { tags: ['ApiUser'], summary: 'Replace user (all fields required)', parameters: [idParam], requestBody: createBody, responses: { 200: ok('Updated', user), 404: notFound, 422: badRequest } },
      patch: { tags: ['ApiUser'], summary: 'Partially update user', parameters: [idParam], requestBody: updateBody, responses: { 200: ok('Updated', user), 404: notFound, 422: badRequest } },
      delete: {
        tags: ['ApiUser'],
        summary: 'Delete user',
        parameters: [idParam],
        responses: { 200: ok('Deleted', { type: 'object', properties: { message: { type: 'string', example: 'User deleted' }, id: { type: 'integer' } } }), 404: notFound },
      },
    },

    '/announcements': {
      get: { tags: ['Announcement'], summary: 'List announcements (HTML)', responses: { 200: html('Announcements + add form') } },
      post: { tags: ['Announcement'], summary: 'Create announcement (form)', responses: { 303: redirect, 422: badRequest } },
    },
    '/announcements/{id}': {
      get: { tags: ['Announcement'], summary: 'Announcement detail (HTML)', parameters: [idParam], responses: { 200: html('Detail page'), 404: notFound } },
    },
    '/announcements/{id}/edit': {
      get: { tags: ['Announcement'], summary: 'Edit form (HTML)', parameters: [idParam], responses: { 200: html('Pre-filled form'), 404: notFound } },
      post: { tags: ['Announcement'], summary: 'Update announcement (form)', parameters: [idParam], responses: { 303: redirect, 404: notFound, 422: badRequest } },
    },
    '/announcements/{id}/delete': {
      post: { tags: ['Announcement'], summary: 'Delete announcement (form)', parameters: [idParam], responses: { 303: redirect, 404: notFound } },
    },

    '/api/announcements': {
      get: { tags: ['ApiAnnouncement'], summary: 'List announcements', responses: { 200: ok('All announcements', { type: 'array', items: announcement }) } },
      post: { tags: ['ApiAnnouncement'], summary: 'Create announcement', requestBody: createAnnouncementBody, responses: { 201: ok('Created', announcement), 422: badRequest } },
    },
    '/api/announcements/{id}': {
      get: { tags: ['ApiAnnouncement'], summary: 'Get announcement', parameters: [idParam], responses: { 200: ok('The announcement', announcement), 404: notFound } },
      put: { tags: ['ApiAnnouncement'], summary: 'Replace announcement', parameters: [idParam], requestBody: createAnnouncementBody, responses: { 200: ok('Updated', announcement), 404: notFound, 422: badRequest } },
      patch: { tags: ['ApiAnnouncement'], summary: 'Partially update announcement', parameters: [idParam], requestBody: updateAnnouncementBody, responses: { 200: ok('Updated', announcement), 404: notFound, 422: badRequest } },
      delete: {
        tags: ['ApiAnnouncement'],
        summary: 'Delete announcement',
        parameters: [idParam],
        responses: { 200: ok('Deleted', { type: 'object', properties: { message: { type: 'string', example: 'Announcement deleted' }, id: { type: 'integer' } } }), 404: notFound },
      },
    },

    '/jobs': {
      get: { tags: ['JobPosting'], summary: 'List job postings (HTML)', responses: { 200: html('Job postings + add form') } },
      post: { tags: ['JobPosting'], summary: 'Create job posting (form)', responses: { 303: redirect, 400: badRequest } },
    },
    '/jobs/{id}': {
      get: { tags: ['JobPosting'], summary: 'Job posting detail (HTML)', parameters: [idParam], responses: { 200: html('Job detail page'), 404: notFound } },
    },
    '/jobs/{id}/edit': {
      get: { tags: ['JobPosting'], summary: 'Edit job form (HTML)', parameters: [idParam], responses: { 200: html('Pre-filled form'), 404: notFound } },
      post: { tags: ['JobPosting'], summary: 'Update job posting (form)', parameters: [idParam], responses: { 303: redirect, 404: notFound, 400: badRequest } },
    },
    '/jobs/{id}/delete': {
      post: { tags: ['JobPosting'], summary: 'Delete job posting (form)', parameters: [idParam], responses: { 303: redirect, 404: notFound } },
    },

    '/api/jobs': {
      get: { tags: ['ApiJobPosting'], summary: 'List all job postings', responses: { 200: ok('All jobs', { type: 'array', items: job }) } },
      post: { tags: ['ApiJobPosting'], summary: 'Create job posting', requestBody: createJobBody, responses: { 201: ok('Created', job), 400: badRequest } },
    },
    '/api/jobs/{id}': {
      get: { tags: ['ApiJobPosting'], summary: 'Get single job posting', parameters: [idParam], responses: { 200: ok('The job', job), 404: notFound } },
      put: { tags: ['ApiJobPosting'], summary: 'Replace job posting', parameters: [idParam], requestBody: createJobBody, responses: { 200: ok('Updated', job), 404: notFound, 400: badRequest } },
      patch: { tags: ['ApiJobPosting'], summary: 'Partially update job posting', parameters: [idParam], requestBody: updateJobBody, responses: { 200: ok('Updated', job), 404: notFound, 400: badRequest } },
      delete: {
        tags: ['ApiJobPosting'],
        summary: 'Delete job posting',
        parameters: [idParam],
        responses: { 200: ok('Deleted', { type: 'object', properties: { message: { type: 'string', example: 'Job posting deleted' }, id: { type: 'integer' } } }), 404: notFound },
      },
    },

    '/api/users/{userId}/jobs': {
      get: { tags: ['ApiJobPosting'], summary: 'List job postings for a specific user', parameters: [userIdParam], responses: { 200: ok('User jobs', { type: 'array', items: job }) } },
      post: { tags: ['ApiJobPosting'], summary: 'Create a job posting under a specific user', parameters: [userIdParam], requestBody: createJobBody, responses: { 201: ok('Created', job), 400: badRequest } },
    },
  },
  components: {
    schemas: {
      UserCreate: { type: 'object', required: Object.keys(userProps), properties: userProps },
      UserUpdate: { type: 'object', properties: userProps },
      User: { type: 'object', properties: { id: { type: 'integer', example: 1 }, ...userProps } },
      AnnouncementCreate: { type: 'object', required: ['title', 'content', 'author'], properties: announcementProps },
      AnnouncementUpdate: { type: 'object', properties: announcementProps },
      Announcement: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          ...announcementProps,
          created_at: { type: 'string', example: '2026-10-23' },
        },
      },
      JobPostingCreate: {
        type: 'object',
        required: ['title', 'company'],
        properties: {
          title: { type: 'string', maxLength: 120, example: 'Junior Software Engineer' },
          company: { type: 'string', example: 'Istanbul Tech Hub' },
          city: { type: 'string', example: 'Istanbul' },
          description: { type: 'string', example: 'Node.js and PostgreSQL backend position.' },
          user_id: { type: 'integer', example: 1 },
        },
      },
      JobPostingUpdate: { type: 'object', properties: jobPostingProps },
      JobPosting: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          ...jobPostingProps,
          created_at: { type: 'string', example: '2026-11-11' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Not Found' },
          reason: { type: 'string', example: 'The requested resource was not found on this server.' },
          status: { type: 'integer', example: 404 },
          timestamp: { type: 'string', example: '2026-11-11T14:20:00.000Z' },
          detail: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};
