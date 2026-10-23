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

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };
const json = (schema) => ({ 'application/json': { schema } });
const form = (ref) => ({ 'application/x-www-form-urlencoded': { schema: { $ref: ref } } });
const ok = (description, schema) => ({ description, ...(schema && { content: json(schema) }) });
const html = (description) => ({ description, content: { 'text/html': { schema: { type: 'string' } } } });
const redirect = { description: 'Redirect (303)' };
const missing = { description: 'Resource not found' };
const invalid = { description: 'Validation error' };
const user = { $ref: '#/components/schemas/User' };
const announcement = { $ref: '#/components/schemas/Announcement' };

const createBody = { required: true, content: json({ $ref: '#/components/schemas/UserCreate' }) };
const updateBody = { required: true, content: json({ $ref: '#/components/schemas/UserUpdate' }) };
const formBody = { required: true, content: form('#/components/schemas/UserCreate') };

const createAnnouncementBody = { required: true, content: json({ $ref: '#/components/schemas/AnnouncementCreate' }) };
const updateAnnouncementBody = { required: true, content: json({ $ref: '#/components/schemas/AnnouncementUpdate' }) };

const text = (description) => ({ description, content: { 'text/plain': { schema: { type: 'string' } } } });

module.exports = {
  openapi: '3.0.3',
  info: { title: 'Alumni Tracking System', version: '0.4.0', description: 'IU MIS alumni tracking. Data is in-memory until week 5.' },
  tags: [
    { name: 'General', description: 'Basic routes' },
    { name: 'User', description: 'HTML views, /users' },
    { name: 'ApiUser', description: 'JSON API, /api/users' },
    { name: 'Announcement', description: 'HTML views, /announcements' },
    { name: 'ApiAnnouncement', description: 'JSON API, /api/announcements' },
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
        responses: { 200: text('The sum'), 422: invalid },
      },
    },
    '/api/health': { get: { tags: ['General'], summary: 'Health check', responses: { 200: ok('OK', { type: 'object', properties: { status: { type: 'string', example: 'ok' } } }) } } },

    '/users': {
      get: { tags: ['User'], summary: 'List users (HTML)', responses: { 200: html('Users table + add form') } },
      post: { tags: ['User'], summary: 'Create user (form)', requestBody: formBody, responses: { 303: redirect, 422: invalid } },
    },
    '/users/{id}': {
      get: { tags: ['User'], summary: 'User detail (HTML)', parameters: [idParam], responses: { 200: html('Detail page'), 404: missing } },
    },
    '/users/{id}/edit': {
      get: { tags: ['User'], summary: 'Edit form (HTML)', parameters: [idParam], responses: { 200: html('Pre-filled form'), 404: missing } },
      post: { tags: ['User'], summary: 'Update user (form)', parameters: [idParam], requestBody: formBody, responses: { 303: redirect, 404: missing, 422: invalid } },
    },
    '/users/{id}/delete': {
      post: { tags: ['User'], summary: 'Delete user (form)', parameters: [idParam], responses: { 303: redirect, 404: missing } },
    },

    '/api/users': {
      get: { tags: ['ApiUser'], summary: 'List users', responses: { 200: ok('All users', { type: 'array', items: user }) } },
      post: { tags: ['ApiUser'], summary: 'Create user', requestBody: createBody, responses: { 200: ok('Created', user), 422: invalid } },
    },
    '/api/users/{id}': {
      get: { tags: ['ApiUser'], summary: 'Get user', parameters: [idParam], responses: { 200: ok('The user', user), 404: missing } },
      put: { tags: ['ApiUser'], summary: 'Replace user (all fields required)', parameters: [idParam], requestBody: createBody, responses: { 200: ok('Updated', user), 404: missing, 422: invalid } },
      patch: { tags: ['ApiUser'], summary: 'Partially update user', parameters: [idParam], requestBody: updateBody, responses: { 200: ok('Updated', user), 404: missing, 422: invalid } },
      delete: {
        tags: ['ApiUser'],
        summary: 'Delete user',
        parameters: [idParam],
        responses: { 200: ok('Deleted', { type: 'object', properties: { message: { type: 'string', example: 'User deleted' }, id: { type: 'integer' } } }), 404: missing },
      },
    },

    '/announcements': {
      get: { tags: ['Announcement'], summary: 'List announcements (HTML)', responses: { 200: html('Announcements + add form') } },
      post: { tags: ['Announcement'], summary: 'Create announcement (form)', responses: { 303: redirect, 422: invalid } },
    },
    '/announcements/{id}': {
      get: { tags: ['Announcement'], summary: 'Announcement detail (HTML)', parameters: [idParam], responses: { 200: html('Detail page'), 404: missing } },
    },
    '/announcements/{id}/edit': {
      get: { tags: ['Announcement'], summary: 'Edit form (HTML)', parameters: [idParam], responses: { 200: html('Pre-filled form'), 404: missing } },
      post: { tags: ['Announcement'], summary: 'Update announcement (form)', parameters: [idParam], responses: { 303: redirect, 404: missing, 422: invalid } },
    },
    '/announcements/{id}/delete': {
      post: { tags: ['Announcement'], summary: 'Delete announcement (form)', parameters: [idParam], responses: { 303: redirect, 404: missing } },
    },

    '/api/announcements': {
      get: { tags: ['ApiAnnouncement'], summary: 'List announcements', responses: { 200: ok('All announcements', { type: 'array', items: announcement }) } },
      post: { tags: ['ApiAnnouncement'], summary: 'Create announcement', requestBody: createAnnouncementBody, responses: { 201: ok('Created', announcement), 422: invalid } },
    },
    '/api/announcements/{id}': {
      get: { tags: ['ApiAnnouncement'], summary: 'Get announcement', parameters: [idParam], responses: { 200: ok('The announcement', announcement), 404: missing } },
      put: { tags: ['ApiAnnouncement'], summary: 'Replace announcement', parameters: [idParam], requestBody: createAnnouncementBody, responses: { 200: ok('Updated', announcement), 404: missing, 422: invalid } },
      patch: { tags: ['ApiAnnouncement'], summary: 'Partially update announcement', parameters: [idParam], requestBody: updateAnnouncementBody, responses: { 200: ok('Updated', announcement), 404: missing, 422: invalid } },
      delete: {
        tags: ['ApiAnnouncement'],
        summary: 'Delete announcement',
        parameters: [idParam],
        responses: { 200: ok('Deleted', { type: 'object', properties: { message: { type: 'string', example: 'Announcement deleted' }, id: { type: 'integer' } } }), 404: missing },
      },
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
    },
  },
};
