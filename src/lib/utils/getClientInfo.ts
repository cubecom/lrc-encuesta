import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
import { IP_API } from "../../constants/app.contant";
import { UAParser } from "ua-parser-js";

export const getClientInfo = async () => {
  const parser = new UAParser();
  const result = parser.getResult();

  const deviceInfo = {
    browser: result.browser.name || "",
    browser_version: result.browser.version || "",
    os: result.os.name || "",
    os_version: result.os.version || "",
    device: result.device.type || "Desktop",
    device_vendor: result.device.vendor || "",
    device_model: result.device.model || "",
    language: navigator.language || "",
    user_agent: navigator.userAgent || "",
  };

  try {
    const response = await fetch(IP_API);
    const ipInfo = await response.json();

    return {
      ...deviceInfo,
      ip_address: ipInfo?.ip || "",
      city: ipInfo?.city || "",
      region: ipInfo?.region || "",
      country: ipInfo?.country_name || "",
    };
  } catch {
    return {
      ...deviceInfo,
      ip_address: "",
      city: "",
      region: "",
      country: "",
    };
  }
};
