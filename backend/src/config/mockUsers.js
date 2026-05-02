/** In-memory users when SKIP_DATABASE=true (same IDs as JWT payload). */

const mockUsers = [
  {
    _id: 'mock-admin-1',
    name: 'Admin User',
    email: 'admin@safespace.com',
    password: 'password',
    role: 'admin',
    lastActive: new Date(),
    async matchPassword(enteredPassword) {
      return enteredPassword === this.password;
    },
  },
  {
    _id: 'mock-responder-1',
    name: 'John Responder',
    email: 'responder@safespace.com',
    password: 'password',
    role: 'responder',
    lastActive: new Date(),
    async matchPassword(enteredPassword) {
      return enteredPassword === this.password;
    },
  },
];

function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}

function getMockUserByEmail(email) {
  const e = normalizeEmail(email);
  return mockUsers.find((u) => u.email === e);
}

function getMockUserById(id) {
  const sid = id != null ? String(id) : '';
  return mockUsers.find((u) => u._id === sid);
}

/** Shape compatible with Mongoose user + routes using req.user.id */
function attachMockUser(mock) {
  if (!mock) return null;
  return {
    _id: mock._id,
    id: mock._id,
    name: mock.name,
    email: mock.email,
    role: mock.role,
    lastActive: mock.lastActive,
  };
}

module.exports = {
  mockUsers,
  getMockUserByEmail,
  getMockUserById,
  attachMockUser,
  normalizeEmail,
};
