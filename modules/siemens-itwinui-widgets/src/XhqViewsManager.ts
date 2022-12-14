// Copyright (c) Bentley Systems
import { ITwinLocalization } from "@itwin/core-i18n";
import { getClassName, UiError } from "@itwin/appui-abstract";
import { ISVCommonUtilitiesManager } from "@bentley/isv-common-utilities";
import { UiFramework } from "@itwin/appui-react";
import { IModelConnection } from "@itwin/core-frontend";

export class XhqViewsManager {
    private static _i18n?: ITwinLocalization;

    public static async initialize(i18n: ITwinLocalization,iModelConnection:IModelConnection): Promise<void> {
        XhqViewsManager._i18n = i18n;
        ISVCommonUtilitiesManager.initialize(UiFramework.store,iModelConnection);
        return XhqViewsManager._i18n.registerNamespace(XhqViewsManager.i18nNamespace);
    }

    public static terminate() {
        if (XhqViewsManager._i18n) {
            XhqViewsManager._i18n.unregisterNamespace(
                XhqViewsManager.i18nNamespace
          );
        }
        XhqViewsManager._i18n = undefined;
      }
    
    public static get i18nNamespace() : string {
        return "XhqViewsContent";
    }

    public static get packageName(): string {
        return "siemens-itwinui-widgets";
      }
    
    public static get i18n(): ITwinLocalization {
        if (!XhqViewsManager._i18n) {
            throw new UiError(
                XhqViewsManager.loggerCategory(this),
              "xhqViews not initialized"
            );
          }
          return XhqViewsManager._i18n;
    }

    public static translate: typeof XhqViewsManager.i18n.getLocalizedString = (
      key,
      options
    ) => {
      return XhqViewsManager.i18n.getLocalizedStringWithNamespace(
        XhqViewsManager.i18nNamespace,
        key,
        options
      );
    };

    public static loggerCategory(obj:any): any {
        const className = getClassName(obj);
        const category =
        XhqViewsManager.packageName + (className ? `.${className}` : "");
        return category;
    }
}