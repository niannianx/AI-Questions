import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaStatic from "koa-static";
import router from "./router/index.js";
import { errorHandler } from "./middleware/index.js";
import { staticMiddleware } from "./config/static.js";
import send from 'koa-send';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = new Koa();

// process.on("uncaughtException", (err, origin) => {
//   console.log(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
// });

// 静态资源中间件
app.use(koaStatic(join(__dirname, "../client/dist")));
// 静态资源中间件
app.use(staticMiddleware[0]); // 前端dist
app.use(staticMiddleware[1]); // 图片资源

// 解析请求体里面的参数的
app.use(bodyParser());
app.use(errorHandler());
app.use(router.routes());
// 假如请求了一个不存在的方法，会返回 405，Method Not Allowed
app.use(router.allowedMethods());

// History API Fallback - 确保在所有路由之后
app.use(async (ctx) => {
  // 只处理 GET 请求，且不是 API 请求
  if (ctx.method === 'GET' && !ctx.url.startsWith('/api')) {
    try {
      await send(ctx, 'index.html', { root: join(__dirname, "../client/dist") });
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }
    }
  }
});

app.listen(8080, () => {
  console.log("The server is running on http://127.0.0.1:8080");
});