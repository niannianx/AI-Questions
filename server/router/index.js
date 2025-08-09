

import Router from "@koa/router";
import { getUsers, postUser } from "../controller/index.js";
import { getReadmeContent } from "../controller/readme.js";
import { 
  listQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestions,
  generateQuestions 
} from "../controller/question.js";

const router = new Router({
  prefix: "/api",
});
// const router = new Router();
router.get("/users", getUsers);
router.post("/users", postUser);
// router.get("/readme", getReadmeContent);
router.get("/readme", async (ctx) => {
  console.log('收到 /api/readme 请求');
  await getReadmeContent(ctx);
});

// Question routes
router.get("/questions", listQuestions);
router.post("/questions", createQuestion);
router.put("/questions/:id", updateQuestion);
router.post("/questions/delete", deleteQuestions);
router.post("/questions/generate", generateQuestions);

export default router;