import Cookies from "js-cookie";

export const getCookieValue = (cookieName: string): string | null => {
    if (typeof document === "undefined") {
        return null;
    }
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [name, value] = cookie.split("=");
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    return null;
};

export const deleteCookie = (name: string) => {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
};

export const bakeCookie = (name: string, value: string, expDate?: string) => {
    document.cookie = `${name}=${value}; ${
        expDate ? `expires=${expDate}` : ""
    }`;
};


export const clearCookies = () =>{
    const allCookies = Cookies.get(); // Gets all cookies as an object
      Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName);
      });
}
