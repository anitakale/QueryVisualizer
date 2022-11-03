import React from "react";
import { } from "@itwin/itwinui-icons"
import { IconButton } from "@itwin/itwinui-react";
import { SvgEyedropperFilled, SvgIsolate, SvgVisibilityEmphasize, SvgVisibilityHalf, SvgVisibilityHide, SvgVisibilityShow } from "@itwin/itwinui-icons-react";

export interface QueryEditorToolbarProps {
    onIsolate?: () => any;
    onShowAll?: () => any;
    onHideAll?: () => any;
    onInvert?: () => any;
    onEmphasize: () => any;
    isEmphasize: boolean;
    isIsolate: boolean;
} 

export const QueryEditorToolbar = (props: QueryEditorToolbarProps) => {

    // Information about icons:
    // see https://itwin.github.io/iTwinUI-icons/
    // a sample how to use https://codesandbox.io/s/son74?file=/src/App.tsx

    return (

        <>
         <div className="query-toolbar">
            <IconButton
                className={"mybutton-toolbar"}
                title={"Isolate"}
                onClick={props.onIsolate}
                styleType="borderless"
                size="small"
                isActive={props.isIsolate}
            >
                <SvgIsolate />
            </IconButton>
            <IconButton
                className={"mybutton-toolbar"}
                title={"Show All"}
                onClick={props.onShowAll}
                styleType="borderless"
                size="small"
            >
                <SvgVisibilityShow />
            </IconButton>
            <IconButton
                className={"mybutton-toolbar"}
                title={"Hide All"}
                onClick={props.onHideAll}
                styleType="borderless"
                size="small"
            >
                <SvgVisibilityHide />
            </IconButton>
            <IconButton
                className={"mybutton-toolbar"}
                title={"Invert"}
                onClick={props.onInvert}
                styleType="borderless"
                size="small"
            >
                <SvgVisibilityHalf />
            </IconButton>
            <IconButton
                className={"mybutton-toolbar"}
                title={"Emphasize"}
                onClick={props.onEmphasize}
                isActive={props.isEmphasize}
                styleType="borderless"
                size="small"
            >
                <SvgVisibilityEmphasize />
            </IconButton>
        </div>
        </>
    );
}