/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import { SvgHelpCircularHollow } from "@itwin/itwinui-icons-react";
import { Alert, IconButton, LabeledSelect, SelectOption, Text, ToggleSwitch } from "@itwin/itwinui-react";
import DisplayStylesApp from "./DisplayStylesApi";
import { displayStyles } from "./Styles";

const CUSTOM_STYLE_INDEX = 0;
const DEFAULT_STYLE_INDEX = 1; // change to default style for display. Color pops out more.

export const DisplayStylesWidget = () => {
  const viewport = useActiveViewport();
  const [activePresetIndex, setActivePresetIndex] = React.useState<number>(DEFAULT_STYLE_INDEX);
  const [mergeState, setMergeState] = React.useState<boolean>(false);

  useEffect(() => {
    if (viewport) {
      let style = displayStyles[activePresetIndex];
      DisplayStylesApp.applyDisplayStyle(viewport, style);

      if (mergeState) {
        style = displayStyles[CUSTOM_STYLE_INDEX];
        DisplayStylesApp.applyDisplayStyle(viewport, style);
      }
    }
  }, [activePresetIndex, mergeState, viewport]);

  const infoLabel = (
    <Text className="info-label">
      Merge with Custom
      <IconButton
        size="small"
        styleType="borderless"
        title="Toggling on will apply the &quot;Custom&quot; style in &quot;Styles.ts&quot; after the selected style is applied.">
        <SvgHelpCircularHollow />
      </IconButton>
    </Text>
  );
  const options: SelectOption<number>[] = displayStyles.map((style, index) => ({ value: index, label: style.name }));

  return (
    <div className="sample-options">
      <div className="sample-grid">
        <LabeledSelect label="Select Style:" size="small" displayStyle="inline" value={activePresetIndex} onChange={setActivePresetIndex} options={options} style={{ width: "auto" }} />
        <ToggleSwitch label={infoLabel} checked={mergeState} onChange={(event) => setMergeState(event.target.checked)} />
      </div>
    </div>
  );
};

export class DisplayStylesWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ViewerOnly2dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Left) {
      widgets.push(
        {
          id: "DisplayStylesWidget",
          label: "Display Styles Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <DisplayStylesWidget />,
        },
      );
    }
    return widgets;
  }
}
