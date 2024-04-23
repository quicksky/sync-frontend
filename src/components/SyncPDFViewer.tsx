import React from 'react'
import {defaultLayoutPlugin, ToolbarProps} from "@react-pdf-viewer/default-layout";
import {ReactElement} from "react";
import {Button, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {Viewer} from "@react-pdf-viewer/core";


interface SyncPDFViewerProps {
    fileUrl: string,
    onClose: () => void
}

const SyncPDFViewer: React.FC<SyncPDFViewerProps> = ({fileUrl, onClose}) => {
    const renderToolbar = (Toolbar: (props: ToolbarProps) => ReactElement) => (
        <>
            <Toolbar/>
            <IconButton onClick={() => onClose()}>
                <Close></Close>
            </IconButton>
        </>
    );

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar,
    });

    //fix sizing
    return (
        <div style={{
            borderColor: '#20202e',
            backgroundColor: 'inherit',
            margin: 'auto',
            padding: 20,
            border: '1px solid #888',
            width: '80%',
            maxHeight: '90vh',
            overflowY: 'auto',

        }}>
            <Viewer
                plugins={[defaultLayoutPluginInstance]}
                fileUrl={fileUrl}
            />
        </div>
    )
}

export default SyncPDFViewer;