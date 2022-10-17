// Copyright (c) Bentley Systems
import { Logger } from "@itwin/core-bentley";
import { TRANSIENT_ELEMENT_CLASSNAME } from "@itwin/presentation-frontend";
import { XhqViewsManager } from "../XhqViewsManager";

export class XhqViewsUtilities {
  public static replaceContextualTokenToValue(
    contextualURL: string,
    contextualToken: string,
    replaceValue: string
  ): string {
    const regEx = new RegExp(`{${contextualToken}}`, "ig");
    if (replaceValue !== undefined) {
      return contextualURL.replace(regEx, replaceValue);
    }
    return contextualURL;
  }

  public static getContextualTokenFromURL(urlWithTokens: string): string[] {
    let returnValue: string[] = [];
    const paramsPattern = /[^{\}]+(?=})/g;
    const extractParams = urlWithTokens.match(paramsPattern);
    if (extractParams) returnValue = Array.from(extractParams);
    Logger.logInfo(
      XhqViewsManager.loggerCategory(this),
      `Contextual Token returned for ${returnValue}`
    );
    return returnValue;
  }

  public static getIds(args:any) {
    let allIds: Set<string> = new Set<string>();
    args.instanceKeys.forEach((ids: Set<string>, key: string) => {
      // Avoid transient elements
      if (key !== TRANSIENT_ELEMENT_CLASSNAME) allIds = new Set([...allIds, ...ids]);
    });
    return allIds;
  }

}
