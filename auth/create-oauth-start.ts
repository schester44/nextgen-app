import { OAuthStartOptions } from "./types";
import debug from "debug";
import Errors, { AuthError } from "./errors";
import oAuthQueryString from "./oauth-query-string";
import getCookieOptions from "./cookie-options";

import { TOP_LEVEL_OAUTH_COOKIE_NAME } from "./index";

const log = debug("server.createOAuthStart");

export default function createOAuthStart(
  options: OAuthStartOptions,
  callbackPath: string
) {
  return function oAuthStart(req, res, next) {
    const { serviceDomain } = options;
    const { query } = req;
    const { account } = query;

    log({ account, query, serviceDomain });

    const accountRegex = new RegExp(
      `^[a-z0-9][a-z0-9\\-]*[a-z0-9]\\.${serviceDomain}$`,
      "i"
    );

    if (account == null || !accountRegex.test(account)) {
      return next(new AuthError(Errors.AccountParamMissing, 400));
    }

    res.cookie(TOP_LEVEL_OAUTH_COOKIE_NAME, "", getCookieOptions(req));

    const formattedQueryString = oAuthQueryString(
      req,
      res,
      options,
      callbackPath
    );

    res.redirect(
      // TODO: Putting :3000 here for dev purposes.. `acccount` value can be modified using optiosn in `appAuth`
      // FIXME: This should be https://
      `http://${account}:3000/apps/oauth/authorize?${formattedQueryString}`
    );
  };
}
