import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './LoginPage';
import SuccessPage from './SuccessPage';
import PrivateRoute from "./PrivateRoute";
import Onboarding from "./Onboarding";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import SettingsPage from "./SettingsPage";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Worker} from "@react-pdf-viewer/core";
import ResetPassword from "./ResetPassword";
import PasswordResetForm from "./PasswordResetForm";


const NAVY = "#20202E";
const BORDER = "rgba(21, 34, 56, 0.08)";
const SECONDARY_DARK = "#A67C42";
const GREEN_MAIN = "#22C55E";

declare module "@mui/material/styles" {
    interface Palette {
        green: Palette["primary"];
    }

    interface PaletteOptions {
        green?: PaletteOptions["primary"];
    }
}

export const theme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: "#F4F6F9",
            paper: "#FFFFFF",
        },
        primary: {
            main: NAVY,
            light: "#3C557A",
            dark: "#0B1729",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#D9BF95",
            light: "#EDDFC4",
            dark: SECONDARY_DARK,
            contrastText: NAVY,
        },
        green: {
            main: GREEN_MAIN,
            light: "#4ADE80",
            dark: "#15803D",
            contrastText: "#FFFFFF",
        },
        text: {
            primary: "#152238",
            secondary: "#64748B",
        },
        divider: BORDER,
    },
    shape: {
        borderRadius: 10,
    },
    typography: {
        fontFamily: [
            "Inter",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            "sans-serif",
        ].join(","),
        h1: {fontWeight: 800},
        h2: {fontWeight: 800},
        h3: {fontWeight: 700},
        h4: {fontWeight: 700},
        h5: {fontWeight: 700},
        h6: {fontWeight: 700},
        button: {
            fontWeight: 600,
            textTransform: "none",
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#F4F6F9",
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    paddingLeft: 16,
                    paddingRight: 16,
                },
                contained: {
                    boxShadow: "none",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
                elevation1: {
                    boxShadow:
                        "0 1px 2px rgba(21, 34, 56, 0.04), 0 1px 8px rgba(21, 34, 56, 0.06)",
                },
            },
        },
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: NAVY,
                    color: "#FFFFFF",
                    boxShadow: "0 1px 3px rgba(11, 23, 41, 0.24)",
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: `1px solid ${BORDER}`,
                    backgroundImage: "none",
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${BORDER}`,
                },
                head: {
                    backgroundColor: "#F8FAFC",
                    color: "#64748B",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&:last-child td": {
                        borderBottom: 0,
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                color: "secondary",
            },
        },
        MuiFormControl: {
            defaultProps: {
                color: "secondary",
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: SECONDARY_DARK,
                    "&.Mui-checked": {
                        color: GREEN_MAIN,
                    },
                },
            },
        },
    },
});


function App() {
    return (
        <Worker workerUrl={'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'}>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Router>
                            <Routes>
                                <Route path="" element={<LoginPage/>}/>
                                <Route path="/home" element={<PrivateRoute element={<SuccessPage/>}/>}/>
                                <Route path="/settings" element={<PrivateRoute element={<SettingsPage/>}/>}/>
                                <Route path="/welcome" element={<Onboarding/>}/>
                                <Route path="/resetPassword" element={<ResetPassword/>}/>
                                <Route path="/forgotPassword" element={<PasswordResetForm/>}/>
                            </Routes>
                        </Router>
                    </LocalizationProvider>
                </CssBaseline>
            </ThemeProvider>
        </Worker>

    );
}

export default App;
