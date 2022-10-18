import { MarkupFrontstageConstants } from "@bentley/itwin-markup-frontstage";
import { CommonToolbarItem, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsProvider } from "@itwin/appui-abstract";
import { ModelessDialogManager, StateManager } from "@itwin/appui-react";
import { IModelApp } from "@itwin/core-frontend";
import { XhqViewsDialogStartup } from "../Components/XhqViewsDialogStartup";
import { SiemensSampleAppActions } from "../Store/SiemensSampleAppStore";
export class AppUIProvider implements UiItemsProvider {
    public readonly id = "SiemensAppUIProvider";
    public static XHQ_VIEWS_DIALOG_ID = "xhq-views-dialog";

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
                  `icon-panorama`,
                  IModelApp.localization.getLocalizedString("VisualizerApp:buttons.xhqViewsDialog"),
                  (): void => {
                    let manager = StateManager.store.getState();
                    if (StateManager.store.getState().SiemensSampleApp.isXhqViewsDialogOpen) {
                      ModelessDialogManager.closeDialog(AppUIProvider.XHQ_VIEWS_DIALOG_ID);
        
                      StateManager.store.dispatch(SiemensSampleAppActions.setIsXhqViewsDialogOpen(false));
                    } else {
                      ModelessDialogManager.openDialog(
                        XhqViewsDialogStartup.XhqViewsDialog(),
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