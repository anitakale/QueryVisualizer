import { MarkupFrontstageConstants } from "@bentley/itwin-markup-frontstage";
import { CommonToolbarItem, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsProvider } from "@itwin/appui-abstract";
import { ModelessDialogManager, StateManager } from "@itwin/appui-react";
import { XhqViewsDialogStartup } from "../Components/XhqViewsDialogStartup";
import { SiemensSampleAppActions } from "../Store/SiemensSampleAppStore";
import { ReactComponent as xhqIcon } from '../Icons/xhq-view.svg';
import { IXhqOptions } from "@bentley/siemens-itwinui-widgets";

export interface AppUIProviderProps {
  XhqOptions : IXhqOptions;
}
export class AppUIProvider implements UiItemsProvider {
    public readonly id = "SiemensAppUIProvider";
    public static XHQ_VIEWS_DIALOG_ID = "xhq-views-dialog";
    private _props?: AppUIProviderProps;

    constructor(props?: AppUIProviderProps) {
      this._props = props;
    }
  
    public provideToolbarButtonItems(
        stageId: string,
        stageUsage: string,
        toolbarUsage: ToolbarUsage,
        toolbarOrientation: ToolbarOrientation,
      ): CommonToolbarItem[] {
        if (stageUsage !== StageUsage.General) return [];
         if (stageId === MarkupFrontstageConstants.FRONTSTAGE_ID) return [];
        
        const toolbarItems: CommonToolbarItem[] = [];
    
        if (
            toolbarUsage === ToolbarUsage.ContentManipulation &&
            toolbarOrientation === ToolbarOrientation.Horizontal
          ) {
                const xhqViewPortButton = ToolbarItemUtilities.createActionButton(
                  "xhq-views",
                  54,
                  `svg:${xhqIcon}`,
                  "XHQ Views Dialog",
                  (): void => {
                    if (StateManager.store.getState().SiemensSampleApp.isXhqViewsDialogOpen) {
                      ModelessDialogManager.closeDialog(AppUIProvider.XHQ_VIEWS_DIALOG_ID);
        
                      StateManager.store.dispatch(SiemensSampleAppActions.setIsXhqViewsDialogOpen(false));
                    } else {
                      ModelessDialogManager.openDialog(
                        XhqViewsDialogStartup.XhqViewsDialog(this._props?.XhqOptions!),
                        AppUIProvider.XHQ_VIEWS_DIALOG_ID,
                      );
                      StateManager.store.dispatch(SiemensSampleAppActions.setIsXhqViewsDialogOpen(true));
                    }
                  },
                  { 
                    groupPriority: 20,
                  }
                );
                toolbarItems.push(xhqViewPortButton);
          }
        return toolbarItems;
      }
}