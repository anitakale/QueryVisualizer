import React from "react";
import { } from "@itwin/itwinui-icons"
import { IconButton } from "@itwin/itwinui-react";
import { SvgIsolate, SvgVisibilityShow } from "@itwin/itwinui-icons-react";

export const QueryEditorToolbar = () => {


    const onIsolate = () => {

    };

    const onShowAll = () => {

    };

    const onHideAll = () => {

    };

    const onInvert = () => {

    };

    // Information about icons:
    // see https://itwin.github.io/iTwinUI-icons/
    // a sample how to use https://codesandbox.io/s/son74?file=/src/App.tsx

    return (

        <>
         <div className="query-toolbar">
            <IconButton
                className={"mybutton-toolbar"}
                title={"Isolate"}
                onClick={onIsolate}
                styleType="borderless"
                size="small"
            >
                <SvgIsolate />
            </IconButton>
            <IconButton
                className={"mybutton-toolbar"}
                title={"Show All"}
                onClick={onShowAll}
                styleType="borderless"
                size="small"
            >
                <SvgVisibilityShow />
            </IconButton>
            <IconButton
                className={"mybutton-toolbar"}
                title={"Hide All"}
                onClick={onHideAll}
                styleType="borderless"
                size="small"
            >
                <SvgVisibilityShow />
            </IconButton>
            <IconButton
                className={"mybutton-toolbar"}
                title={"Invert"}
                onClick={onInvert}
                styleType="borderless"
                size="small"
            >
                <SvgVisibilityShow />
            </IconButton>
        </div>
        </>
    );
}