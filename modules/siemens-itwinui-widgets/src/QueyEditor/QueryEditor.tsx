// Copyright (c) Bentley Systems
import { Dialog, DialogAlignment } from "@itwin/core-react";
import React, { ChangeEvent, useState } from "react";
import { DialogStateCache } from "../XhqViewsDialog/DialogCache/DialogStateCache";
import { Logger } from "@itwin/core-bentley";
import { ModelessDialog, useActiveViewport } from "@itwin/appui-react";
import { XhqViewsManager } from "../XhqViewsManager";
import { IXhqOptions } from "../XhqViewsDialog/interfaces";
import { Button, Label, Input, Textarea } from "@itwin/itwinui-react";
import { EmphasizeElements, IModelApp, Viewport, ViewPose } from "@itwin/core-frontend";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";


interface IPopupLocationTuple {
  xLocation: number;
  yLocation: number;
  alignment: DialogAlignment;
}
export interface QueryEditorProps {
  opened: boolean;
  onClose?: Function;
  XhqOptions : IXhqOptions;
}

export const QueryEditor = (props: QueryEditorProps) => {
  const viewport = useActiveViewport();
  let _xhqViewsDialogRef: Dialog | undefined;
  const dialogPosition = DialogStateCache.getPosition();
  const [isDialogOpened, setIsDialogOpened] = useState(props.opened);
  const XHQ_VIEWS_DIALOG_ID = "query-views-dialog";
  const [querytext, setQueryText] = React.useState("");

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

    const runQuery = async (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!viewport)
            return;
        try {
            const query = querytext;
            const elementsAsync = viewport.iModel.query(query);
            const elements: string[] = [];
            for await (const element of elementsAsync) {
              elements.push(element[0]);
            }
            const emph = EmphasizeElements.getOrCreate(viewport);
            emph.clearEmphasizedElements(viewport);
            emph.clearOverriddenElements(viewport);
            emph.overrideElements(elements, viewport, ColorDef.from(255,0,0,0),  FeatureOverrideType.ColorOnly, true);
            emph.wantEmphasis = true;
            emph.emphasizeElements(elements, viewport);
            /* All elements that are not overridden are outside the box by default. So to color them we don't need to have elements ids.
            This is done so we would not need to query large amount of elements that are outside the box */
            // EmphasizeElements.;
        }
        catch {
           
        }
    };
      
  const  handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setQueryText(event.target.value)
  }  


  return (
    <ModelessDialog
      id="queryeditor-dialog"
      title= {XhqViewsManager.translate("Query Vizualiser")}
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
      <div className="QueryEditor-dialog-container">
        <Label htmlFor="text-input">
          Query
        </Label>
        <Textarea placeholder="Enter Quey to run"  onChange={handleChange} />,

      </div>
      <Button styleType="high-visibility" onClick={runQuery}>
          {XhqViewsManager.translate("Run")}
      </Button>
    </ModelessDialog>
  );
};
