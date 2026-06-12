const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");

const {
  getDashboardOverview,
  getAllUsers,
  getUserDetails,
  createUser,
  createAdmin,
  makeAdmin,
  removeAdmin,
  deleteUser,
  getAllAgents,
  getUserAgents,
  getAgentMessages,
  getUserMessages
} = require("../controllers/admin");

const router = express.Router();

router.use(authenticateToken);
router.use(isAdmin);

router.get("/overview", getDashboardOverview);

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.get("/users/:userId", getUserDetails);
router.delete("/users/:userId", deleteUser);

router.post("/admins", createAdmin);
router.put("/users/:userId/make-admin", makeAdmin);
router.put("/users/:userId/remove-admin", removeAdmin);

router.get("/agents", getAllAgents);
router.get("/users/:userId/agents", getUserAgents);

router.get("/agents/:agentId/messages", getAgentMessages);
router.get("/users/:userId/messages", getUserMessages);

module.exports = router;