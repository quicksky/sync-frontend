import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './LoginPage';
import SuccessPage from './SuccessPage';
import PrivateRoute from "./PrivateRoute";
import Onboarding from "./Onboarding";
import {alpha, createTheme, CssBaseline, SxProps, Theme, ThemeProvider} from "@mui/material";
import SettingsPage from "./SettingsPage";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Worker} from "@react-pdf-viewer/core";
import ResetPassword from "./ResetPassword";
import PasswordResetForm from "./PasswordResetForm";


const NAVY = "#20202E";
const NAVY_DEEP = "#0B1729";
const NAVY_MID = "#1B2A47";
const BORDER = "rgba(21, 34, 56, 0.08)";
const GOLD = "#D9BF95";
const GOLD_LIGHT = "#EDDFC4";
const SECONDARY_DARK = "#A67C42";
const GREEN_MAIN = "#16A34A";

// Shared gradient / elevation tokens so pages/components can reuse the same
// depth language instead of inventing one-off shadows and gradients.
export const GRADIENT_NAVY = `linear-gradient(160deg, ${NAVY_MID} 0%, ${NAVY_DEEP} 100%)`;
export const GRADIENT_NAVY_SOFT = `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`;
export const GRADIENT_GOLD = `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 55%, ${SECONDARY_DARK} 100%)`;
export const SHADOW_SM = "0 1px 2px rgba(11, 23, 41, 0.06), 0 1px 3px rgba(11, 23, 41, 0.08)";
export const SHADOW_MD = "0 6px 16px rgba(11, 23, 41, 0.08), 0 2px 6px rgba(11, 23, 41, 0.05)";
export const SHADOW_LG = "0 20px 45px rgba(11, 23, 41, 0.18), 0 8px 18px rgba(11, 23, 41, 0.10)";
export const SHADOW_GOLD = "0 10px 24px rgba(166, 124, 66, 0.28)";
// Spacing for a DialogContent that holds a form. Two MUI quirks to work around:
// DialogContent clips its overflow, and MUI zeroes its top padding when it follows
// a DialogTitle (`.MuiDialogTitle-root + &` — two classes, so the extra class here
// is what outranks it). An outlined label rises ~9px above the input border once it
// shrinks, so a topmost field needs that headroom back or its top gets clipped.
// Units are required: bare numbers go through the spacing scale (14 would be 112px).
// Pair with `pb: 0` on the DialogTitle — this is then the whole gap under the title.
export const DIALOG_CONTENT_SX = {
    "&.MuiDialogContent-root": {paddingTop: "14px", paddingBottom: "16px"},
};

// Aligns the action buttons with DialogContent's 24px side padding instead of
// MUI's default 8px, and keeps the bottom from ballooning.
export const DIALOG_ACTIONS_SX = {px: 3, pb: 2};

// Checkboxes check to navy (see the MuiCheckbox override) so they stay on the
// navy/gold palette. The admin table's transaction approval checkbox is the one
// exception — there the checked state means "approved", so it keeps the green.
export const CHECKBOX_APPROVED_SX: SxProps<Theme> = {
    "&.Mui-checked": {
        color: GREEN_MAIN,
    },
    "&.Mui-checked:hover": {
        backgroundColor: alpha(GREEN_MAIN, 0.08),
    },
};
// Scroll frame for the settings tables. The header row renders in its own
// non-scrolling element so the scrollbar starts below it rather than running up
// alongside it; both elements reserve a scrollbar gutter so their columns stay
// aligned without measuring scrollbar width in JS. Tables inside the frame need
// `tableLayout: fixed` plus a shared <colgroup> to line up.
export const TABLE_FRAME_SX: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    flex: "0 1 auto",
    minHeight: 0,
    overflow: "hidden",
};
export const TABLE_FRAME_HEAD_SX: SxProps<Theme> = {
    flexShrink: 0,
    overflowX: "hidden",
    overflowY: "auto",
    scrollbarGutter: "stable",
};
export const TABLE_FRAME_BODY_SX: SxProps<Theme> = {
    flex: "1 1 auto",
    minHeight: 0,
    overflowX: "hidden",
    overflowY: "auto",
    scrollbarGutter: "stable",
};

export const PAGE_BACKGROUND =
    "radial-gradient(circle at 12% -10%, rgba(217, 191, 149, 0.12) 0%, rgba(217, 191, 149, 0) 45%), " +
    "radial-gradient(circle at 100% 0%, rgba(32, 32, 46, 0.06) 0%, rgba(32, 32, 46, 0) 40%), #F4F6F9";

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
        borderRadius: 12,
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
                html: {
                    overscrollBehaviorY: "none",
                },
                body: {
                    background: PAGE_BACKGROUND,
                    backgroundAttachment: "fixed",
                    overscrollBehaviorY: "none",
                },
                "*::selection": {
                    backgroundColor: alpha(GOLD, 0.45),
                    color: NAVY_DEEP,
                },
                "*": {
                    scrollbarWidth: "thin",
                    scrollbarColor: `${alpha(NAVY, 0.24)} ${alpha(NAVY, 0.04)}`,
                },
                "*::-webkit-scrollbar": {
                    width: 8,
                    height: 8,
                },
                "*::-webkit-scrollbar-track": {
                    backgroundColor: alpha(NAVY, 0.04),
                    borderRadius: 8,
                },
                "*::-webkit-scrollbar-thumb": {
                    backgroundImage: `linear-gradient(180deg, ${alpha(NAVY, 0.26)} 0%, ${alpha(NAVY_MID, 0.20)} 100%)`,
                    borderRadius: 8,
                    transition: "background-image 0.15s ease",
                },
                "*::-webkit-scrollbar-thumb:hover": {
                    backgroundImage: `linear-gradient(180deg, ${GOLD} 0%, ${SECONDARY_DARK} 100%)`,
                },
                "*::-webkit-scrollbar-corner": {
                    backgroundColor: "transparent",
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 8,
                    paddingBottom: 8,
                    transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
                    "&:active": {
                        transform: "translateY(0)",
                    },
                },
                contained: {
                    boxShadow: SHADOW_SM,
                    "&:hover": {
                        boxShadow: SHADOW_MD,
                        transform: "translateY(-1px)",
                    },
                    "&.Mui-disabled": {
                        boxShadow: "none",
                    },
                },
                containedPrimary: {
                    backgroundImage: GRADIENT_NAVY_SOFT,
                    "&:hover": {
                        backgroundImage: GRADIENT_NAVY,
                    },
                    "&.Mui-disabled": {
                        backgroundImage: "none",
                    },
                },
                containedSecondary: {
                    backgroundImage: GRADIENT_GOLD,
                    color: NAVY,
                    boxShadow: SHADOW_GOLD,
                    "&:hover": {
                        backgroundImage: GRADIENT_GOLD,
                        filter: "brightness(0.97)",
                        boxShadow: SHADOW_GOLD,
                    },
                    "&.Mui-disabled": {
                        backgroundImage: "none",
                    },
                },
                outlined: {
                    borderWidth: 1.5,
                    "&:hover": {
                        borderWidth: 1.5,
                    },
                },
                text: {
                    "&:hover": {
                        backgroundColor: alpha(NAVY, 0.05),
                    },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    transition: "background-color 0.15s ease, transform 0.15s ease",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
                elevation1: {
                    border: `1px solid ${BORDER}`,
                    boxShadow: SHADOW_MD,
                },
            },
        },
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                colorPrimary: {
                    backgroundImage: GRADIENT_NAVY,
                    color: "#FFFFFF",
                    boxShadow: SHADOW_LG,
                    position: "relative",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 2,
                        backgroundImage: GRADIENT_GOLD,
                        opacity: 0.9,
                    },
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
                    backgroundImage: "linear-gradient(180deg, #FBFCFE 0%, #F5F7FB 100%)",
                    color: "#64748B",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    borderBottom: `1px solid ${BORDER}`,
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: "background-color 0.12s ease",
                    "&:last-child td": {
                        borderBottom: 0,
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                    // A spread ring (0 0 0 Npx) is not notched like the outline is, so it
                    // draws straight through the floating label. Use a soft drop glow instead.
                    "&.Mui-focused": {
                        boxShadow: `0 4px 14px ${alpha(SECONDARY_DARK, 0.20)}`,
                    },
                    "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
                        borderColor: SECONDARY_DARK,
                        borderWidth: 1.5,
                    },
                    "&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(NAVY, 0.28),
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    "&.Mui-focused:not(.Mui-error)": {
                        color: SECONDARY_DARK,
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                icon: {
                    color: alpha(NAVY, 0.45),
                    transition: "transform 0.2s ease, color 0.15s ease",
                },
                iconOpen: {
                    color: SECONDARY_DARK,
                },
            },
        },
        // Menus render in a portal, so their surface can only be reached from the
        // theme or a per-instance MenuProps — never from an `sx` on the field.
        MuiMenu: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    border: `1px solid ${BORDER}`,
                    boxShadow: SHADOW_LG,
                    marginTop: 4,
                    // MuiPaper's root override forces `backgroundImage: none`; the extra
                    // class raises specificity so the gradient survives it.
                    "&.MuiPaper-root": {
                        backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #FBFCFE 100%)",
                    },
                },
                list: {
                    paddingTop: 6,
                    paddingBottom: 6,
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    marginLeft: 6,
                    marginRight: 6,
                    borderRadius: 8,
                    paddingTop: 7,
                    paddingBottom: 7,
                    fontSize: "0.9rem",
                    transition: "background-color 0.12s ease, color 0.12s ease",
                    "& .MuiListItemIcon-root": {
                        minWidth: 32,
                        color: alpha(NAVY, 0.55),
                    },
                    "&:hover, &.Mui-focusVisible": {
                        backgroundColor: alpha(NAVY, 0.05),
                    },
                    "&.Mui-selected": {
                        backgroundColor: alpha(GOLD, 0.22),
                        color: NAVY_DEEP,
                        fontWeight: 600,
                    },
                    "&.Mui-selected:hover, &.Mui-selected.Mui-focusVisible": {
                        backgroundColor: alpha(GOLD, 0.32),
                    },
                    "&.Mui-selected .MuiListItemIcon-root": {
                        color: SECONDARY_DARK,
                    },
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
                    borderRadius: 20,
                    boxShadow: SHADOW_LG,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: NAVY_DEEP,
                    borderRadius: 8,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    padding: "6px 10px",
                    boxShadow: SHADOW_MD,
                },
                arrow: {
                    color: NAVY_DEEP,
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
                        color: NAVY_MID,
                    },
                    "&:hover": {
                        backgroundColor: alpha(SECONDARY_DARK, 0.08),
                    },
                    "&.Mui-checked:hover": {
                        backgroundColor: alpha(NAVY_MID, 0.08),
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
