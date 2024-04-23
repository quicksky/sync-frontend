import {useMediaQuery} from "react-responsive";

export const isMobile = (): boolean => {
    return useMediaQuery({maxWidth: 500})
}