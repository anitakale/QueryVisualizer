// Copyright (c) Bentley Systems
interface IDialogPosition {
  xPosition: number | undefined;
  yPosition: number | undefined;
  widthViewPortDialog: number | undefined;
  heightViewPortDialog: number | undefined;
}

export class DialogStateCache {
  private static dialogPosition: IDialogPosition;
  private static predefinedLinkStored: string = "";

  public static EXTERNAL_VIEWS_DIALOG_ID = "external-views-dialog";

  private static getDialogPositionEntry(): IDialogPosition {
    return DialogStateCache.dialogPosition;
  }

  public static getPosition(): IDialogPosition {
    if (!DialogStateCache.dialogPosition) {
      DialogStateCache.dialogPosition = {
        xPosition: undefined,
        yPosition: undefined,
        widthViewPortDialog: undefined,
        heightViewPortDialog: undefined,
      };
    }
    return DialogStateCache.getDialogPositionEntry();
  }
  public static storePosition(dialogState: any) {
    if (dialogState) {
      const dialogPosition = DialogStateCache.getDialogPositionEntry();
      dialogPosition.xPosition = dialogState.x;
      dialogPosition.yPosition = dialogState.y;
      dialogPosition.widthViewPortDialog = dialogState.width;
      dialogPosition.heightViewPortDialog = dialogState.height;
    } else {
      // eslint-disable-next-line
      console.log("DialogState not defined");      
    }
  }

  public static getStoredPredefinedLink() {
    return DialogStateCache.predefinedLinkStored;
  }

  public static setStoredPredefinedLink(link: string) {
    DialogStateCache.predefinedLinkStored = link;
  }
}
