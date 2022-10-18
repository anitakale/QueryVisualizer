// Copyright (c) Bentley Systems
import * as React from "react";
import { IXhqOptions, XhqViewsModelessDialog } from "@bentley/siemens-itwinui-widgets";
import { ModelessDialogManager, StateManager } from "@itwin/appui-react";
import { AppUIProvider } from "../UIProviders/AppUIProvider";
import { SiemensSampleAppActions } from "../Store/SiemensSampleAppStore";
export class XhqViewsDialogStartup {
  public static XhqViewsDialog(): React.ReactNode {
    const closeEvent = () => {
      ModelessDialogManager.closeDialog(AppUIProvider.XHQ_VIEWS_DIALOG_ID);
      StateManager.store.dispatch(SiemensSampleAppActions.setIsXhqViewsDialogOpen(false));
    };

    const clickOnNavigateXhq = (_args: any) => {
      alert("Set the callback in consumer!!");
    }

    return (
      <XhqViewsModelessDialog
        opened={true}
        onClose={closeEvent}
        XhqOptions={{
          xhqBaseUrl: "https://en.wikipedia.org/",
          hideXhqNavbar: true,
          onClickNavigate: clickOnNavigateXhq,
        }}
      />
    );
  }
};
