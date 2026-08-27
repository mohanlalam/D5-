/**
 * Authentication & Security Controller
 * D5 IPL Fantasy Platform
 */

import { storageService } from "../services/storageService.js";

export const authController = {
  login(req, res) {
    const { password } = req.body;
    const currentPw = storageService.getEditorPassword();

    if (password === currentPw) {
      return res.json({
        success: true,
        message: "Editor privileges granted",
        isEditor: true,
        sessionToken: "d5_session_" + Buffer.from(Date.now().toString()).toString("base64"),
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid editor PIN / password",
    });
  },

  changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const actualPw = storageService.getEditorPassword();

    if (currentPassword !== actualPw) {
      return res.status(403).json({
        success: false,
        message: "Current password does not match",
      });
    }

    if (!newPassword || newPassword.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 3 characters long",
      });
    }

    storageService.setEditorPassword(newPassword.trim());
    return res.json({
      success: true,
      message: "Editor password successfully updated",
    });
  },
};
