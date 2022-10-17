// Copyright (c) Bentley Systems
import React from "react";
import { UiFramework } from "@itwin/appui-react";
import "./PopoutButton.scss";
import { Icon } from "@itwin/core-react";

export interface PopoutButtonProps {
  windowTitle: string;
  windowId: string;
  componentToPopout: Function;
  setDialogStateCallback?: Function;
  width?: number;
  height?: number;
}

export const PopoutButton = (props: PopoutButtonProps) => {
  const openPopout = () => {
    const childWindowId = props.windowId;
    const title = props.windowTitle;
    const width = props.width ? props.width : 400;
    const height = props.height ? props.height : 350;
    let elementToPopout = props.componentToPopout();
    if (elementToPopout && elementToPopout.length > 0) {
      elementToPopout = elementToPopout.filter(
        (child: { type: { name: string } }) =>
          child.type.name !== "PopoutButton"
      );
    }
    const content = <div className="popoutWrapper">{elementToPopout}</div>;
    const location = { height, width, left: 10, top: 50 };
    UiFramework.childWindowManager.openChildWindow(
      childWindowId,
      title,
      content,
      location,
      false
    );
    const childWindow =
      UiFramework.childWindowManager.findChildWindow(childWindowId);
    if (childWindow) {
      if (props.setDialogStateCallback) props.setDialogStateCallback(false);

      childWindow.window.document.title = props.windowTitle;
      childWindow.window.addEventListener("beforeunload", () => {
        if (props.setDialogStateCallback) props.setDialogStateCallback(true);
      });
      childWindow.window.focus();
    }
  };

  return (
    <div onClick={openPopout}>
      <Icon iconSpec="icon-window-new" className="popoutButton" />
    </div>
  );
};

export function closePopoutWindow(childWindowId: string) {
  UiFramework.childWindowManager.closeChildWindow(childWindowId);
}

export function focusPopoutWindow(childWindowId: string) {
  const child = UiFramework.childWindowManager.findChildWindow(childWindowId);
  if (child) child.window.focus();
}
