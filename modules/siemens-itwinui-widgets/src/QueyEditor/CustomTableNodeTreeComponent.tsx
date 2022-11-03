/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useState } from "react";
import { PropertyRecord } from "@itwin/appui-abstract";
import {
  CellProps,
  ControlledTree, DelayLoadedTreeNodeItem, ITreeDataProvider, PropertyValueRendererManager, SelectionMode, TreeActions, TreeDataChangesListener, TreeModelNode, TreeNodeItem, TreeNodeRendererProps, TreeRenderer, TreeRendererProps,
  useTreeEventsHandler, useTreeModel, useTreeModelSource, useTreeNodeLoader
} from "@itwin/components-react";
import { BeEvent } from "@itwin/core-bentley";
import { ExpansionToggle } from "@itwin/core-react";
import { ColorDef } from "@itwin/core-common";
import { ColorMap } from "@itwin/core-frontend/lib/cjs/render/primitives/ColorMap";
import { PropertyGroup } from "@itwin/presentation-common";
import { ColorPickerPopup } from "@itwin/imodel-components-react";

export interface CustomTableNodeTreeComponentProps {
  legend: Map<string | undefined, { color: ColorDef, elements: string[] }>;
}
/**
 * This component demonstrates use `ControlledTree` with custom nodes rendering. It uses
 * `DataProvider` class to get some fake data to show. Tree by this component is rendered
 * like multi column tree with header at the top and each node divided into three columns.
 *
 * In order to override default rendering in `ControlledTree` custom 'treeRenderer' should
 * be passed to it. In this component 'nodeTableTreeRenderer' is used. It uses default
 * `TreeRenderer` with overridden node renderer.
 */
export const CustomTableNodeTreeComponent = (props: CustomTableNodeTreeComponentProps) => {
  const [width, setWidth] = useState<number>(1000);
  const [height, setHeight] = useState<number>(1000);

  // create data provider to get some nodes to show in tree
  // `React.useMemo' is used avoid creating new object on each render cycle
  const dataProvider = React.useMemo(() => new DataProvider(props.legend), [props.legend]);

  // create model source for tree model. Model source contains tree model and provides an API to modify
  // model and listen for changes in tree model.
  // `useTreeModelSource` creates new model source when 'dataProvider' object changes
  const modelSource = useTreeModelSource(dataProvider);

  // create tree node loader to load nodes to tree model. It uses 'dataProvider' to get
  // nodes and adds them to tree model using 'modelSource'
  const nodeLoader = useTreeNodeLoader(dataProvider, modelSource);

  // create parameters for default tree event handler. It needs 'nodeLoader' to load child nodes when parent node
  // is expanded and 'modelSource' to modify nodes' state in tree model. 'collapsedChildrenDisposalEnabled' flag
  // specifies that child nodes should be removed from tree model when parent node is collapsed.
  // `React.useMemo' is used to avoid creating new params object on each render
  const eventHandlerParams = React.useMemo(() => ({ nodeLoader, modelSource: nodeLoader.modelSource, collapsedChildrenDisposalEnabled: true }), [nodeLoader]);

  // create default event handler. It handles tree events: expanding/collapsing, selecting/deselecting nodes,
  // checking/unchecking checkboxes. It also initiates child nodes loading when parent node is expanded.
  // `useTreeEventsHandler` created new event handler when 'eventHandlerParams' object changes
  const eventHandler = useTreeEventsHandler(eventHandlerParams);

  // get list of visible nodes to render in `ControlledTree`. This is a flat list of nodes in tree model.
  // `useVisibleTreeNodes` uses 'modelSource' to get flat list of nodes and listens for model changes to
  // re-render component with updated nodes list

  const model = useTreeModel(modelSource);

  useEffect(() => {
    const viewerContainer = document.querySelector(".tree-wrapper");
    if (viewerContainer) {
      setWidth(viewerContainer.clientWidth);
      setHeight(viewerContainer.clientHeight);
      const resizeObserver = new ResizeObserver((entries: any) => {
        for (const entry of entries) {
          setWidth(entry.contentRect.width);
          setHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(viewerContainer);
      return () => {
        resizeObserver.unobserve(viewerContainer);
      };
    }
    return () => { };
  }, []);

  return <>
        
    <div className="custom-tree">
      <div className="tree-header">
        <span className="col-1">Label</span>
        <span className="col-2">Color</span>
      </div>
      <div className="tree-wrapper">
        <ControlledTree
          nodeLoader={nodeLoader}
          selectionMode={SelectionMode.None}
          eventsHandler={eventHandler}
          model={model}
          width={width}
          height={height}
          treeRenderer={nodeTableTreeRenderer}
        />
      </div>
    </div>

  </>;

};

/** Custom tree renderer that overrides default node renderer to render node as table row */
const nodeTableTreeRenderer = (props: TreeRendererProps) => (
  <TreeRenderer
    {...props}
    nodeRenderer={nodeTableRenderer}
  />
);

/** Custom node renderer that renders node in three columns */
const nodeTableRenderer = (props: TreeNodeRendererProps) => {
  return <NodeTable
    treeActions={props.treeActions}
    node={props.node}
  />;
};

/** Functional component that renders node in three columns */
function NodeTable(props: { treeActions: TreeActions, node: TreeModelNode }) {
  const onExpansionToggle = React.useCallback(() => {
    if (props.node.isExpanded)
      props.treeActions.onNodeCollapsed(props.node.id);
    else
      props.treeActions.onNodeExpanded(props.node.id);
  }, [props.node, props.treeActions]);

  const expansionToggle = React.useMemo(() => {
    return <ExpansionToggle
      className="expansion-toggle"
      onClick={onExpansionToggle}
      isExpanded={props.node.isExpanded}
    />;
  }, [onExpansionToggle, props.node]);

  const offset = props.node.depth * 20 + (props.node.numChildren === 0 ? 25 : 0);

  const updateData = (_cellProps: {value: ColorDef, name: string}, _value: any) => {
    // Todo we should have here the code to triger the update of the color map.
    // unsure how to pass on a callback uptill this level.
  };

  return (
    <div className="table-node">
      <div className="col-1" >
        <div className="node-offset" style={{ marginLeft: offset }}>
          {props.node.numChildren !== 0 && expansionToggle}
          {PropertyValueRendererManager.defaultManager.render(props.node.label)}
        </div>
      </div>
      <div className="col-2">
        <ColorPickerCell cellProps={props.node.item?.extendedData?.color} updateData={updateData} />
      </div>
    </div>
  );
}

/** Data provider that is used to get some fake nodes */
class DataProvider implements ITreeDataProvider {
  colormap  :  Map<string | undefined, { color: ColorDef, elements: string[] }> = new Map();

  constructor(_colormap: Map<string | undefined, { color: ColorDef, elements: string[] }>) {
    this.colormap = _colormap;
  }

  updateMap(_colormap: Map<string | undefined, { color: ColorDef, elements: string[] }>) {
    this.colormap = _colormap;
  }

  public onTreeNodeChanged = new BeEvent<TreeDataChangesListener>();
  public async getNodesCount(parent?: TreeNodeItem) {
    if (parent === undefined)
      return this.colormap.size;

    const node = this.colormap.get(parent.id);
    if(node === undefined)
      return 0;
    return node.elements.length
  }

  public async getNodes(parent?: TreeNodeItem) {
    if(parent == undefined) {
      const result : DelayLoadedTreeNodeItem[] = [];
      this.colormap.forEach((value, key) => {
        result.push({
          id: key!,
          label: PropertyRecord.fromString(key!),
          extendedData: { color: {value: value.color, name: key} },
          hasChildren: false
        });
      })
      return result;
    }  
    return [];
  }
}

export const ColorPickerCell = (props: {
  cellProps: {name: string, value: ColorDef};
  updateData?: (
    cellProps: {name: string, value: ColorDef},
    color: ColorDef
  ) => void;
}) => {
  // tslint:disable-line:variable-name
  const { cellProps, updateData } = props;

  const onClose = (color: ColorDef) => {
    updateData?.(cellProps, color);
  };

  return (
    <ColorPickerPopup
      initialColor={cellProps.value}
      onClose={onClose}
      captureClicks={true}
      colorInputType="hex"
    />
  );
};
