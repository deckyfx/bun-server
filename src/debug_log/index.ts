import PULL from "./pull";
import PUSH from "./push";

export default {
  // * Route name
  "/debug_log": {
    GET: PULL,
    POST: PUSH,
  },
} as const;
