import React, {ChangeEvent, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {CloudUpload} from '@mui/icons-material';
import {compressionValue, pdfFileType, supportedFileTypes} from "../helpers/fileInfo";
import Compress from "compress.js";

const getColor = (theme: any, props: { isDragAccept: boolean; isDragReject: boolean; isDragActive: boolean }) => {
    if (props.isDragAccept) {
        return theme.palette.success.main;
    }
    if (props.isDragReject) {
        return theme.palette.error.main;
    }
    if (props.isDragActive) {
        return theme.palette.secondary.dark;
    }
    return theme.palette.divider;
};

// @ts-ignore
const StyledDropzone = styled('div')(
    ({theme, ...props}) => ({
        border: `2px dashed ${getColor(theme, props as any)}`,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(3),
        textAlign: 'center',
        backgroundImage: 'linear-gradient(180deg, #FBFCFE 0%, #F5F7FB 100%)',
        transition: 'border-color .2s ease-in-out, background-color .2s ease-in-out, transform .2s ease-in-out',
        cursor: 'pointer',
        transform: (props as any).isDragActive ? 'scale(1.01)' : 'scale(1)',
        '&:hover': {
            backgroundImage: 'linear-gradient(180deg, #F5F7FB 0%, #EFF2F7 100%)',
        },
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
                    <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        mx: 'auto',
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: 'linear-gradient(135deg, #EDDFC4 0%, #D9BF95 100%)',
                    }}>
                        <CloudUpload sx={{color: 'primary.main', fontSize: 28}}/>
                    </Box>
                    <Typography color="text.secondary">
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
                <Button variant="contained" color={'secondary'} onClick={() => {
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
