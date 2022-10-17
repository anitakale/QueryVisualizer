// Copyright (c) Bentley Systems
import { Dialog, DialogAlignment } from "@itwin/core-react";
import React, { useState } from "react";
import { XhqViewsContent } from "./XhqViewsContent";
import { DialogStateCache } from "./DialogCache/DialogStateCache";
import { Logger } from "@itwin/core-bentley";
import { PopoutButton } from "../Popout/PopoutButton";
import { ModelessDialog } from "@itwin/appui-react";
import { XhqViewsManager } from "../XhqViewsManager";
import { IXhqOptions } from "../XhqViewsDialog/interfaces";

interface IPopupLocationTuple {
  xLocation: number;
  yLocation: number;
  alignment: DialogAlignment;
}
export interface XhqViewsDialogProps {
  opened: boolean;
  onClose?: Function;
  XhqOptions : IXhqOptions;
}

export const XhqViewsModelessDialog = (
  props: XhqViewsDialogProps
) => {
  let _xhqViewsDialogRef: Dialog | undefined;
  const dialogPosition = DialogStateCache.getPosition();
  const [isDialogOpened, setIsDialogOpened] = useState(props.opened);
  const XHQ_VIEWS_DIALOG_ID = "xhq-views-dialog";
  React.useEffect(() => {
    return function cleanup() {
      handleClose();
    };
  }, []);

  const handleClose = () => {
    setIsDialogOpened(false);
    if (_xhqViewsDialogRef?.state) {
      DialogStateCache.storePosition(_xhqViewsDialogRef?.state);
    }
    if (props.onClose) props.onClose();
    Logger.logInfo(
      XhqViewsManager.loggerCategory(this),
      `Modeless External views Dialog closed`
    );
  };

  const handleMouseLeave = () => {
    DialogStateCache.storePosition(_xhqViewsDialogRef?.state);
  };

   const _setDialogState = (openState: boolean) => {
    setIsDialogOpened(openState);
  };

   const _getDialogRef = (): React.ReactNode => {
    return _xhqViewsDialogRef?.props.children;
  };

  const getLocationOfPopup = (
    proposedWidth: number,
    proposedHeight: number
  ) => {
    let returnValue = {
      xLocation: window.innerWidth - proposedWidth - 90,
      yLocation: window.innerHeight - proposedHeight - 90,
      alignment: DialogAlignment.Center,
    };
    const translatedTitle = XhqViewsManager.translate("xhqViewsDialog")
    const xToolBarItemItem: NodeListOf<Element> = document.querySelectorAll(
      `[title="${translatedTitle}"][class="nz-toolbar-item-item"]`
    );
    if (xToolBarItemItem.length > 0) {
      returnValue = {
        xLocation: xToolBarItemItem[0].getBoundingClientRect().left,
        yLocation:
          xToolBarItemItem[0].getBoundingClientRect().top +
          xToolBarItemItem[0].getBoundingClientRect().height +
          10,
        alignment: DialogAlignment.TopLeft,
      };
    } else {
      let nineZoneDiv: Element | null =
        document.getElementById("uifw-ninezone-area");
      if (null === nineZoneDiv) {
        nineZoneDiv =
          document.getElementsByClassName("collapseButton").length > 0
            ? document.getElementsByClassName("collapseButton")[0]
            : null;
      }
      if (nineZoneDiv !== null) {
        returnValue = {
          xLocation: nineZoneDiv.getBoundingClientRect().left + 90,
          yLocation: returnValue.yLocation,
          alignment: DialogAlignment.BottomLeft,
        };
      }
    }
    return returnValue;
  };

  const _setDialogElementRef = (element: any) => {
    _xhqViewsDialogRef = element;
  };

  const width = dialogPosition.widthViewPortDialog
    ? dialogPosition.widthViewPortDialog
    : 400;
  const height = dialogPosition.heightViewPortDialog
    ? dialogPosition.heightViewPortDialog
    : 350;
  const xLocationAndAlignemntComputed: IPopupLocationTuple = getLocationOfPopup(
    width,
    height
  );
  const x = dialogPosition.xPosition
    ? dialogPosition.xPosition
    : xLocationAndAlignemntComputed.xLocation;
  const y = dialogPosition.yPosition
    ? dialogPosition.yPosition
    : xLocationAndAlignemntComputed.yLocation;

  return (
    <ModelessDialog
      id="imodel-viewport-dialog"
      title= {XhqViewsManager.translate("OIView")}
      opened={isDialogOpened}
      resizable={true}
      movable={true}
      modal={false}
      width={width}
      height={height}
      x={x}
      y={y}
      minWidth={400}
      minHeight={350}
      onClose={handleClose}
      onEscape={handleClose}
      onMouseLeave={handleMouseLeave}
      alignment={xLocationAndAlignemntComputed.alignment}
      ref={_setDialogElementRef}
      dialogId={XHQ_VIEWS_DIALOG_ID}
    >
      <PopoutButton
        windowId={XHQ_VIEWS_DIALOG_ID}
        windowTitle={XhqViewsManager.translate("OIView")}
        componentToPopout={_getDialogRef}
        setDialogStateCallback={_setDialogState}
        width={width}
        height={height}
      />
      <div className="imodel-viewport-dialog-container">
        <XhqViewsContent
         XhqOptions={props.XhqOptions}
        />
      </div>
    </ModelessDialog>
  );
};
