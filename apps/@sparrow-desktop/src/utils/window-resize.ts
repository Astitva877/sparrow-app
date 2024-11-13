import { platform } from "@tauri-apps/plugin-os";
import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";

export const resizeWindowOnLogin = async () => {
  const isMaximized = await getCurrentWindow().isMaximized();
  if (!isMaximized) {
    const platformName = await platform();
    if (platformName == "macos") {
      const resizeButton = document.getElementById("resize-button");
      if (resizeButton) {
        resizeButton.click();
      }
    } else {
      await getCurrentWindow().maximize();
    }
  }
};

export const resizeWindowOnLogOut = async () => {
  const isMaximized = await getCurrentWindow().isMaximized();
  if (isMaximized) {
    const monitor = await currentMonitor();
    const monitorPhysicalSize = await getCurrentWindow().innerSize();
    const scaleFactor = monitor!.scaleFactor;
    const logicalSize = monitorPhysicalSize.toLogical(scaleFactor);

    const minWidth = 570;
    const maxWidth = 570;
    const minHeight = 700;
    const maxHeight = 700;

    if (logicalSize.width < minWidth) {
      logicalSize.width = minWidth;
    }
    if (logicalSize.width > maxWidth) {
      logicalSize.width = maxWidth;
    }
    if (logicalSize.height < minHeight) {
      logicalSize.height = minHeight;
    }
    if (logicalSize.height > maxHeight) {
      logicalSize.height = maxHeight;
    }
    await getCurrentWindow().setSize(logicalSize);
    await getCurrentWindow().center();
  }
};
