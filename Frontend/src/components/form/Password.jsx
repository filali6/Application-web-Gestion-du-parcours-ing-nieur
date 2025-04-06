import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { updateStudentPassword } from "services/student";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const validationSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Old password is required"),
  newPassword: Yup.string()
    .min(5, "Password must be at least 5 characters")
    .required("New password is required")
    .notOneOf(
      [Yup.ref("oldPassword")],
      "New password must be different from old password"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const PasswordForm = ({ studentId, onSuccess, onCancel }) => {
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleClickShowPassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleSubmit = async (values, { setFieldError, resetForm }) => {
    const token = localStorage.getItem("token");

    try {
      const response = await updateStudentPassword(
        studentId,
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
        token
      );

      if (response.message === "Mot de passe modifié avec succès.") {
        Swal.fire({
          title: "Success",
          text: "Password updated successfully!",
          icon: "success",
        });
        resetForm();
        onSuccess();
      } else {
        // Gestion spécifique des erreurs du backend
        if (response.message === "L'ancien mot de passe est incorrect.") {
          setFieldError("oldPassword", "Old password is incorrect");
        } else {
          Swal.fire({
            title: "Error",
            text: response.message || "An error occurred",
            icon: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error updating password:", error);
      let errorMessage = "An error occurred while updating the password";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
        if (errorMessage === "L'ancien mot de passe est incorrect.") {
          setFieldError("oldPassword", "Old password is incorrect");
          return;
        }
      }

      Swal.fire({
        title: "Server Error",
        text: errorMessage,
        icon: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 350,
        mx: "auto",
        p: 0,
        mb: 2,
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" mb={4} textAlign="left" fontWeight="normal">
          Update Password
        </Typography>

        <Formik
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, errors, touched, handleBlur }) => (
            <Form>
              <Grid container spacing={1.5}>
                {/* Old Password Field */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    name="oldPassword"
                    type={showPassword.oldPassword ? "text" : "password"}
                    label="Old Password"
                    value={values.oldPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.oldPassword && Boolean(errors.oldPassword)}
                    helperText={touched.oldPassword && errors.oldPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() =>
                              handleClickShowPassword("oldPassword")
                            }
                            edge="end"
                            size="small"
                          >
                            {showPassword.oldPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f9f9f9",
                        borderRadius: "4px",
                        border: "1px solid #f1f1f1",
                        height: "36px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#d4e8e8 !important",
                          boxShadow: "0 0 0 2px rgba(237, 255, 255, 0.5)",
                        },
                      },
                    }}
                  />
                </Grid>

                {/* New Password Field */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    name="newPassword"
                    type={showPassword.newPassword ? "text" : "password"}
                    label="New Password"
                    value={values.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.newPassword && Boolean(errors.newPassword)}
                    helperText={touched.newPassword && errors.newPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() =>
                              handleClickShowPassword("newPassword")
                            }
                            edge="end"
                            size="small"
                          >
                            {showPassword.newPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f9f9f9",
                        borderRadius: "4px",
                        border: "1px solid #f1f1f1",
                        height: "36px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#d4e8e8 !important",
                          boxShadow: "0 0 0 2px rgba(237, 255, 255, 0.5)",
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Confirm Password Field */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    name="confirmPassword"
                    type={showPassword.confirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.confirmPassword && Boolean(errors.confirmPassword)
                    }
                    helperText={
                      touched.confirmPassword && errors.confirmPassword
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() =>
                              handleClickShowPassword("confirmPassword")
                            }
                            edge="end"
                            size="small"
                          >
                            {showPassword.confirmPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f9f9f9",
                        borderRadius: "4px",
                        border: "1px solid #f1f1f1",
                        height: "36px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#d4e8e8 !important",
                          boxShadow: "0 0 0 2px rgba(237, 255, 255, 0.5)",
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Buttons */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        px: 2,
                        py: 0.5,
                        fontSize: "0.875rem",
                        borderColor: "#ccc",
                        color: "#333",
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        px: 2,
                        py: 0.5,
                        fontSize: "0.875rem",
                        backgroundColor: "#4da3bdb6",
                        "&:hover": {
                          backgroundColor: "#4da3bdb6",
                        },
                      }}
                    >
                      Update
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default PasswordForm;
