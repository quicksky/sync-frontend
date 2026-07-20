import React from 'react'
import {defaultLayoutPlugin, ToolbarProps} from "@react-pdf-viewer/default-layout";
import {ReactElement} from "react";
import {Button, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {Viewer} from "@react-pdf-viewer/core";
import {useMediaQuery} from "react-responsive";
import {isMobile} from "../helpers/isMobile";


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
            backgroundColor: '#fff',
            margin: '20px auto',
            padding: 20,
            borderRadius: 12,
            border: '1px solid rgba(21, 34, 56, 0.12)',
            boxShadow: '0 1px 2px rgba(21, 34, 56, 0.04), 0 1px 8px rgba(21, 34, 56, 0.06)',
            width: isMobile() ? '100%' : "80%",
            maxHeight: isMobile() ? '10vh' : '90vh',
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