// Copyright (c) Bentley Systems
import { Dialog, DialogAlignment } from "@itwin/core-react";
import React, { ChangeEvent, useState } from "react";
import { DialogStateCache } from "../XhqViewsDialog/DialogCache/DialogStateCache";
import { Logger } from "@itwin/core-bentley";
import { MessageManager, ModelessDialog, useActiveViewport } from "@itwin/appui-react";
import { XhqViewsManager } from "../XhqViewsManager";
import { IXhqOptions } from "../XhqViewsDialog/interfaces";
import { Button, Label, Input, Textarea, LabeledSelect, SelectOption } from "@itwin/itwinui-react";
import { EmphasizeElements, IModelApp, NotifyMessageDetails, OutputMessageAlert, OutputMessagePriority, OutputMessageType, Viewport, ViewPose } from "@itwin/core-frontend";
import { ColorDef, FeatureAppearance, FeatureOverrideType, HSVColor, QueryRowFormat } from "@itwin/core-common";
import { CustomTableNodeTreeComponent } from "./CustomTableNodeTreeComponent";
import "./CustomTableNodeTree.scss";
import "./QueryEditor.scss";
import { stringify } from "querystring";
import Queries from "./queries.json";


interface IPopupLocationTuple {
  xLocation: number;
  yLocation: number;
  alignment: DialogAlignment;
}
export interface QueryEditorProps {
  opened: boolean;
  onClose?: Function;
  XhqOptions: IXhqOptions;
}

export const QueryEditor = (props: QueryEditorProps) => {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const viewport = useActiveViewport();
  let _xhqViewsDialogRef: Dialog | undefined;
  const dialogPosition = DialogStateCache.getPosition();
  const [isDialogOpened, setIsDialogOpened] = useState(props.opened);
  const XHQ_VIEWS_DIALOG_ID = "query-views-dialog";
  // queryText contains the content of the Text area of the ecsql query.
  const [querytext, setQueryText] = React.useState("SELECT rel.SourceEcInstanceId EcInstanceId, strftime('%Y-%m-%d',LastMod) Condition From ProcessFunctional.NAMED_ITEM item, Biscore.ElementRefersToElements rel WHERE item.EcInstanceId = rel.TargetEcInstanceId");
  // queryResults contains the full result of the query as is.
  const [queryResults, setQueryResults] = React.useState<any>([]);
  // Contains the condition mapped to color and an array of element ids (= ecinstance ids)
  const [colorMap, setColorMap] = React.useState<Map<string | undefined, { color: ColorDef, elements: string[] }>>(new Map());

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
    if (viewport) {
      // Restore to the viewport to the default colors.
      const emph = EmphasizeElements.getOrCreate(viewport);
      emph.clearEmphasizedElements(viewport);
      emph.clearIsolatedElements(viewport);
      emph.clearOverriddenElements(viewport);
    }
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
      return; // if there is no valid viewport there is no point to continue.
    try {
      const query = querytext;
      // Run the query and request specific format of result. 
      // Maybe there is a better way, more efficient way to know what column is Condition or EcInstanceId
      // instead of full descriptive json objects. (see rowFormat options)
      const elementsAsync = viewport.iModel.query(query, undefined,
        {
          includeMetaData: true,
          convertClassIdsToClassNames: false,
          rowFormat: QueryRowFormat.UseECSqlPropertyNames
        });
      const elements: any[] = [];
      for await (const element of elementsAsync) {
        // unsure how to check if query contains EcInstanceId column and Condition column.
        // If for some reason the values are null for an object the property is not defined in json object, 
        // if(element.EcInstanceId === null || element.EcInstanceId === undefined)
        //  throw "EcInstanceId is not defined in query as a column name.";
        elements.push(element);
      }
      // Set the results, so if we want to have an additional effect to display the results
      // We can do so, for example to update the chart.
      setQueryResults(elements);

      // Generate a colormap based on the results.
      const colormap: Map<string | undefined, { color: ColorDef, elements: string[] }> = new Map();
      for (const element of elements) {
        // Check if ecinstanceid is valid else skip the result.
        // This can happen with a query that provides 3d ids and null 3d ids if not aggregated.
        // See example mail. 
        if (element.EcInstanceId === undefined || element.EcInstanceId === null)
          continue;
        if (colormap.has(element.Condition)) {
          colormap.get(element.Condition)?.elements.push(element.EcInstanceId);
        }
        else {
          colormap.set(element.Condition, {
            color: ColorDef.fromHSV(
              new HSVColor(randomInt(0, 360), randomInt(60, 100), 100)),
            elements: []
          });
          colormap.get(element.Condition)?.elements.push(element.EcInstanceId);
        }
      }
      // Setting the new color map. An effect could be created to update the legend accoridingly.
      // Legen is basicly iterating over the key values and display value.color
      setColorMap(colormap);
    }
    catch (_error) {
      // Not sure if we should log somehow the full stack trace.
      // What is the best practice here ?
      // process.stdout.write(JSON.stringify(JSON.stringify(_error)));
      if (_error instanceof Error) {
        MessageManager.addToMessageCenter(
          new NotifyMessageDetails(OutputMessagePriority.Error, _error.message, undefined, OutputMessageType.Alert, OutputMessageAlert.Dialog)
        );
      }
    }
  };

  // Helper funcvtion for generating random colors.
  const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const applyQueryResults = async (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!viewport)
      return;
    try {

      const emph = EmphasizeElements.getOrCreate(viewport);
      emph.clearEmphasizedElements(viewport);
      emph.clearOverriddenElements(viewport);
      emph.clearIsolatedElements(viewport);
      let replace = true;
      colorMap.forEach((value: { color: ColorDef, elements: string[] }, _key: string | undefined) => {
        emph.overrideElements(value.elements, viewport, value.color, FeatureOverrideType.ColorOnly, replace);
        emph.emphasizeElements(value.elements, viewport, undefined, replace);
        // This is a line to enable isolation. Will be needed for restrooms demo.
        // emph.isolateElements(value.elements, viewport, replace);
        replace = false;
      });
      emph.wantEmphasis = true;


      /* All elements that are not overridden are outside the box by default. So to color them we don't need to have elements ids.
      This is done so we would not need to query large amount of elements that are outside the box */
      // EmphasizeElements.;
    }
    catch (_error) {
      // process.stdout.write(JSON.stringify(JSON.stringify(_error)));
      if (_error instanceof Error) {
        MessageManager.addToMessageCenter(
          new NotifyMessageDetails(OutputMessagePriority.Error, _error.message, undefined, OutputMessageType.Alert)

        );
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQueryText(event.target.value)
  }

  const getQueries = (): SelectOption<string>[] => {
    return Queries.map((item: any) => {
      return {
        value: item.value,
        label: item.label,
      };
    });
  };

  return (
    <ModelessDialog
      id="queryeditor-dialog"
      title={XhqViewsManager.translate("Query Vizualiser")}
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

        <Label>Vizual Name</Label>
        <select onChange={value => { setSelectedValue(value.currentTarget.innerText); setQueryText(value.currentTarget.value) }}>
          {Queries.map((item) => (
            <option value={item.value}>{item.label}</option>
          ))}
        </select>
        <Label htmlFor="text-input">
          Query
        </Label>
        <Textarea placeholder="Enter Quey to run" onChange={handleChange} value={querytext} />,

      </div>
      <Button styleType="high-visibility" onClick={runQuery}>
        {XhqViewsManager.translate("Generate")}
      </Button>
      <Label htmlFor="text-input">
        Legend
      </Label>
     
      <div className="legend-container">
        <CustomTableNodeTreeComponent 
          legend={colorMap} />
      </div>

      <Button styleType="high-visibility" onClick={applyQueryResults}>
        {XhqViewsManager.translate("Apply")}
      </Button>
    </ModelessDialog>
  );
};
