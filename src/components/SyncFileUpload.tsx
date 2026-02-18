import React, {ChangeEvent, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {styled} from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {compressionValue, pdfFileType, supportedFileTypes} from "../helpers/fileInfo";
import Compress from "compress.js";

const getColor = (props: { isDragAccept: boolean; isDragReject: boolean; isDragActive: boolean }) => {
    if (props.isDragAccept) {
        return '#00e676';
    }
    if (props.isDragReject) {
        return '#ff1744';
    }
    if (props.isDragActive) {
        return '#2196f3';
    }
    return '#eeeeee';
};

// @ts-ignore
const StyledDropzone = styled('div')(
    ({theme, ...props}) => ({
        border: '2px dashed #00e676',
        borderRadius: '5px',
        padding: theme.spacing(2),
        textAlign: 'center',
        transition: 'border .3s ease-in-out',
    }),
);

interface DropzoneDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (file: File) => void;
}

//either compress on upload or add a loading spinner

const SyncFileUpload: React.FC<DropzoneDialogProps> = ({open, onClose, onSave}) => {
    const compress = new Compress()
    const [fileToUpload, setFileToUpload] = useState<{ file: File, name: string } | undefined>(undefined)
    const [fileError, setFileError] = useState<string | undefined>(undefined)
    const handleFileChange = (originalFile: File) => {
        if (!supportedFileTypes.includes(originalFile.type)) {
            setFileError("Unsupported file type. We only support PDF, JPEG, and PNG files.")
            setFileToUpload(undefined)
            return
        }
        setFileError(undefined)
        originalFile.type != pdfFileType ? compress.compress([originalFile], {
            size: 0.5,
            quality: compressionValue,
            resize: true
        }).then((data) => {
            const img = data[0];
            const base64str = img.data;
            const imgExt = img.ext;
            const file = Compress.convertBase64ToFile(base64str, imgExt);
            setFileToUpload({file: file, name: originalFile.name})
        }) : originalFile && setFileToUpload({file: originalFile, name: originalFile.name})
    };
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject,
        acceptedFiles,
    } = useDropzone({
        onDrop: files => handleFileChange(files[0]),
        maxFiles: 1
    });

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Upload File</DialogTitle>
            <DialogContent>
                <StyledDropzone {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
                    <input {...getInputProps()} />
                    <Typography>
                        Drag a file here or click to select a file
                    </Typography>
                </StyledDropzone>
                {fileError && (
                    <Typography variant="body2" sx={{mt: 2, color: 'error.main'}}>
                        {fileError}
                    </Typography>
                )}
                {fileToUpload && (
                    <Typography variant="body2" sx={{mt: 2}}>
                        {fileToUpload?.name}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button color={'secondary'} onClick={() => {
                    onClose()
                    setFileToUpload(undefined)
                }}>Cancel</Button>
                <Button color={'secondary'} onClick={() => {
                    onClose()
                    if (fileToUpload) {
                        onSave(fileToUpload.file)
                    }
                    setFileToUpload(undefined)
                }}
                >Upload</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SyncFileUpload;
