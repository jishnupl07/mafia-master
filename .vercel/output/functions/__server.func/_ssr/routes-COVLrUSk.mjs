import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-COVLrUSk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MafiaModerator = (0, import_react.lazy)(() => import("./MafiaModerator-B4OZqPjC.mjs"));
function Index() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-[#0F172A]" }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MafiaModerator, {})
	});
}
//#endregion
export { Index as component };
